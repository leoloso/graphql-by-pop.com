# PQL - PoP Query Language

The PQL (PoP Query Language) is the URL-based query syntax natively adopted by [PoP](https://github.com/leoloso/PoP) (the component model over which GraphQL by PoP is based). Based on the GraphQL syntax, the PQL attempts to address the issues produced by sending the query through the body of the request, as dony by GraphQL, by sending the query as a URL parameter instead.

PQL is a superset of GQL (the Graph Query Language), hence every query written in GQL can also be written in PQL. GraphQL by PoP supports PQL natively, and GQL by converting it into PQL after parsing the query. The developer can choose to execute queries against the GraphQL by PoP server using either syntax.

## URL-based queries

While the standard GraphQL query is sent in the body of the request, the PQL is sent through the URL. This has the following advantages:

- It enables HTTP/server-side caching
- It removes the need for a client-side library to manipulate the query, improving performance and reducing amount of code to maintain
- The API can be consumed directly in the browser, without the need for tooling (such as GraphiQL)
- It enables to use standards. For instance, use GET operations whenever appropriate (instead of always POST), pass variables through URL params, execute file uploads passing the data through the body, etc

```less
?query=...
```

## PQL syntax

The syntax in PQL is a re-imagining of the GraphQL syntax, supporting all the required elements (field names, arguments, variables, aliases, fragments and directives), however designed to be easy to both read and write in a single line, so the developer can already code the query in the browser without depending on special tooling.

It looks like this:

```less
?query=query1,query2,query3&variable1=value&fragment1=fragmentQuery
```

Each query has this shape:

```less
fieldName(fieldArgs)@alias<fieldDirective(directiveArgs)>
```

To make it clear to visualize, the query can be split into several lines:

```less
fieldName(
  fieldArgs
)@alias<
  fieldDirective(
    directiveArgs
  )
>
```

::: tip
Firefox already handles the multi-line query: Copy/pasting it into the URL bar works perfectly. Chrome and Safari, though, require to strip all the whitespaces and line returns before pasting the query into the URL bar.
:::

## Syntax elements

The PQL syntax has the following elements:

- `(key:value)` or `(value)`: Arguments (for fields/directives)
- `[key:value]` or `[value]`: Array
- `$`: Variable
- `@`: Alias
- `.`: Advance query relationship
- `,`: Fetch another query, starting from the root
- `|`: Fetch another field from the same query node
- `<...>`: Directive
- `%...%`: Directive expression
- `--`: Fragment

Example:

```less
/?
query=
  posts(
    filter: { ids: [1, 1499, 1178] },
    order: $order
  )@posts.
    id|
    date(format: d/m/Y)|
    title<
      skip(if: false)
    >|
    --props&
order=title|ASC&
props=
  url|
  author.
    name|
    url
```

[<a href="https://newapi.getpop.org/api/graphql/?order=title%7CASC&amp;props=url%7Cauthor.name%7Curl&amp;query=posts(filter:{ids:%5B1,1499,1178%5D},order:%24order)@posts.id%7Cdate(format:d/m/Y)%7Ctitle<skip(if:false)>%7C--props">View query results</a>]
