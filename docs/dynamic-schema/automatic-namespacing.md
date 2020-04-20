# Automatic Namespacing

Namespaces ([proposed to be added to the GraphQL spec](https://github.com/graphql/graphql-spec/issues/163)) help manage the complexity of the schema. This can avoid different types having the same name, which can happen when embedding components from a 3rd party.

For instance, different WordPress plugins may implement a `Product` custom post type (such as WooCommerce or Easy Digital Downloads); if they wish to create a GraphQL type for it, they can't just name it `Product` or it may clash with another plugin. Hence, they would have to manually prepend their type names with the company name (such as doing `WooCommerce_Product`).

GraphQL by PoP allows to have all types and interfaces in the schema be automatically namespaced, by prepending their names with the corresponding PHP package's owner and name (following the [PSR-4](https://www.php-fig.org/psr/psr-4/) convention, PHP namespaces have the form of `OwnerName\ProjectName`, such as `"PoP\ComponentModel"`).

Following the example above, both WooCommerce and Easy Digital Downloads can have their types be called `Product`, and if our API has both these packages installed, then we can turn automatic namespacing on, transforming the type names into `Automattic\WooCommerce\Product` and `SandhillsDevelopment\EasyDigitalDownloads\Product`.

## Enabling automatic namespacing

Namespacing is disabled by default, and enabled through setting the environment variable `NAMESPACE_TYPES_AND_INTERFACES` with value `true`, or when passing URL parameter `use_namespace=1` on the API endpoint.

## Namespace separator

Ideally, we would like to use `\` as a separator between the namespace and the type name, such as `OwnerName\ProjectName\Type`. However, character `\` is currently not allowed as part of the type when executing a query in [GraphiQL](https://github.com/graphql/graphiql).

Hence, GraphQL by PoP uses `_` as the namespace separator symbol (until the GraphQL spec determines which symbol must be used), so the generated types look like `OwnerName_ProjectName_Type`.

## Visualizing the namespaced schema

This is how the normal schema looks like [in the GraphQL Voyager](https://newapi.getpop.org/graphql-interactive/):

![Interactive schema](/images/normal-interactive-schema.jpg)

This is how it looks in [its namespaced version](https://newapi.getpop.org/graphql-interactive/?use_namespace=1):

![Namespaced interactive schema](/images/namespaced-interactive-schema.jpg)

## Configuration

### Environment variables

| Environment variable | Description | Default |
| --- | --- | --- |
| `NAMESPACE_TYPES_AND_INTERFACES` | Enable automatic namespacing on types and interfaces | `false` |
