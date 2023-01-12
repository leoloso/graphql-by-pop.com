# (*) Fields

TODO

## Custom fields

Use custom fields to expose your data and create a single, comprehensive, unified graph.

The example below implements the same logic as the case above, however coding the logic through fields (instead of through the query):

```graphql
# 1. Inspect services
query {
  meshServices
}

# 2. Retrieve data
query {
  meshServiceData
}

# 3. Process data
query {
  contentMesh
}

# 4. Customize data
query {
  contentMesh(
    githubRepo: "getpop/api-graphql",
    weatherZone: "AKZ017",
    photoPage: 3
  )
}
```

[View results: <a href="https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20meshServices%0A%7D">query #1</a>, <a href="https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20meshServiceData%0A%7D">query #2</a>, <a href="https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20contentMesh%0A%7D">query #3</a>, <a href="https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20contentMesh(%0A%20%20%20%20githubRepo%3A%20%22getpop%2Fapi-graphql%22%2C%0A%20%20%20%20weatherZone%3A%20%22AKZ017%22%2C%0A%20%20%20%20photoPage%3A%203%0A%20%20)%0A%7D">query #4</a>]

<!-- ::: details View PQL queries

```less
// 1. Inspect services
/?query=
  meshServices

// 2. Retrieve data
/?query=
  meshServiceData

// 3. Process data
/?query=
  contentMesh

// 4. Customize data
/?query=
  contentMesh(
    githubRepo: "getpop/api-graphql",
    weatherZone: AKZ017,
    photoPage: 3
  )@contentMesh
```

[View results: <a href="https://newapi.getpop.org/api/graphql/?query=meshServices">query #1</a>, <a href="https://newapi.getpop.org/api/graphql/?query=meshServiceData">query #2</a>, <a href="https://newapi.getpop.org/api/graphql/?query=contentMesh">query #3</a>, <a href="https://newapi.getpop.org/api/graphql/?query=contentMesh(githubRepo:%22getpop/api-graphql%22,weatherZone:AKZ017,photoPage:3)@contentMesh">query #4</a>]

::: -->
