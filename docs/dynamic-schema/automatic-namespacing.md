# (*) Automatic Namespacing

Namespaces ([proposed to be added to the GraphQL spec](https://github.com/graphql/graphql-spec/issues/163)) help manage the complexity of the schema. This can avoid different types having the same name, which can happen when embedding components from a 3rd party.

PoP allows to have all types and interfaces in the schema be automatically namespaced, by prepending their names with the corresponding PHP package's owner and name (following the [PSR-4](https://www.php-fig.org/psr/psr-4/) convention, PHP namespaces have the form of `ownerName\projectName`, such as `"PoP\ComponentModel"`). Namespacing is disabled by default, and enabled through an environment variable. More info [here](https://leoloso.com/posts/added-namespaces-to-graphql-by-pop/).

This is how the normal schema looks like [in the GraphQL Voyager](https://newapi.getpop.org/graphql-interactive/):

![Interactive schema](https://raw.githubusercontent.com/getpop/api-graphql/master/assets/images/normal-interactive-schema.jpg)

This is how it looks in [its namespaced version](https://newapi.getpop.org/graphql-interactive/?use_namespace=1):

![Namespaced interactive schema](https://raw.githubusercontent.com/getpop/api-graphql/master/assets/images/namespaced-interactive-schema.jpg)
