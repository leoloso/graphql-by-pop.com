# (*) Directive Design

Directives play an important role: they allow to implement those features which are not natively-supported by the [GraphQL spec](https://spec.graphql.org/) or by the GraphQL server itself. Directives can then help fill the void in terms of functionality, so that the API can satisfy its requirements, either known or unknown ones.

For this reason, directives are an extremely important element within the foundations of the GraphQL server. GraphQL by PoP relies on a sound and solid architectural design for directives, which enables it to become both extensible and powerful.

## Directive as Foundational Blocks

TODO

## The Directive Pipeline

TODO

## Efficient directive calls

Directives receive all their affected objects and fields together, for a single execution.

In the examples below, the Google Translate API is called the minimum possible amount of times to execute multiple translations:

```less
// The Google Translate API is called once,
// containing 10 pieces of text to translate:
// 2 fields (title and excerpt) for 5 posts
/?query=
  posts(limit:5).
    --props|
    --props@spanish<
      translate(en,es)
    >&
props=
  title|
  excerpt

// Here there are 3 calls to the API, one for
// every language (Spanish, French and German),
// 10 strings each, all calls are concurrent
/?query=
  posts(limit:5).
    --props|
    --props@spanish<
      translate(en,es)
    >|
    --props@french<
      translate(en,fr)
    >|
    --props@german<
      translate(en,de)
    >&
props=
  title|
  excerpt
```

<a href="https://newapi.getpop.org/api/graphql/?query=posts(limit:5).--props%7C--props@spanish<translate(en,es)>&amp;props=title%7Cexcerpt">View query results #1</a>

<a href="https://newapi.getpop.org/api/graphql/?query=posts(limit:5).--props%7C--props@spanish%3Ctranslate(en,es)%3E%7C--props@french%3Ctranslate(en,fr)%3E%7C--props@german%3Ctranslate(en,de)%3E&amp;props=title%7Cexcerpt">View query results #2</a>
