module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/quote-requests/mine',
      handler: 'quote-request.findMine',
    },
    {
      method: 'PUT',
      path: '/quote-requests/:id/status',
      handler: 'quote-request.updateStatus',
    },
  ],
};
