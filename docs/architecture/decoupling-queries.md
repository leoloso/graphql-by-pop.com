# Decoupling Requested and Executable Queries

GraphQL by PoP uses a [directive pipeline](directive-pipeline.html), an architecture that enables the server's engine to resolve, validate, and execute the query. In order to make the engine as simple as possible, every action concerning the resolution of the query takes place within the pipeline, through directives.

![The directive pipeline](/images/multiple-fields-slot-directive-pipeline.png)

Calling the resolver to validate and resolve a field, and merge its output into the response, is accomplished through a couple of special directives: `@validate` and `@resolveValueAndMerge`. These directives are of a special type: they are not added by the application (on either the query or the schema) but by the engine itself. These 2 directives are implicit, and they are added always, on every field of every query.

From this strategy we can see that, when executing a query on the GraphQL server, there are actually 2 queries involved:

- The requested query
- The executable query

The executable query, which is the one to be ultimately resolved by the server, is produced from applying transformations on the requested query, among them the inclusion of directives `@validate` and `@resolveValueAndMerge` for every field.

![Inner process within the GraphQL server](/images/graphql-server-inner-process.png)

For instance, if the requested query is this one:

```graphql
{
  posts {
    url
    title @uppercase
    content @include(if: $addContent)
  }
}
```

The executable query will be this one:

```graphql
{
  posts @validate @resolveValueAndMerge {
    url @validate @resolveValueAndMerge
    title @validate @resolveValueAndMerge @uppercase
    content @validate @include(if: $addContent) @resolveValueAndMerge
  }
}
```

## Where is it used

GraphQL by PoP uses this mechanism to produce the executable query, in the following circumstances:

- Adding system-type directives (such as `@validate` and `@resolveValueAndMerge`)
- Adding any directive through [IFTTT through directives](../dynamic-schema/ifttt-through-directives.html)
- Defining a strict [field-execution order when in PQL](../extended/pql-defining-field-resolution-order.html) (the `;` token in the requested query is transformed to a series of `self` fields in the executable query)
- Support for the flat chain syntax (feature [coming soon](https://github.com/GatoGraphQL/GatoGraphQL/issues/213))

