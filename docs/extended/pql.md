# PoP Query Language (PQL)

The PQL (PoP Query Language) is the URL-based query syntax natively adopted by [PoP](https://github.com/leoloso/PoP) (the component model over which GraphQL by PoP is based). Based on the GraphQL syntax, the PQL attempts to address the issues produced by sending the query through the body of the request, as dony by GraphQL, by sending the query as a URL parameter instead.

PQL is a subset of GQL (the Graph Query Language), hence every query written in GQL can also be written in PQL. GraphQL by PoP supports PQL natively, and GQL by converting it into PQL after parsing the query. The developer can choose to execute queries against the GraphQL by PoP server using either syntax.

## URL-based queries

While the standard GraphQL query is sent in the body of the request, the PQL is sent through the URL. This has the following advantages:

- It enables server-side caching
- It removes the need for a client-side library to manipulate the query, leading to performance improvements and reduced amount of code to maintain
- The API becomes easier to consume. For instance, we can visualize the results of the query directly on the browser, without depending on GraphiQL

```
?query=...
```

## Similar but different query syntax

The syntax in PQL is a re-imagining of the GraphQL syntax, supporting all the required elements (field names, arguments, variables, aliases, fragments and directives), however designed to be easy to both read and write in a single line, so the developer can already code the query in the browser without depending on special tooling.

It looks like this:

```
?query=query1,query2,query3&variable1=value&fragment1=fragmentQuery
```

Each query has this shape:

```
fieldName(fieldArgs)@alias<fieldDirective(directiveArgs)>
```

To make it clear to visualize, the query can be split into several lines:

```pql
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
