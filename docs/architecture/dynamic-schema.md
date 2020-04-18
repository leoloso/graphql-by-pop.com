# Dynamic schema

## Many resolvers per field

Fields can be satisfied by many resolvers.

In the example below, field `excerpt` does not normally support field arg `length`, however a new resolver adds support for this field arg, and it is enabled by passing field arg `branch:experimental`:

```less
//1. Standard behaviour
/?query=
  posts.
    excerpt

//2. New feature not yet available
/?query=
  posts.
    excerpt(length: 30)

//3. New feature available under
// experimental branch
/?query=
  posts.
    excerpt(
      length: 30,
      branch: experimental
    )
```

[View results: <a href="https://newapi.getpop.org/api/graphql/?query=posts.excerpt">query #1</a>, <a href="https://newapi.getpop.org/api/graphql/?query=posts.excerpt(length:30)">query #2</a>, <a href="https://newapi.getpop.org/api/graphql/?query=posts.excerpt(length:30,branch:experimental)">query #3</a>]

Advantages:

- The data model can be customized for client/project
- Teams become autonoumous, and can avoid the bureaucracy of communicating/planning/coordinating changes to the schema
- Rapid iteration, such as allowing a selected group of testers to try out new features in production
- Quick bug fixing, such as fixing a bug specifically for a client, without worrying about breaking changes for other clients
- Field-based versioning
