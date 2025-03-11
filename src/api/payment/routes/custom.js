module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/payments/order/:orderId',
      handler: 'payment.createPayment',
    },
    {
      method: 'GET',
      path: '/payments/my-payments',
      handler: 'payment.findMyPayments',
    },
  ],
};
