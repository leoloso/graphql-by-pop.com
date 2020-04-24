# Tracing

The `@traceExecutionTime` directive tracks how much time it takes to resolve a field (including all the involved directives), and adds the result under entry `extensions.traces` in the response.

As an example, we can use it to measure how fast is the `@translate` directive (which connects to the Google Translation API), and how fast it is after applying `@cache` to the translation (so that it doesn't connect to the external API anymore). For that, we execute [this query](https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20posts(limit%3A3)%20%7B%0A%20%20%20%20id%0A%20%20%20%20title%20%40translate(from%3A%22en%22%2C%20to%3A%22es%22)%20%40cache(time%3A10)%20%40traceExecutionTime%0A%20%20%7D%0A%7D) with `@traceExecutionTime` first, and within 10 seconds again:

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

## Configuration

### Environment variables

| Environment variable | Description | Default |
| --- | --- | --- |
| `SHOW_TRACES_IN_RESPONSE` | Print the traces under entry `extensions.traces` | `false` |
