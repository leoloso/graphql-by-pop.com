# Directive Design

Directives play an important role: they allow to implement those features which are not natively-supported by the [GraphQL spec](https://spec.graphql.org/) or by the GraphQL server itself. Directives can then help fill the void in terms of functionality, so that the API can satisfy its requirements, either known or unknown ones.

For this reason, directives are an extremely important element within the foundations of the GraphQL server. GraphQL by PoP relies on a sound and solid architectural design for directives, which enables it to become both extensible and powerful.

## Low-level functionality

As a design decision, the engine depends directly on the directive pipeline for resolving the query. For this reason, directives are treated as low-level components, with access to the object where the response is stored.

As a result, any custom directive has the power to modify the GraphQL response.

An evident use case for this is directive [@removeIfNull](/docs/operational/remove-if-null) (implemented [here](https://github.com/GraphQLByPoP/graphql/blob/3c1ae32f641b5540a7538e3df5d7d6ffeb93d53f/src/DirectiveResolvers/RemoveIfNullDirectiveResolver.php)), which allows to indicate in the query if we'd rather omit the response from a field than to receive a `null` value (there is an [issue in the spec](https://github.com/graphql/graphql-spec/issues/476) concerning this feature).

## Efficient directive calls

Directives receive all their affected objects and fields together, for a single execution.

In the examples below, the Google Translate API is called the minimum possible amount of times to execute multiple translations.

In [this query](https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20posts(pagination:{limit%3A5})%20%7B%0A%20%20%20%20title%0A%20%20%20%20excerpt%0A%20%20%20%20titleES%3A%20title%20%40translate(from%3A%22en%22%2C%20to%3A%22es%22)%0A%20%20%20%20excerptES%3Aexcerpt%20%40translate(from%3A%22en%22%2C%20to%3A%22es%22)%0A%20%20%7D%0A%7D), the Google Translate API is called once, containing 10 pieces of text to translate (2 fields, title and excerpt, for 5 posts):

```graphql
query {
  posts(pagination:{ limit:5 }) {
    title
    excerpt
    titleES: title @translate(from:"en", to:"es")
    excerptES:excerpt @translate(from:"en", to:"es")
  }
}
```

In [this query](https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20posts(pagination:{limit%3A5})%20%7B%0A%20%20%20%20title%0A%20%20%20%20excerpt%0A%20%20%20%20titleES%3A%20title%20%40translate(from%3A%22en%22%2C%20to%3A%22es%22)%0A%20%20%20%20excerptES%3Aexcerpt%20%40translate(from%3A%22en%22%2C%20to%3A%22es%22)%0A%20%20%20%20titleDE%3A%20title%20%40translate(from%3A%22en%22%2C%20to%3A%22de%22)%0A%20%20%20%20excerptDE%3Aexcerpt%20%40translate(from%3A%22en%22%2C%20to%3A%22de%22)%0A%20%20%20%20titleFR%3A%20title%20%40translate(from%3A%22en%22%2C%20to%3A%22fr%22)%0A%20%20%20%20excerptFR%3Aexcerpt%20%40translate(from%3A%22en%22%2C%20to%3A%22fr%22)%0A%20%20%7D%0A%7D) there are 3 calls to the API, one for every language (Spanish, French and German), 10 strings each, all calls are concurrent:

```graphql
query {
  posts(pagination:{ limit:5 }) {
    title
    excerpt
    titleES: title @translate(from:"en", to:"es")
    excerptES:excerpt @translate(from:"en", to:"es")
    titleDE: title @translate(from:"en", to:"de")
    excerptDE:excerpt @translate(from:"en", to:"de")
    titleFR: title @translate(from:"en", to:"fr")
    excerptFR:excerpt @translate(from:"en", to:"fr")
  }
}
```

::: details View PQL queries

```less
// The Google Translate API is called once, containing 10 pieces of text to translate (2 fields, title and excerpt, for 5 posts)
/?query=
  posts(pagination:{ limit:5 }).
    --props|
    --props@spanish<
      translate(from:en,to:es)
    >&
props=
  title|
  excerpt

// Here there are 3 calls to the API, one for every language (Spanish, French and German), 10 strings each, all calls are concurrent
/?query=
  posts(pagination:{ limit:5 }).
    --props|
    --props@spanish<
      translate(from:en,to:es)
    >|
    --props@french<
      translate(from:en,to:fr)
    >|
    --props@german<
      translate(from:en,to:de)
    >&
props=
  title|
  excerpt
```

[View results: <a href="https://newapi.getpop.org/api/graphql/?query=posts(pagination:{limit:5}).--props%7C--props@spanish<translate(from:en,to:es)>&amp;props=title%7Cexcerpt">query #1</a>, <a href="https://newapi.getpop.org/api/graphql/?query=posts(pagination:{limit:5}).--props%7C--props@spanish%3Ctranslate(from:en,to:es)%3E%7C--props@french%3Ctranslate(from:en,to:fr)%3E%7C--props@german%3Ctranslate(from:en,to:de)%3E&amp;props=title%7Cexcerpt">query #2</a>]

:::

## Function signature

This is the [directive interface](https://github.com/getpop/component-model/blob/b2ef9fe693c69a6d4c4b549519eb236f527b841d/src/DirectiveResolvers/DirectiveResolverInterface.php#L113). Please notice the parameters that function `resolveDirective` receives:

```php
public function resolveDirective(
  TypeResolverInterface $typeResolver,
  array &$idsDataFields,
  array &$succeedingPipelineIDsDataFields,
  array &$succeedingPipelineDirectiveResolverInstances,
  array &$resultIDItems,
  array &$unionDBKeyIDs,
  array &$dbItems,
  array &$previousDBItems,
  array &$variables,
  array &$messages,
  array &$dbErrors,
  array &$dbWarnings,
  array &$dbDeprecations,
  array &$dbNotices,
  array &$dbTraces,
  array &$schemaErrors,
  array &$schemaWarnings,
  array &$schemaDeprecations,
  array &$schemaNotices,
  array &$schemaTraces
): void;
```

These parameters evidence the low-level nature of the directive:

- `$idsDataFields`: the list of IDs per field to be processed by the directive
- `$succeedingPipelineIDsDataFields`: the list of IDs per field to be processed by directives at a later stage in the pipeline
- `$resultIDItems`: the response object

The other parameters make it possible to: access the query variables and define dynamic variables (as done by the [`@export`](https://github.com/GraphQLByPoP/graphql/blob/3c1ae32f641b5540a7538e3df5d7d6ffeb93d53f/src/DirectiveResolvers/ExportDirectiveResolver.php) directive), pass messages with custom data across directives, raise errors and warnings, identify and display deprecations, [pass notices to the user](/docs/operational/proactive-feedback), and store metrics.