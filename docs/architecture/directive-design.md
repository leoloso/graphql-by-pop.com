# Directive Design (WIP)

TODO

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
