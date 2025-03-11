'use strict';

/**
 * Payment controller for custom routes
 */

// Using destructuring to directly access the factories property
const { factories } = require('@strapi/strapi');
const { createCoreController } = factories;

module.exports = createCoreController('api::payment.payment', ({ strapi }) => ({
  // Create a payment for an order
  async createPayment(ctx) {
    const { orderId } = ctx.params;
    const { amount, payment_method, transaction_id } = ctx.request.body;
    
    if (!amount || !payment_method) {
      return ctx.badRequest('Amount and payment method are required');
    }

    try {
      // Check if order exists
      const order = await strapi.entityService.findOne('api::order.order', orderId, {
        populate: ['payment', 'quote_request'],
      });

      if (!order) {
        return ctx.notFound('Order not found');
      }

      // Check if payment already exists for this order
      if (order.payment) {
        return ctx.badRequest('Payment already exists for this order');
      }

      // Create invoice number
      const invoiceNumber = `INV-${Date.now()}`;

      // Create payment
      const payment = await strapi.entityService.create('api::payment.payment', {
        data: {
          amount,
          payment_method,
          transaction_id,
          invoice_number: invoiceNumber,
          payment_status: 'completed',
          payment_date: new Date(),
          order: orderId,
          publishedAt: new Date()
        },
      });

      return payment;
    } catch (err) {
      return ctx.badRequest('Could not create payment', { error: err });
    }
  },

  // Get payments for the current user
  async findMyPayments(ctx) {
    const userId = ctx.state.user.id;
    
    const payments = await strapi.db.query('api::payment.payment').findMany({
      where: {
        order: {
          quote_request: {
            user: userId,
          },
        },
      },
      populate: ['order', 'order.quote_request'],
      orderBy: { createdAt: 'desc' },
    });

    return payments;
  },
}));
