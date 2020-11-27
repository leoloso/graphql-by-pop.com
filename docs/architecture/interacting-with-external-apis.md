# Interacting with external APIs through directives

Our GraphQL API may need to interact with external services (think of Stripe for payments, Slack for notifications, AWS S3 for hosting assets, and others).

As we've seen above, directives can be used to override the response of a field. But where does the new value come from? It could come from some local function, but it could perfectly well also originate from some external service (as for directive `@translate` we've seen earlier on, which retrieves the new value from the Google Translate API).

For this reason, GraphQL API has decided to make it easy for directives to communicate with external APIs, enabling those services to transform the data from the WordPress site when executing a query, such as for:

- translation
- image compression
- sourcing through a CDN
- sending emails, SMS and Slack notifications

As a matter of fact, GraphQL API has decided to make directives as powerful as possible, by making them [low-level components](./directive-design.html) in the server's architecture, even having the query resolution itself be based on a [directive pipeline](./directive-pipeline.html). This grants directives the power to perform authorizations, validations, and modification of the response, among others.


