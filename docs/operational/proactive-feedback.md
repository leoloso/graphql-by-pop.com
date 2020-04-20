# (*) Proactive Feedback

TODO

## Deprecations

Deprecations are returned in the same query involving deprecated fields, and not only when doing introspection.

For instance, running [this query](https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20posts%20%7B%0A%20%20%20%20title%0A%20%20%20%20isPublished%0A%20%20%7D%0A%7D):

```graphql
query {
  posts {
    title
    isPublished
  }
}
```

...produces response:

```json
{
  "extensions": {
    "deprecations": [
      {
        "message": "Use 'isStatus(status:published)' instead of 'isPublished'",
        "extensions": {
          ...
        }
      }
    ]
  },
  "data": {
    "posts": [
      ...
    ]
  }
}
```

::: details View PQL query

```less
/?query=
  posts.
    title|
    isPublished
```

[<a href="https://newapi.getpop.org/api/graphql/?query=posts.title%7CisPublished">View query results</a>]

:::

## Warnings

Warning are issues which can be considered non-blocking, i.e. they enhance the query but do not break it. While in standard GraphQL they would be considered errors, GraphQL by PoP takes a more lenient approach towards them, by ignoring their execution only, and not the whole query.

For instance, passing parameter `limit` with the wrong type will not stop execution of the query, it will just ignore this parameter (hence, the response will bring more results that are needed, but that's not a breaking issue) and provide an appropriate `warning` message.

Executing [this query](https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20posts(limit%3A3.5)%20%7B%0A%20%20%20%20title%0A%20%20%7D%0A%7D):

```graphql
query {
  posts(limit:3.5) {
    title
  }
}
```

...produces this response:

```json
{
  "extensions": {
    "warnings": [
      {
        "message": "For field 'posts', casting value '3.5' for argument 'limit' to type 'int' failed, so it has been ignored",
        "extensions": {
          ...
        }
      }
    ]
  },
  "data": {
    "posts": [
      ...
    ]
  }
}
```

::: details View PQL query

```less
/?query=
  posts(limit:3.5).
    title
```

[<a href="https://newapi.getpop.org/api/graphql/?query=posts(limit:3.5).title">View query results</a>]

:::

## Logs

Any resolver (for fields and directives) can log any piece of information, as to provide the developer with useful information to debug the application.

::: tip Showing logs in the response
Logs are retrieved by passing parameter `actions[]=show-logs` to the GraphQL endpoint `/api/graphql/`.
:::

In [this query](https://newapi.getpop.org/graphiql/?show_logs=1&query=query%20%7B%0A%20%20post(id%3A1)%20%7B%0A%20%20%20%20title%20%40traceExecutionTime%0A%20%20%7D%0A%7D), directive `@traceExecutionTime` informs the execution time of resolving the field through the log:

```graphql
query {
  post(id:1) {
    title @traceExecutionTime
  }
}
```

::: tip Showing logs in the response
This query calls the GraphiQL client with parameter `show_logs=true`, and then GraphiQL sets `actions[]=show-logs` on the endpoint.
:::

::: details View PQL query

```less
/?
actions[]=show-logs&
$postId=1&
query=
  post(id:$postId).
    title<traceExecutionTime>
```

[<a href="https://newapi.getpop.org/api/graphql/?actions[]=show-logs&postId=1&query=post(id:$postId).title<traceExecutionTime>">View query results</a>]

:::
