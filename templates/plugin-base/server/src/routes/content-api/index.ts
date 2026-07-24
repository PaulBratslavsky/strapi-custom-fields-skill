// Boilerplate example route. Custom-field-only plugins do not need a
// content-api route — remove this route (leave `routes: []`) along with the
// controller and service unless the plugin actually serves API requests.
export default () => ({
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/',
      // name of the controller file & the method.
      handler: 'controller.index',
      config: {
        policies: [],
      },
    },
  ],
});
