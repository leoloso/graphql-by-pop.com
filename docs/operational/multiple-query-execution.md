# Multiple-Query Execution

GraphQL by PoP can execute multiple queries in a single operation.

![Executing queries independently, and then all together as a single operation](/images/executing-multiple-queries.gif)

This functionality is currently not part of the GraphQL spec, but it has been requested:

- [[RFC] Executing multiple operations in a query](https://github.com/graphql/graphql-spec/issues/375)
- [[RFC] exporting variables between queries](https://github.com/graphql/graphql-spec/issues/377)

This feature improves performance, for whenever we need to execute an operation against the GraphQL server, then wait for its response, and then use that result to perform another operation. By combining them together, we are saving this extra request.

This is not [query batching](https://www.apollographql.com/blog/query-batching-in-apollo-63acfd859862/). When doing query batching, the GraphQL server executes multiple queries in a single request. But those queries are still independent from each other. They just happen to be executed one after the other, to avoid the latency from multiple requests.

In this case, all queries are combined together, and executed as a single operation. That means that they will reuse their state and their data. For instance, if a first query fetches some data, and a second query also accesses the same data, this data is retrieved only once, not twice.

When running <a href="https://newapi.getpop.org/graphiql/?query=%23%20Run%20this%20query%20to%20execute%20all%20other%20queries%2C%20together%0Aquery%20__ALL%20%7B%20id%20%7D%0A%0Aquery%20GetUserData%20%7B%0A%20%20users%20%7B%0A%20%20%20%20name%0A%20%20%20%20posts%20%7B%0A%20%20%20%20%20%20title%0A%20%20%20%20%20%20url%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A%0Aquery%20GetPostData%20%7B%0A%20%20posts%20%7B%0A%20%20%20%20title%0A%20%20%20%20url%0A%20%20%20%20author%20%7B%0A%20%20%20%20%20%20name%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D&operationName=__ALL">this query</a> (selecting query with name `"__ALL"`), the same data for entities of type `Post` and `User` is referenced by the 2 queries, and this data is retrieved from the database only once.

```graphql
query GetUserData {
  users {
    name
    posts {
      title
      url
    }
  }
}

query GetPostData {
  posts {
    title
    url
    author {
      name
    }
  }
}
```

::: tip

GraphiQL currently [does not allow](https://github.com/graphql/graphiql/issues/1635) to execute multiple queries as a single operation. 

To overcome this problem, if the operation name is `__ALL`, then the GraphQL server will execute all the submitted queries.

Then, attach the following query to the GraphiQL editor:

```query __ALL { id }```

And select this one when clicking on the "Run" button.

:::

The [`@export` directive](export) additionally enables to have the results of a query injected as an input into another query. Running <a href="https://newapi.getpop.org/graphiql/?query=%23%20Run%20this%20query%20to%20execute%20all%20other%20queries%2C%20together%0Aquery%20__ALL%20%7B%20id%20%7D%0A%0A%23%20Export%20the%20user%27s%20name%0Aquery%20GetUserName%20%7B%0A%20%20user(by:{id%3A1})%20%7B%0A%20%20%20%20name%20%40export(as%3A%20%22_search%22)%0A%20%20%7D%0A%7D%0A%0A%23%20Search%20for%20posts%20with%20the%20user%27s%20name%20from%20the%20previous%20query%0Aquery%20SearchPosts(%24_search%3A%20String%20%3D%20%22%22)%20%7B%0A%20%20posts(searchfor%3A%20%24_search)%20%7B%0A%20%20%20%20title%0A%20%20%7D%0A%7D&operationName=__ALL">this query</a> to see how the user's name obtained in the first query is used to search for posts in the second query.

```graphql
# Export the user's name
query GetUserName {
  user(by: { id: 1 }) {
    name @export(as: "_search")
  }
}

# Search for posts with the user's name from the previous query
query SearchPosts($_search: String = "") {
  posts(filter: { search: $_search }) {
    title
  }
}
```
