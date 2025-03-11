module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/orders/my-orders',
      handler: 'order.findMyOrders',
    },
    {
      method: 'GET',
      path: '/orders/my-assignments',
      handler: 'order.findMyAssignments',
    },
    {
      method: 'PUT',
      path: '/orders/:id/assign-contractor',
      handler: 'order.assignContractor',
    },
    {
      method: 'PUT',
      path: '/orders/:id/status',
      handler: 'order.updateStatus',
    },
  ],
};
