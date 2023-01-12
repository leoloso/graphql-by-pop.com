# (*) @translate

Directive `@translate` executes a translation of a field using the API service under field argument `provider`, or using the default provider if this field argument is empty.

Currently, only the implementation for Google Translate has been done.

Running [this query](https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20posts(pagination:{limit%3A3})%20%7B%0A%20%20%20%20title%0A%20%20%20%20spanish%3A%20title%20%40translate(from%3A%20%22en%22%2C%20to%3A%20%22es%22)%0A%20%20%7D%0A%7D):

```graphql
query {
  posts(pagination: { limit:3 }) {
    title
    spanish: title @translate(from: "en", to: "es")
  }
}
```

...produces this response:

```json
{
  "data": {
    "posts": [
      {
        "title": "Scheduled by Leo",
        "spanish": "Programado por Leo"
      },
      {
        "title": "COPE with WordPress: Post demo containing plenty of blocks",
        "spanish": "COPE con WordPress: Publicar demo que contiene muchos bloques"
      },
      {
        "title": "A lovely tango, not with leo",
        "spanish": "Un tango encantador, no con leo."
      }
    ]
  }
}
```

<!-- ::: details View PQL queries

```less
//1. @translate calls the Google Translate API
/?query=
  posts(pagination:{ limit:5 }).
    title|
    title@spanish<
      translate(from:en,to:es)
    >

//2. Translate to Spanish and back to English
/?query=
  posts(pagination:{ limit:5 }).
    title|
    title@translateAndBack<
      translate(from:en,to:es),
      translate(from:es,to:en)
    >

//3. Change the provider through arguments (link gives error: Azure is not implemented)
/?query=
  posts(pagination:{ limit:5 }).
    title|
    title@spanish<
      translate(from:en,to:es,provider:azure)
    >
```

[View results: <a href="https://newapi.getpop.org/api/graphql/?query=posts(pagination:{limit:5}).title%7Ctitle@spanish%3Ctranslate(from:en,to:es)%3E">query #1</a>, <a href="https://newapi.getpop.org/api/graphql/?query=posts(pagination:{limit:5}).title%7Ctitle@translateAndBack%3Ctranslate(from:en,to:es),translate(from:es,to:en)%3E">query #2</a>, <a href="https://newapi.getpop.org/api/graphql/?query=posts(pagination:{limit:5}).title%7Ctitle@spanish%3Ctranslate(from:en,to:es,provider:azure)%3E">query #3</a>]

::: -->
