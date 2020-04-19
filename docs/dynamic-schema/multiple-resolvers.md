# Multiple Resolvers (WIP)

Fields and directives can be satisfied by many resolvers, and on runtime it is decided which resolver will handle the field or directive.

## Multiple resolvers per field

In the example below, field `excerpt` does not normally support field arg `length`, however a new resolver adds support for this field arg, and it is enabled by passing field arg `branch: experimental`:

```graphql
#1. Standard behaviour
query {
  posts {
    excerpt
  }
}

#2. New feature not yet available
query {
  posts {
    excerpt(length: 30)
  }
}

#3. New feature available under experimental branch
query {
  posts {
    excerpt(
      length: 30,
      branch: experimental
    )
  }
}
```

[View results: <a href="https://newapi.getpop.org/graphiql/?query=%231.%20Standard%20behaviour%0Aquery%20%7B%0A%20%20posts%20%7B%0A%20%20%20%20excerpt%0A%20%20%7D%0A%7D">query #1</a>, <a href="https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20posts%20%7B%0A%20%20%20%20excerpt(length%3A%2030)%0A%20%20%7D%0A%7D">query #2</a>, <a href="https://newapi.getpop.org/graphiql/?query=%233.%20New%20feature%20available%20under%20experimental%20branch%0Aquery%20%7B%0A%20%20posts%20%7B%0A%20%20%20%20excerpt(%0A%20%20%20%20%20%20length%3A%2030%2C%0A%20%20%20%20%20%20branch%3A%20experimental%0A%20%20%20%20)%0A%20%20%7D%0A%7D">query #3</a>]

::: details View PQL queries

```less
//1. Standard behaviour
/?query=
  posts.
    excerpt

//2. New feature not yet available
/?query=
  posts.
    excerpt(length: 30)

//3. New feature available under experimental branch
/?query=
  posts.
    excerpt(
      length: 30,
      branch: experimental
    )
```

[View results: <a href="https://newapi.getpop.org/api/graphql/?query=posts.excerpt">query #1</a>, <a href="https://newapi.getpop.org/api/graphql/?query=posts.excerpt(length:30)">query #2</a>, <a href="https://newapi.getpop.org/api/graphql/?query=posts.excerpt(length:30,branch:experimental)">query #3</a>]

:::

## Multiple resolvers per directive

TODO
