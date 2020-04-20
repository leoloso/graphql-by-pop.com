# (*) Execution Caching

The `@cache` directive enables to cache the result of a heavy-to-compute operation. The first time the field is resolved, the `@cache` directive will save the value in disk or memory (Redis, Memcached), either with an expiry date or not, and from then on whenever querying this field the cached value will be retrieved and the operation will not be performed.

For instance, [this query](https://newapi.getpop.org/graphiql/?show_logs=true&query=query%20%7B%0A%20%20posts(limit%3A3)%20%7B%0A%20%20%20%20id%0A%20%20%20%20title%20%40translate(from%3A%22en%22%2C%20to%3A%22es%22)%0A%20%20%7D%0A%7D) executes the `@translate` directive, which does a single connection to the Google Translate API and performs the translation of the posts' titles:

```graphql
query {
  posts(limit:3) {
    id
    title @translate(from:"en", to:"es")
  }
}
```

Assuming this is an expensive call, we can cache the field's value after the first response. [This query](https://newapi.getpop.org/graphiql/?show_logs=true&query=query%20%7B%0A%20%20posts(limit%3A3)%20%7B%0A%20%20%20%20id%0A%20%20%20%20title%20%40translate(from%3A%22en%22%2C%20to%3A%22es%22)%20%40cache(time%3A10)%0A%20%20%7D%0A%7D) achieves that through the `@cache` directive, passing a time expiration of 10 seconds (not passing this value, the cache does not expire):

```graphql
query {
  posts(limit:3) {
    id
    title @translate(from:"en", to:"es") @cache(time:10)
  }
}
```

::: tip
Directives in GraphQL are applied in order, so the following queries are different:

- `title @translate @cache`
- `title @cache @translate`

In the 1st case, it executes `@translate` and then `@cache`, so the translation is being cached; in the 2 case, it executes `@cache` and then `@translate`, so the caching only stores the value of the `title` field and not its translation.
:::

The first time we execute the query, we obtain this response:

![1st execution of query with @cache directive](/images/cache-directive-1st-run.png "1st execution of query with @cache directive")

The 2nd time, executing the same query within 10 seconds, we obtain the same response, but a log also informs us that the value is coming from the cache:

![2nd execution of query with @cache directive](/images/cache-directive-2nd-run.png "2nd execution of query with @cache directive")

::: tip
Showing logs in the response is enabled by passing parameter `show_logs=true` to the GraphiQL client, which sets parameter `actions[]=show-logs` to the GraphQL endpoint `/api/graphql/`
:::

Please notice how the log indicates which are the items that have been cached. If we increase field `post`'s `limit` to 6, and run again within 10 seconds, the already-cached 3 items will be retrieved from the cache, and the other 3, which had not been cached yet, will be retrieved fresh through Google Translate:

![3rd execution of query with @cache directive](/images/cache-directive-3rd-run.png "3rd execution of query with @cache directive")

If we run it again, now all 6 items will be cached:

![4th execution of query with @cache directive](/images/cache-directive-4th-run.png "4th execution of query with @cache directive")
