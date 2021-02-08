# (*) Interacting with external APIs through directives

Our GraphQL API may need to interact with external services (think of Stripe for payments, Slack for notifications, AWS S3 for hosting assets, and others).

Directives can be used to override the response of a field. But where does the new value come from? It could come from some local function, but it could perfectly well also originate from some external service.

For this reason, GraphQL by PoP has decided to make it easy for directives to communicate with external APIs. This is accomplished by making directives be [low-level components](./directive-design.html) in the server's architecture, and having the engine's query resolution be based on a [directive pipeline](./directive-pipeline.html).

## Connecting to a 3rd-party service via a directive

TODO
