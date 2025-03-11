'use strict';

/**
 * Order controller for custom routes
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
  // Assign a contractor to an order
  async assignContractor(ctx) {
    const { id } = ctx.params;
    const { contractorId } = ctx.request.body;
    
    if (!contractorId) {
      return ctx.badRequest('Contractor ID is required');
    }

    try {
      const order = await strapi.entityService.update('api::order.order', id, {
        data: {
          contractor: contractorId,
          status: 'assigned',
          assigned_date: new Date(),
        },
      });

      return order;
    } catch (err) {
      return ctx.badRequest('Could not assign contractor to order', { error: err });
    }
  },

  // Update the order status
  async updateStatus(ctx) {
    const { id } = ctx.params;
    const { status, progress_updates } = ctx.request.body;
    
    const validStatuses = ['in_progress', 'completed', 'cancelled', 'issue_reported'];
    
    if (!validStatuses.includes(status)) {
      return ctx.badRequest(`Invalid status. Status must be one of: ${validStatuses.join(', ')}`);
    }

    try {
      let updateData = { status };

      // Add progress updates if provided
      if (progress_updates) {
        const order = await strapi.entityService.findOne('api::order.order', id, {
          populate: ['progress_updates'],
        });
        
        let existingUpdates = order.progress_updates || [];
        if (!Array.isArray(existingUpdates)) {
          existingUpdates = [];
        }
        
        const newUpdate = {
          date: new Date(),
          status,
          notes: progress_updates,
        };
        
        updateData.progress_updates = [...existingUpdates, newUpdate];
      }

      // Set completion date if status is completed
      if (status === 'completed') {
        updateData.completion_date = new Date();
      }

      const updatedOrder = await strapi.entityService.update('api::order.order', id, {
        data: updateData,
      });

      return updatedOrder;
    } catch (err) {
      return ctx.badRequest('Could not update order status', { error: err });
    }
  },

  // Get orders for the current user (customer)
  async findMyOrders(ctx) {
    const userId = ctx.state.user.id;
    
    const orders = await strapi.entityService.findMany('api::order.order', {
      filters: {
        quote_request: {
          user: userId,
        },
      },
      populate: ['quote_request', 'contractor', 'payment'],
      sort: { createdAt: 'desc' },
    });

    return orders;
  },

  // Get orders for the current contractor
  async findMyAssignments(ctx) {
    const userId = ctx.state.user.id;
    
    // First find the contractor profile associated with this user
    const contractors = await strapi.entityService.findMany('api::contractor.contractor', {
      filters: {
        user: userId,
      },
    });

    if (!contractors || contractors.length === 0) {
      return ctx.notFound('Contractor profile not found');
    }

    const contractorId = contractors[0].id;
    
    const orders = await strapi.entityService.findMany('api::order.order', {
      filters: {
        contractor: contractorId,
      },
      populate: ['quote_request', 'quote_request.user', 'payment'],
      sort: { createdAt: 'desc' },
    });

    return orders;
  },
}));
