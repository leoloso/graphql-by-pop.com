# (*) Persisted Fragments and Persisted Queries

TODO

## Persisted fragments

Query sections of any size and shape can be stored in the server. It is like the persisted queries mechanism provided by GraphQL, but more granular: different persisted fragments can be added to the query, or a single fragment can itself be the query.

The example below demonstrates, once again, the same logic from the example above, but coded and stored as persisted fields:

```less
// 1. Save services
/?query=
  --meshServices

// 2. Retrieve data
/?query=
  --meshServiceData

// 3. Process data
/?query=
  --contentMesh

// 4. Customize data
/?
githubRepo=getpop/api-graphql&
weatherZone=AKZ017&
photoPage=3&
query=
  --contentMesh
```

[View results: <a href="https://newapi.getpop.org/api/graphql/?query=--meshServices">query #1</a>, <a href="https://newapi.getpop.org/api/graphql/?query=--meshServiceData">query #2</a>, <a href="https://newapi.getpop.org/api/graphql/?query=--contentMesh">query #3</a>, <a href="https://newapi.getpop.org/api/graphql/?githubRepo=getpop/api-graphql&amp;weatherZone=AKZ017&amp;photoPage=3&amp;query=--contentMesh">query #4</a>]

## Persisted queries

Queries can also be persisted in the server, then we can just publish queries and disable access to the GraphQL server, increasing the security.

In the `query` field, instead of passing the query, we pass a persisted query name, preceded with `!`:

```less
// 1. Access persisted query
/?query=
  !contentMesh

// 2. Customize it with variables
/?
githubRepo=getpop/api-graphql&
weatherZone=AKZ017&
photoPage=3&
query=
  !contentMesh
```

[View results: <a href="https://newapi.getpop.org/api/graphql/?query=!contentMesh">query #1</a>, <a href="https://newapi.getpop.org/api/graphql/?githubRepo=getpop/api-graphql&amp;weatherZone=AKZ017&amp;photoPage=3&amp;query=!contentMesh">query #2</a>]
