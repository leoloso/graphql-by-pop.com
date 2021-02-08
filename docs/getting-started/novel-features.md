# Novel GraphQL features

GraphQL by PoP strives to provide brand-new features as opt-in, before these are supported by the [GraphQL spec](https://spec.graphql.org/draft/).

For instance, nested mutations [have been requested for the spec](https://github.com/graphql/graphql-spec/issues/252) but not yet approved. GraphQL by PoP complies with the spec, using types `QueryRoot` and `MutationRoot` to deal with queries and mutations respectively, as [exposed in the standard schema](https://newapi.getpop.org/graphql-interactive/).

However, thanks to using the [code-first approach](../architecture/code-first.html), the schema can be automatically transformed, and both queries and mutations will instead be [handled by a single type `Root`](https://newapi.getpop.org/graphql-interactive/?mutation_scheme=nested), providing support for nested mutations.
