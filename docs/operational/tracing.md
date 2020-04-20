# Tracing

The `@traceExecutionTime` directive tracks how much time it takes to resolve a field (including all the involved directives), and adds the result to the log in the response.

::: warning Structure logging not yet available
Currently, the results from tracing are delivered only through logs in the response to the query. However, the captured logs should also be stored in a structured way, as to be able to analyze them, as proposed by Principled GraphQL's ["Structured Logging" principle](https://principledgraphql.com/operations#9-structured-logging).

This new feature is tackled through [this issue](https://github.com/getpop/trace-tools/issues/1).
:::

::: details Tip: How to show logs in the response
Logs are retrieved by passing parameter `show_logs=true` to the GraphiQL client, which sets parameter `actions[]=show-logs` to the GraphQL endpoint `/api/graphql/`
:::

As an example, we can use it to measure how fast is the `@translate` directive (which connects to the Google Translation API), and how fast it is after applying `@cache` to the translation (so that it doesn't connect to the external API anymore). For that, we execute [this query](https://newapi.getpop.org/graphiql/?show_logs=true&query=query%20%7B%0A%20%20posts(limit%3A3)%20%7B%0A%20%20%20%20id%0A%20%20%20%20title%20%40translate(from%3A%22en%22%2C%20to%3A%22es%22)%20%40cache(time%3A10)%20%40traceExecutionTime%0A%20%20%7D%0A%7D) with `@traceExecutionTime` first, and within 10 seconds again:

```graphql
query {
  posts(limit:3) {
    id
    title @translate(from:"en", to:"es") @cache(time:10) @traceExecutionTime
  }
}
```

For the first execution, the logs inform us that resolving the field containing the `@translate` directive took 80.111 milliseconds to execute:

![1st execution of query with @cache and @traceExecutionTime directives](/images/cache-logtime-directives-1st-run.png "1st execution of query with @cache and @traceExecutionTime directives")

For the second execution, the logs indicate that the field was resolved in less than 1 millisecond:

![2nd execution of query with @cache and @traceExecutionTime directives](/images/cache-logtime-directives-2nd-run.png "2nd execution of query with @cache and @traceExecutionTime directives")

The `@traceExecutionTime` directive then shows that caching results improve the performance of the API.
