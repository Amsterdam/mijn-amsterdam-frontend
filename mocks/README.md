# Adding a router

1. Add your endpoint in `/routes`. See example 1 below:
```javascript
  // Example 1
  {
    id: 'get-wpi-aanvragen',  // <--- let's call this value a
    url: `${settings.MOCK_BASE_PATH}/wpi-koppel-api/wpi/uitkering/aanvragen`,
    method: 'GET',
    variants: [
      {
        id: 'standard',  // <-------------------- and this b
        type: 'json',
        options: {
          status: 200,
          body: RESPONSES.AANVRAGEN,
        },
      },
    ],
  },
```
2. Add the id inside `collections.json` of form `a:b` (see example 1 above)
3. Add to the `hit-endpoints.js` test script.


# Adding to the test script

When adding a route with custom logic like with [Middlware][1] or with a your own [Variant Handler][2]...<br>
Or a complex route containing something like `/:profile(user|company)`.
Please also create a way to hit this endpoint in `CUSTOM_REQUESTS` which is found in the `hit-all-endpoints.js` script.<br>
This is necessary because the script cannot automatically determine how to interact with such endpoints, unlike simpler 'GET JSON in all cases' endpoints.


# Testing your route

1. Turn on the mocks server.
2. Look inside the logging, that is the `Display logs` option in the TUI.
2. Run `node mocks/hit-endpoints.js` (if in project root directory).
3. No errors? All is good.


# Structure

/routes   | Define your routes here. This is also a good place to look for examples.<br>
/handlers | Here are custom handlers defined for when you have some repeated middleware logic.<br>
/fixtures | Here you can add reusable or large data to be used in endpoint responses.<br>


# Links

- [Mocks Server](https://www.mocks-server.org/docs/overview/)
- [Middleware][1]
- [Variant Handlers][2]

[1]: https://www.mocks-server.org/docs/usage/variants/middleware/
[2]: https://www.mocks-server.org/docs/variant-handlers/intro/
