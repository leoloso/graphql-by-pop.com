# Repositories

GraphQL by PoP does not live on a monorepo, but has been spread on a great number of repositories, under several GitHub organization accounts:

- [GraphQLByPoP](https://github.com/GraphQLByPoP): components belonging to "GraphQL by PoP", the CMS-agnostic GraphQL server which powers the plugin
- [PoPSchema](https://github.com/PoPSchema): components to add entities to the schema (types, field resolvers, directives)
- [PoP](https://github.com/getpop): the core server-side component architecture, used by the server to load the graph data

Each repository deals with a specific domain, and it must be as granular as common sense dictates. This distribution is due to GraphQL by PoP being [CMS-agnostic](cms-agnosticism), attempting to work on as many different CMSs/frameworks as possible with the least required effort.

## List of repositories

### GraphQLByPoP

| Repository | Description |
| --- | --- |
| [graphql-query](https://github.com/GraphQLByPoP/graphql-query) | Utilities to transform the query from the GraphQL syntax to the Field query syntax |
| [graphql-request](https://github.com/GraphQLByPoP/graphql-request) | Enables GraphQL for PoP to process the GraphQL query using the standard syntax |
| [graphql-server](https://github.com/GraphQLByPoP/graphql-server) | GraphQL server in PHP, implemented through the PoP API |
| [graphql-clients-for-wp](https://github.com/GraphQLByPoP/graphql-clients-for-wp) | GraphiQL and Voyager GraphQL Clients for WordPress |
| [graphql-endpoint-for-wp](https://github.com/GraphQLByPoP/graphql-endpoint-for-wp) | Add pretty permalinks for the single GraphQL endpoint, for WordPress |
| [graphql-parser](https://github.com/GraphQLByPoP/graphql-parser) | Pure PHP GraphQL |

### PoPSchema

| Repository | Description |
| --- | --- |
| [block-metadata-for-wp](https://github.com/PoPSchema/block-metadata-for-wp) | Integration with WordPress plugin "Block Metadata" |
| [cdn-directive](https://github.com/PoPSchema/cdn-directive) | CDN directive |
| [commentmeta](https://github.com/PoPSchema/commentmeta) | Adds support for comment meta |
| [commentmeta-wp](https://github.com/PoPSchema/commentmeta-wp) | Implementation for WordPress of contracts from package "Comment Meta" |
| [comments](https://github.com/PoPSchema/comments) | Adds support for comments |
| [comments-wp](https://github.com/PoPSchema/comments-wp) | Implementation for WordPress of contracts from package "Comments" |
| [custompostmedia](https://github.com/PoPSchema/custompostmedia) | Deals with media elements added to custom posts |
| [custompostmedia-wp](https://github.com/PoPSchema/custompostmedia-wp) | Implementation for WordPress of contracts from package "Custom Post Media" |
| [custompostmeta](https://github.com/PoPSchema/custompostmeta) | Adds support for custom post meta |
| [custompostmeta-wp](https://github.com/PoPSchema/custompostmeta-wp) | Implementation for WordPress of contracts from package "Custom Post Meta" |
| [customposts](https://github.com/PoPSchema/customposts) | Interfaces and helpers for custom posts (eg: posts, articles, etc) |
| [customposts-wp](https://github.com/PoPSchema/customposts-wp) | Implementation for WordPress of contracts from package "Custom Posts" |
| [events](https://github.com/PoPSchema/events) | Adds support for events |
| [events-wp-em](https://github.com/PoPSchema/events-wp-em) | Implementation for WordPress of contracts from package "Events", through plugin "Events Manager" |
| [google-translate-directive](https://github.com/PoPSchema/google-translate-directive) | Use Google Translate as a provider for the `@translate` directive |
| [locations](https://github.com/PoPSchema/locations) | Adds support for locations |
| [locations-wp-em](https://github.com/PoPSchema/locations-wp-em) | Implementation for WordPress of contracts from package "Locations", through plugin "Events Manager" |
| [media](https://github.com/PoPSchema/media) | Adds support for media |
| [media-wp](https://github.com/PoPSchema/media-wp) | Implementation for WordPress of contracts from package "Media" |
| [pages](https://github.com/PoPSchema/pages) | Adds support for pages |
| [pages-wp](https://github.com/PoPSchema/pages-wp) | Implementation for WordPress of contracts from package "Pages" |
| [posts](https://github.com/PoPSchema/posts) | Adds support for posts |
| [posts-wp](https://github.com/PoPSchema/posts-wp) | Implementation for WordPress of contracts from package "Posts" |
| [taxonomies](https://github.com/PoPSchema/taxonomies) | Adds support for taxonomies |
| [taxonomies-wp](https://github.com/PoPSchema/taxonomies-wp) | Implementation for WordPress of contracts from package "Taxonomies" |
| [taxonomymeta](https://github.com/PoPSchema/taxonomymeta) | Adds support for taxonomy (category and tag) meta |
| [taxonomymeta-wp](https://github.com/PoPSchema/taxonomymeta-wp) | Implementation for WordPress of contracts from package "Taxonomy Meta" |
| [taxonomyquery](https://github.com/PoPSchema/taxonomyquery) | Adds support for taxonomy (category and tag) queries |
| [taxonomyquery-wp](https://github.com/PoPSchema/taxonomyquery-wp) | Implementation for WordPress of contracts from package "Taxonomy Query" |
| [trace-tools](https://github.com/PoPSchema/trace-tools) | Directives for capturing operational data, to improve performance, do analytics, and others |
| [translate-directive](https://github.com/PoPSchema/translate-directive) | Directive `@translate` to translate content using different provider APIs |
| [translate-directive-acl](https://github.com/PoPSchema/translate-directive-acl) | Access Control List for Translate Directive |
| [useful-directives](https://github.com/PoPSchema/useful-directives) | Set of useful directives |
| [usermeta](https://github.com/PoPSchema/usermeta) | Adds support for user meta |
| [usermeta-wp](https://github.com/PoPSchema/usermeta-wp) | Implementation for WordPress of contracts from package "User Meta" |
| [users](https://github.com/PoPSchema/users) | Adds support for users |
| [users-wp](https://github.com/PoPSchema/users-wp) | Implementation for WordPress of contracts from package "Users" |

### PoP

| Repository | Description |
| --- | --- |
| [access-control](https://github.com/getpop/access-control) | Access Control for fields and directives |
| [api](https://github.com/getpop/api) | Component-based API |
| [api-clients](https://github.com/getpop/api-clients) | Utilities for implementing API clients |
| [api-endpoints](https://github.com/getpop/api-endpoints) | Utilities for implementing API endpoints |
| [api-endpoints-for-wp](https://github.com/getpop/api-endpoints-for-wp) | Add pretty permalinks for the PoP API endpoints, for WordPress |
| [api-graphql](https://github.com/getpop/api-graphql) | Extended/Upgraded implementation of GraphQL, implemented on PHP, based on the PoP API |
| [api-mirrorquery](https://github.com/getpop/api-mirrorquery) | Mirror the query in the API response |
| [api-rest](https://github.com/getpop/api-rest) | Create REST endpoints in the PoP API |
| [basic-directives](https://github.com/getpop/basic-directives) | Set of basic directives |
| [cache-control](https://github.com/getpop/cache-control) | Add HTTP caching to the response |
| [component-model](https://github.com/getpop/component-model) | Component model for PoP, over which the component-based architecture is based |
| [definitions](https://github.com/getpop/definitions) | Enables to define a name for an element (such as modules, resources, etc) through different strategies |
| [engine](https://github.com/getpop/engine) | Engine for PoP |
| [engine-wp](https://github.com/getpop/engine-wp) | Implementation of PoP Engine for WordPress |
| [engine-wp-bootloader](https://github.com/getpop/engine-wp-bootloader) | PoP Engine Bootloader for WordPress |
| [field-deprecation-by-directive](https://github.com/getpop/field-deprecation-by-directive) | Deprecate fields by directive |
| [field-query](https://github.com/getpop/field-query) | Component model for PoP, over which the component-based architecture is based |
| [filestore](https://github.com/getpop/filestore) | Base classes to save files to disk, read them and reference them through an URL |
| [function-fields](https://github.com/getpop/function-fields) | Set of function global fields |
| [guzzle-helpers](https://github.com/getpop/guzzle-helpers) | Helper functions for Guzzle |
| [hooks](https://github.com/getpop/hooks) | Contracts to implement hooks (filters and actions) for PoP |
| [hooks-wp](https://github.com/getpop/hooks-wp) | WordPress implementation of the contracts to implement hooks (filters and actions) for PoP |
| [loosecontracts](https://github.com/getpop/loosecontracts) | Loose Contracts: a method to "code against interfaces, not implementations" for strings such as option names, hook names, etc |
| [mandatory-directives-by-configuration](https://github.com/getpop/mandatory-directives-by-configuration) | Set configurable mandatory directives for fields and directives |
| [meta](https://github.com/getpop/meta) | Adds support for meta |
| [metaquery](https://github.com/getpop/metaquery) | Adds support for meta queries |
| [metaquery-wp](https://github.com/getpop/metaquery-wp) | Implementation for WordPress of contracts from package "Meta Query" |
| [modulerouting](https://github.com/getpop/modulerouting) | Configure and obtain what module will be added to the component hierarchy at each level, based on the attributes from the request |
| [queriedobject](https://github.com/getpop/queriedobject) | Adds support to query single objects (users, posts, etc) in the request |
| [queriedobject-wp](https://github.com/getpop/queriedobject-wp) | Implementation for WordPress of contracts from package "Queried Object" |
| [query-parsing](https://github.com/getpop/query-parsing) | Utilities to parse the query |
| [root](https://github.com/getpop/root) | Declaration of dependencies shared by all PoP components |
| [routing](https://github.com/getpop/routing) | Routing system |
| [routing-wp](https://github.com/getpop/routing-wp) | Implementation for WordPress of contracts from package "Routing" |
| [translation](https://github.com/getpop/translation) | Translation API for PoP components |
| [translation-wp](https://github.com/getpop/translation-wp) | Implementation of the Translation API for WordPress |
| [user-roles](https://github.com/getpop/user-roles) | Adds support for user roles |
| [user-roles-access-control](https://github.com/getpop/user-roles-access-control) | Access Control based on the user having a given role/capability |
| [user-roles-acl](https://github.com/getpop/user-roles-acl) | Access Control List for User Roles |
| [user-roles-wp](https://github.com/getpop/user-roles-wp) | Implementation for WordPress of contracts from package "User Roles" |
| [user-state](https://github.com/getpop/user-state) | Enables users to log in and have user state |
| [user-state-access-control](https://github.com/getpop/user-state-access-control) | Access Control based on the user being logged-in or not |
| [user-state-wp](https://github.com/getpop/user-state-wp) | Implementation for WordPress of contracts from package "User State" |
