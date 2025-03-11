module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/complaints/my-complaints',
      handler: 'complaint.findMyComplaints',
    },
    {
      method: 'PUT',
      path: '/complaints/:id/assign-admin',
      handler: 'complaint.assignAdmin',
    },
    {
      method: 'PUT',
      path: '/complaints/:id/resolve',
      handler: 'complaint.resolveComplaint',
    },
    {
      method: 'PUT',
      path: '/complaints/:id/close',
      handler: 'complaint.closeComplaint',
    },
  ],
};
