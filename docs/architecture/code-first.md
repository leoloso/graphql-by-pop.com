# Code-first Server

The GraphQL schema defines the contracts for a GraphQL service, by exporting the set of types, fields and mutations that can be executed against the service. When creating a GraphQL service, we may decide to either:

- have the schema be the source of truth, and let all our implementation code match its definitions
- have our code be the source of truth, and have the schema be an artifact generated from the code

In either case we will have a fully functioning GraphQL service, but, depending on which approach we use, we may be able to accomplish more or less features, more or less easily, down the road. These two approaches are called, respectively, "schema-first" (better called "SDL-first") and "code-first".

GraphQL by PoP uses the code-first approach. Let's see why this is so.

## Why GraphQL by PoP uses code-first

In the code-first approach, we start by coding the resolvers and then, from code as a single source of truth, we have the schema generated as an artifact. Hence, the schema is created by running a script, instead of being manually created as in SDL-first. Since code-first also has a schema, it does not miss anything significant provided by SDL-first.

However, code-first does provide a significant feature over SDL-first: the possibility to provide dynamic schemas, which can change their shape and attributes depending on the context, and regulated through code on runtime. Indeed, all the great features offered by GraphQL by PoP are a direct consequence of its embracing code-first.

## Advantages of code-first

A dynamic schema provides all the benefits listed below, among others:

→ The [source of truth for the schema](https://newapi.getpop.org/api/graphql/?query=fullSchema) is a superset of the one required by GraphQL. The additional properties (such as the global fields, global connections, global directives, and persisted fragments) can already be used in our API without having to wait for them to be added to the GraphQL spec, if ever.

→ Because the source of truth is not tied to the schema, then we can generate any schema for any other system too: GraphQL is just one of the targets. For instance, it can generate a JSON-schema for a REST service from the same source of truth.

→ The API can be public/private at the same time, depending on if the user is logged-in or not and on the logged-in user roles, or offer more or less fields depending on some other property, such as if the user has paid for the PRO membership.

→ Types do not know in advance what fields they will resolve. Instead, field resolvers attach themselves to type resolvers using the [publish-subscribe pattern](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern), and field resolvers can override other field resolvers. This feature makes the API very extensible, allowing us to have a general code for our API, and customize it at the application level for a specific client or project.

→ A field can be processed by not just one, but many field resolvers: each field resolver in the chain can decide, on runtime, if to process the field or not based on some property, or pass it along the chain. For instance, a special field resolver may be used only if a field argument `"source: testing"` is passed, enabling to be tested in a few sites in production before the general release; the same strategy also enables to provide quick bug fixes for a specific client or environment without running the risk of unintended side-effects everywhere else.

→ Types and interfaces can be automatically namespaced to avoid collisions from 3rd parties.
