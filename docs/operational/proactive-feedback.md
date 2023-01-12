# (*) Proactive Feedback

GraphQL servers usually do not offer good contextual information when running queries, because the GraphQL spec does not force them (or even suggest) to do so. This is evident concerning deprecations, where deprecation data is shown only [through introspection](http://spec.graphql.org/June2018/#sec-Deprecation), by querying fields `isDeprecated` and `deprecationReason` on the `Field` and `Enum` types:

```graphql
{
  __type(name: "Account") {
    name
    fields {
      name
      isDeprecated
      deprecationReason
    }
  }
}
```

The response will be:

```json
{
  "data": {
    "__type": {
      "name": "Account",
      "fields": [
        {
          "name": "id",
          "isDeprecated": false,
          "deprecationReason": null
        },
        {
          "name": "surname",
          "isDeprecated": true,
          "deprecationReason": "Use `personSurname`"
        },
        {
          "name": "personSurname",
          "isDeprecated": false,
          "deprecationReason": null
        }
      ]
    }
  }
}
```

However, when running a query involving a deprecated field, like this one:

```graphql
query GetSurname {
  account(id: 1) {
    surname
  }
}
```

...the deprecation information will not appear in the response:

```json
{
  "data": {
    "account": {
      "surname": "Owens"
    }
  }
}
```

This means that the developer executing the query must actively execute introspection queries to find out if the schema was upgraded and any field deprecated. That may happen maybe once in a long while? Quite possibly never?

## Providing proactive feedback

GraphQL by PoP addresses this deficiency by making use of the wildcard top-level entry `extensions`, which allows to extend the protocol as needed. Under this entry, when running any query, GraphQL by PoP may send data through the following feedback entries:

- `deprecations`
- `warnings`
- `logs`
- `notices`
- `traces`

Because they are sent on the response to the query itself, and not just during introspection, this data is valuable to developers of the API-consuming application to understand how to better interact with the API.

Let's explore these entries.

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

<!-- ::: details View PQL query

```less
/?query=
  posts.
    title|
    isPublished
```

[<a href="https://newapi.getpop.org/api/graphql/?query=posts.title%7CisPublished">View query results</a>]

::: -->

## Warnings

Warning are issues which can be considered non-blocking, i.e. they enhance the query but do not break it. While in standard GraphQL they would be considered errors, GraphQL by PoP takes a more lenient approach towards them, by ignoring their execution only, and not the whole query.

For instance, passing parameter `limit` with the wrong type will not stop execution of the query, it will just ignore this parameter (hence, the response will bring more results that are needed, but that's not a breaking issue) and provide an appropriate `warning` message.

Executing [this query](https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20posts(pagination:{limit%3A3.5})%20%7B%0A%20%20%20%20title%0A%20%20%7D%0A%7D):

```graphql
query {
  posts(pagination: { limit: 3.5 }) {
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

<!-- ::: details View PQL query

```less
/?query=
  posts(pagination: { limit:3.5 }).
    title
```

[<a href="https://newapi.getpop.org/api/graphql/?query=posts(pagination:{limit:3.5}).title">View query results</a>]

::: -->

## Logs

Any resolver (for fields and directives) can log any piece of information, as to provide the developer with useful information to debug the application.

::: tip Showing logs in the response
Logs are retrieved by passing parameter `actions[]=show-logs` to the GraphQL endpoint `/api/graphql/`.
:::

In [this query](https://newapi.getpop.org/graphiql/?show_logs=1&query=query%20%7B%0A%20%20post(by:{id%3A1})%20%7B%0A%20%20%20%20title%20%40traceExecutionTime%0A%20%20%7D%0A%7D), directive `@traceExecutionTime` informs the execution time of resolving the field through the log:

```graphql
query {
  post(by:{id:1}) {
    title @traceExecutionTime
  }
}
```

::: tip Showing logs in the response
This query calls the GraphiQL client with parameter `show_logs=true`, and then GraphiQL sets `actions[]=show-logs` on the endpoint.
:::

<!-- ::: details View PQL query

```less
/?
actions[]=show-logs&
postId=1&
query=
  post(by:{id:$postId}).
    title<traceExecutionTime>
```

[<a href="https://newapi.getpop.org/api/graphql/?actions[]=show-logs&postId=1&query=post(by:{id:$postId}).title<traceExecutionTime>">View query results</a>]

::: -->

## Notices

TODO

## Traces

TODO
