# (*) @translate

Example calling the Google Translate API from the back-end, as coded within directive `@translate`:

```less
//1. @translate calls the Google Translate API
/?query=
  posts(limit:5).
    title|
    title@spanish<
      translate(en,es)
    >

//2. Translate to Spanish and back to English
/?query=
  posts(limit:5).
    title|
    title@translateAndBack<
      translate(en,es),
      translate(es,en)
    >

//3. Change the provider through arguments
// (link gives error: Azure is not implemented)
/?query=
  posts(limit:5).
    title|
    title@spanish<
      translate(en,es,provider:azure)
    >
```

<a href="https://newapi.getpop.org/api/graphql/?query=posts(limit:5).title%7Ctitle@spanish%3Ctranslate(en,es)%3E">View query results #1</a>

<a href="https://newapi.getpop.org/api/graphql/?query=posts(limit:5).title%7Ctitle@translateAndBack%3Ctranslate(en,es),translate(es,en)%3E">View query results #2</a>

<a href="https://newapi.getpop.org/api/graphql/?query=posts(limit:5).title%7Ctitle@spanish%3Ctranslate(en,es,provider:azure)%3E">View query results #3</a>

