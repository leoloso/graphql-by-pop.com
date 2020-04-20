# (*) Types

TODO

## Type casting and validation

When an argument has its type declared in the schema, its inputs will be casted to the type. If the input and the type are incompatible, it ignores setting the input and throws a warning.

```graphql
query {
  posts(limit:3.5) {
    title
  }
}
```

[<a href="https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20posts(limit%3A3.5)%20%7B%0A%20%20%20%20title%0A%20%20%7D%0A%7D">View query results</a>]

::: details View PQL query

```less
/?query=
  posts(limit:3.5).
    title
```

[<a href="https://newapi.getpop.org/api/graphql/?query=posts(limit:3.5).title">View query results</a>]

:::
