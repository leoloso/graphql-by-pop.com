# @removeIfNull

When retrieving data through [GraphQL](https://graphql.org), we may sometimes want to remove a field from the response when its value is `null`. However, GraphQL currently [does not support this feature](https://github.com/graphql/graphql-spec/issues/476). So GraphQL by PoP provides this functionality through the custom directive `@removeIfNull`.

Notice how, when running [this query](https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20posts(pagination:{limit%3A2})%20%7B%0A%20%20%20%20id%0A%20%20%20%20title%0A%20%20%20%20featuredImageOrNothing%3A%20featuredImage%20%40removeIfNull%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20src%0A%20%20%20%20%7D%0A%20%20%20%20featuredImage%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20src%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D):

```graphql
query {
  posts(pagination: { limit:2 }) {
    id
    title
    featuredImageOrNothing: featuredImage @removeIfNull {
      id
      src
    }
    featuredImage {
      id
      src
    }
  }
}
```

...the response for the first item doesn't have field `featuredImageOrNothing` (since `featuredImage` is `null`), but the second item does:

```json
{
  "data": {
    "posts": [
      {
        "id": 1153,
        "title": "Scheduled by Leo",
        "featuredImage": null
      },
      {
        "id": 1499,
        "title": "COPE with WordPress: Post demo containing plenty of blocks",
        "featuredImageOrNothing": {
          "id": 1647,
          "src": "https://nextapi.getpop.org/wp/wp-content/uploads/2019/08/IMG_2482.jpg"
        },
        "featuredImage": {
          "id": 1647,
          "src": "https://nextapi.getpop.org/wp/wp-content/uploads/2019/08/IMG_2482.jpg"
        }
      }
    ]
  }
}
```
