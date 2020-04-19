# Types (WIP)

TODO

## Type casting and validation

When an argument has its type declared in the schema, its inputs will be casted to the type. If the input and the type are incompatible, it ignores setting the input and throws a warning.

```less
/?query=
  posts(limit:3.5).
    title
```

<a href="https://newapi.getpop.org/api/graphql/?query=posts(limit:3.5).title">View query results</a>
