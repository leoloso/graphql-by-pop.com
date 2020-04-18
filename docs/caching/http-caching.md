# HTTP caching (PQL only)

Through the [Cache Control](https://github.com/getpop/cache-control) package, GraphQL by PoP caches the response from the query using standard [HTTP caching](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching). This works when sending the query with [PQL](https://graphql-by-pop.com/docs/extended/pql.html) only, but not using GQL (the standard GraphqL Query Language).

::: details Why is HTTP caching not supported for GQL?
HTTP caching relies on the URL being a unique identifier of the request. GraphQL, however, submits all queries against the same endpoint, and passing the query in the body of the request through a POST operation, instead of a GET. Then, GraphQL queries cannot be distinguished from each other, and hence cannot be cached.

PQL doesn't have this issue because it is URL-based, so executing 2 queries will be done through 2 different URLs, and these can be uniquely identified and cached.
:::

The response will contain a `Cache-Control` header with the `max-age` value set at the time (in seconds) to cache the request, or `no-store` if the request must not be cached. Each field in the schema can configure its own `max-age` value, and the response's `max-age` is calculated as the lowest `max-age` among all requested fields (including [composable fields](https://graphql-by-pop.com/docs/extended/pql-language-features.html#composable-fields)).

## How it works

A directive `<cacheControl>` is added to the [directive pipeline](https://graphql-by-pop.com/docs/architecture/the-directive-pipeline.html) for all fields. This directive is configured a `max-age` value for each field, and adds a `Cache-Control` header to the response with the lowest `max-age` value from all the requested fields in the query, or `no-store` if any field has `max-age`: 0.

## Examples

::: tip
Click on the links below, and inspect the response headers using Chrome or Firefox's developer tools' Network tab to see the `Cache-Control` header.
:::

Operators have a `max-age` of 1 year:

```less
/?query=
  echo(Hello world!)
```

[<a href="https://newapi.getpop.org/api/graphql/?query=echo(Hello+world!)">View query results</a>]

By default, fields have a `max-age` of 1 hour:

```less
/?query=
  echo(Hello world!)|
  posts.
    title
```

[<a href="https://newapi.getpop.org/api/graphql/?query=echo(Hello+world!)|posts.title">View query results</a>]

Composed fields are also taken into account when computing the lowest `max-age`:

```less
/?query=
  echo(posts())
```

[<a href="https://newapi.getpop.org/api/graphql/?query=echo(posts())">View query results</a>]

`"time"` field is not to be cached (max-age: 0):

```less
/?query=
  time
```

[<a href="https://newapi.getpop.org/api/graphql/?query=time">View query results</a>]

### How to not cache a response

If the response is cacheable, but we need to fetch a fresh response, we can avoid the response from being cached through these 2 ways:

1. Add field `"time"` to the query:

```less
/?query=
  time|
  echo(Hello world!)|
  posts.
    title
```

[<a href="https://newapi.getpop.org/api/graphql/?query=time|echo(Hello+world!)|posts.title">View query results</a>]

2. Override the default `maxAge` configuration for a field, by adding argument `maxAge: 0` to directive `<cacheControl>` on any field in the query:

```less
/?query=
  echo(Hello world!)|
  posts.
    title<cacheControl(maxAge:0)>
```

[<a href="https://newapi.getpop.org/api/graphql/?query=echo(Hello+world!)|posts.title<cacheControl(maxAge:0)>">View query results</a>]
