# Fields (WIP)

TODO

## Custom fields

Use custom fields to expose your data and create a single, comprehensive, unified graph.

The example below implements the same logic as the case above, however coding the logic through fields (instead of through the query):

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

<a href="https://newapi.getpop.org/api/graphql/?query=meshServices">View query results #1</a>

<a href="https://newapi.getpop.org/api/graphql/?query=meshServiceData">View query results #2</a>

<a href="https://newapi.getpop.org/api/graphql/?query=contentMesh">View query results #3</a>

<a href="https://newapi.getpop.org/api/graphql/?query=contentMesh(githubRepo:%22getpop/api-graphql%22,weatherZone:AKZ017,photoPage:3)@contentMesh">View query results #4</a>
