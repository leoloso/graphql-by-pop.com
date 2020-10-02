# Dealing with Schema-type Directives

GraphQL by PoP is a [code-first](code-first.html) server, i.e. it uses code to develop the schema. (The alternative is the SDL-first approach, which uses the Schema Definition Language to first produce the schema and then develop the service).

Because it doesn't have an SDL, code-first servers can't naturally support schema-type directives. In order to avoid this limitation, GraphQL by PoP has developed the following mechanism:

- Transforming the query [from requested to executable](decoupling-queries.html)
- Applying [IFTTT rules](../dynamic-schema/ifttt-through-directives.html) to the executable query

This results in a full support for schema-type directives on the GraphQL server.

## Why does it work?

`@deprecated` is a schema-type directive, so it must be applied on the schema. However, what would happen if we pretend for a moment that it is a query-type directive, and add `@deprecated` on some field directly in the query? 

For instance, when executing this query:

```graphql
query {
  posts {
    id
    title
    content @deprecated(reason: "Use newContent instead")
  }
}
```

Well, it could work too! Because, after all, a directive is just some functionality to execute on the field; declaring that functionality via the schema, or directly in the query, does not make the functionality behave any different.

Now, even though it works, it doesn't make any sense. We can't force our clients to add `@deprecated` to their queries. This is functionality decided by the application on the server-side, not on the client.

However, the functionality itself still works. Hence, if the directive is added to the schema or to the query doesn't matter from a functional point of view. Moreover, every directive will eventually end-up being present in the query, since that's where it is executed.

Hence, if the server doesn't have an SDL, it can still embed the directive into the query, on runtime.