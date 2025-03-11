'use strict';

/**
 * Quote Request controller for custom routes
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::quote-request.quote-request', ({ strapi }) => ({
  // Create a new quote request
  async create(ctx) {
    // Set the user from the authenticated session
    ctx.request.body.data.user = ctx.state.user.id;
    ctx.request.body.data.status = 'pending';
    
    // Let the default controller handle the creation
    const response = await super.create(ctx);
    return response;
  },

  // Admin approval or rejection of quote
  async updateStatus(ctx) {
    const { id } = ctx.params;
    const { status, admin_notes, quote_amount } = ctx.request.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return ctx.badRequest('Invalid status. Status must be either "approved" or "rejected"');
    }

    try {
      const quoteRequest = await strapi.entityService.update('api::quote-request.quote-request', id, {
        data: {
          status,
          admin_notes,
          quote_amount,
          approval_date: status === 'approved' ? new Date() : null,
        },
      });

      // If approved, create an order automatically
      if (status === 'approved') {
        const orderNumber = `ORD-${Date.now()}`;
        await strapi.entityService.create('api::order.order', {
          data: {
            order_number: orderNumber,
            status: 'assigned',
            quote_request: id,
            assigned_date: new Date(),
            publishedAt: new Date()
          },
        });
      }

      return quoteRequest;
    } catch (err) {
      return ctx.badRequest('Could not update quote request', { error: err });
    }
  },

  // Get quote requests for the current user
  async findMine(ctx) {
    const userId = ctx.state.user.id;
    
    const quoteRequests = await strapi.entityService.findMany('api::quote-request.quote-request', {
      filters: {
        user: userId,
      },
      populate: ['category', 'order'],
      sort: { createdAt: 'desc' },
    });

    return quoteRequests;
  },
}));
