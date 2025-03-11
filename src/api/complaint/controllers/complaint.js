'use strict';

/**
 * Complaint controller for custom routes
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::complaint.complaint', ({ strapi }) => ({
  // Create a complaint
  async create(ctx) {
    const { orderId } = ctx.request.body;
    
    if (!orderId) {
      return ctx.badRequest('Order ID is required');
    }

    try {
      // Check if the order exists and belongs to the user
      const order = await strapi.entityService.findOne('api::order.order', orderId, {
        populate: ['quote_request.user'],
      });

      if (!order) {
        return ctx.notFound('Order not found');
      }

      // Check if the order belongs to the current user
      if (order.quote_request.user.id !== ctx.state.user.id) {
        return ctx.forbidden('You do not have permission to submit a complaint for this order');
      }

      // Create the complaint
      ctx.request.body.data = {
        ...ctx.request.body,
        user: ctx.state.user.id,
        order: orderId,
        status: 'submitted',
        submission_date: new Date(),
      };
      
      // Let the default controller handle the creation
      const response = await super.create(ctx);
      
      // Update the order status to "issue_reported"
      await strapi.entityService.update('api::order.order', orderId, {
        data: {
          status: 'issue_reported',
        },
      });
      
      return response;
    } catch (err) {
      return ctx.badRequest('Could not create complaint', { error: err });
    }
  },

  // Assign admin to handle a complaint
  async assignAdmin(ctx) {
    const { id } = ctx.params;
    const { adminId } = ctx.request.body;
    
    if (!adminId) {
      return ctx.badRequest('Admin ID is required');
    }

    try {
      const complaint = await strapi.entityService.update('api::complaint.complaint', id, {
        data: {
          assigned_admin: adminId,
          status: 'assigned',
        },
      });

      return complaint;
    } catch (err) {
      return ctx.badRequest('Could not assign admin to complaint', { error: err });
    }
  },

  // Resolve a complaint
  async resolveComplaint(ctx) {
    const { id } = ctx.params;
    const { resolution_notes } = ctx.request.body;
    
    if (!resolution_notes) {
      return ctx.badRequest('Resolution notes are required');
    }

    try {
      const complaint = await strapi.entityService.update('api::complaint.complaint', id, {
        data: {
          resolution_notes,
          status: 'resolved',
          resolution_date: new Date(),
        },
      });

      return complaint;
    } catch (err) {
      return ctx.badRequest('Could not resolve complaint', { error: err });
    }
  },

  // Close a complaint
  async closeComplaint(ctx) {
    const { id } = ctx.params;
    
    try {
      const complaint = await strapi.entityService.update('api::complaint.complaint', id, {
        data: {
          status: 'closed',
        },
      });

      return complaint;
    } catch (err) {
      return ctx.badRequest('Could not close complaint', { error: err });
    }
  },

  // Get complaints for the current user
  async findMyComplaints(ctx) {
    const userId = ctx.state.user.id;
    
    const complaints = await strapi.entityService.findMany('api::complaint.complaint', {
      filters: {
        user: userId,
      },
      populate: ['order', 'assigned_admin'],
      sort: { createdAt: 'desc' },
    });

    return complaints;
  },
}));
