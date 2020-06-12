# Repositories

GraphQL by PoP does not live on a monorepo, but has been spread on a great number of repositories, under GitHub accounts [PoP](https://github.com/getpop), [PoPSchema](https://github.com/PoPSchema) and [GraphQLByPoP](https://github.com/GraphQLByPoP).

Each repository deals with a specific domain, and it must be as granular as common sense dictates. This distribution is due to GraphQL by PoP being CMS-agnostic, attempting to work on as many different CMSs/frameworks as possible with the least required effort.

## CMS-agnostic repository structure

In order to become CMS-agnostic, all functionality that must interact with the CMS is divided into 2 separate packages:

- A CMS-agnostic package, containing all the business code and contracts to interact with the implementing CMS, whichever that is (eg: [posts](https://github.com/PoPSchema/posts))
- A CMS-specific package, containing the implementation of the contracts for a specific CMS (eg: [posts-wp](https://github.com/PoPSchema/posts-wp), implementing the contracts for WordPress)

Then, most of the code (around 90%) lies within the CMS-agnostic package. In order to port the API to a different CMS (eg: from WordPress to Laravel), only the CMS-specific package must be implemented (representing around 10% of the overall code).

Minimizing the amount of code that must be re-implemented, and avoiding duplicate code across packages, are the main drivers defining how the code is split into packages.

## List of repositories

### GraphQLByPoP

| Repository | Description |
| --- | --- |
| [api-graphql-query](https://github.com/GraphQLByPoP/api-graphql-query) | Utilities to transform the query from the GraphQL syntax to the Field query syntax |
| [api-graphql-request](https://github.com/GraphQLByPoP/api-graphql-request) | Enables GraphQL for PoP to process the GraphQL query using the standard syntax |
| [graphql](https://github.com/GraphQLByPoP/graphql) | GraphQL server in PHP, implemented through the PoP API |
| [graphql-clients-for-wp](https://github.com/GraphQLByPoP/graphql-clients-for-wp) | GraphiQL and Voyager GraphQL Clients for WordPress |
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
| [custompostmeta](https://github.com/PoPSchema/custompostmeta) | Adds support for post meta |
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
| [postmedia](https://github.com/PoPSchema/postmedia) | Deals with media elements added to posts |
| [postmedia-wp](https://github.com/PoPSchema/postmedia-wp) | Implementation for WordPress of contracts from package "Post Media" |
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

<!--
These are ALL the repositories, including the ones not used for the API

| Repository | Description |
| --- | --- |
| [access-control](https://github.com/getpop/access-control) | Access Control for fields and directives |
| [api](https://github.com/getpop/api) | Component-based API |
| [api-endpoints-for-wp](https://github.com/getpop/api-endpoints-for-wp) | Add pretty permalinks for the PoP API endpoints, for WordPress |
| [api-graphql](https://github.com/getpop/api-graphql) | Extended/Upgraded implementation of GraphQL, implemented on PHP, based on the PoP API |
| [api-graphql-query](https://github.com/getpop/api-graphql-query) | Utilities to transform the query from the GraphQL syntax to the Field query syntax |
| [api-graphql-request](https://github.com/getpop/api-graphql-request) | Enables GraphQL for PoP to process the GraphQL query using the standard syntax |
| [api-mirrorquery](https://github.com/getpop/api-mirrorquery) | Mirror the query in the API response |
| [api-rest](https://github.com/getpop/api-rest) | Create REST endpoints in the PoP API |
| [application](https://github.com/getpop/application) | Create a component-based application |
| [application-wp](https://github.com/getpop/application-wp) | Implementation for WordPress of contracts from package "Application" |
| [basic-directives](https://github.com/getpop/basic-directives) | Set of basic directives |
| [block-metadata-for-wp](https://github.com/getpop/block-metadata-for-wp) | Integration with WordPress plugin "Block Metadata" |
| [cache-control](https://github.com/getpop/cache-control) | Add HTTP caching to the response |
| [cdn-directive](https://github.com/getpop/cdn-directive) | CDN directive |
| [commentmeta](https://github.com/getpop/commentmeta) | Adds support for comment meta |
| [commentmeta-wp](https://github.com/getpop/commentmeta-wp) | Implementation for WordPress of contracts from package "Comment Meta" |
| [comments](https://github.com/getpop/comments) | Adds support for comments |
| [comments-wp](https://github.com/getpop/comments-wp) | Implementation for WordPress of contracts from package "Comments" |
| [component-model](https://github.com/getpop/component-model) | Component model for PoP, over which the component-based architecture is based |
| [component-model-configuration](https://github.com/getpop/component-model-configuration) | Adds the configuration layer to the component model |
| [content](https://github.com/getpop/content) | Interfaces and helpers for content-related entities (eg: posts, articles, etc) |
| [content-wp](https://github.com/getpop/content-wp) | Implementation for WordPress of contracts from package "Content" |
| [definitionpersistence](https://github.com/getpop/definitionpersistence) | Store definitions across sessions |
| [definitions](https://github.com/getpop/definitions) | Enables to define a name for an element (such as modules, resources, etc) through different strategies |
| [definitions-base36](https://github.com/getpop/definitions-base36) | Provides definitions using a base 36 counter |
| [definitions-emoji](https://github.com/getpop/definitions-emoji) | Provides definitions using emojis |
| [engine](https://github.com/getpop/engine) | Engine for PoP |
| [engine-wp](https://github.com/getpop/engine-wp) | Implementation of PoP Engine for WordPress |
| [engine-wp-bootloader](https://github.com/getpop/engine-wp-bootloader) | PoP Engine Bootloader for WordPress |
| [event-mutations](https://github.com/getpop/event-mutations) | Adds support for event mutations |
| [event-mutations-wp-em](https://github.com/getpop/event-mutations-wp-em) | Implementation for WordPress of contracts from package "Event Mutations", through plugin "Events Manager" |
| [field-query](https://github.com/getpop/field-query) | Component model for PoP, over which the component-based architecture is based |
| [filestore](https://github.com/getpop/filestore) | Base classes to save files to disk, read them and reference them through an URL |
| [function-fields](https://github.com/getpop/function-fields) | Set of function global fields |
| [google-translate-directive](https://github.com/getpop/google-translate-directive) | Use Google Translate as a provider for the `@translate` directive |
| [google-translate-directive-for-posts](https://github.com/getpop/google-translate-directive-for-posts) | Use the `@translate(provider:google)` directive with posts |
| [graphql](https://github.com/getpop/graphql) | GraphQL server in PHP, implemented through the PoP API |
| [graphql-parser](https://github.com/getpop/graphql-parser) | Pure PHP GraphQL |
| [guzzle-helpers](https://github.com/getpop/guzzle-helpers) | Helper functions for Guzzle |
| [highlights](https://github.com/getpop/highlights) | Adds support for highlights |
| [highlights-wp](https://github.com/getpop/highlights-wp) | Implementation for WordPress of contracts from package "Highlights" |
| [hooks](https://github.com/getpop/hooks) | Contracts to implement hooks (filters and actions) for PoP |
| [hooks-wp](https://github.com/getpop/hooks-wp) | WordPress implementation of the contracts to implement hooks (filters and actions) for PoP |
| [locationposts](https://github.com/getpop/locationposts) | Adds support for locationposts |
| [locationposts-wp](https://github.com/getpop/locationposts-wp) | Implementation for WordPress of contracts from package "LocationPosts" |
| [loosecontracts](https://github.com/getpop/loosecontracts) | Loose Contracts: a method to "code against interfaces, not implementations" for strings such as option names, hook names, etc |
| [mandatory-directives-by-configuration](https://github.com/getpop/mandatory-directives-by-configuration) | Set configurable mandatory directives for fields and directives |
| [media](https://github.com/getpop/media) | Adds support for media |
| [media-wp](https://github.com/getpop/media-wp) | Implementation for WordPress of contracts from package "Media" |
| [menus](https://github.com/getpop/menus) | Adds support for menus |
| [menus-wp](https://github.com/getpop/menus-wp) | Implementation for WordPress of contracts from package "Menus" |
| [meta](https://github.com/getpop/meta) | Adds support for meta |
| [metaquery](https://github.com/getpop/metaquery) | Adds support for meta queries |
| [metaquery-wp](https://github.com/getpop/metaquery-wp) | Implementation for WordPress of contracts from package "Meta Query" |
| [modulerouting](https://github.com/getpop/modulerouting) | Configure and obtain what module will be added to the component hierarchy at each level, based on the attributes from the request |
| [multisite](https://github.com/getpop/multisite) | Multisite |
| [notifications](https://github.com/getpop/notifications) | Adds support for notifications |
| [notifications-wp](https://github.com/getpop/notifications-wp) | Implementation for WordPress of contracts from package "Notifications" |
| [pages](https://github.com/getpop/pages) | Adds support for pages |
| [pages-wp](https://github.com/getpop/pages-wp) | Implementation for WordPress of contracts from package "Pages" |
| [postmedia](https://github.com/getpop/postmedia) | Deals with media elements added to posts |
| [postmedia-wp](https://github.com/getpop/postmedia-wp) | Implementation for WordPress of contracts from package "Post Media" |
| [custompostmeta](https://github.com/getpop/custompostmeta) | Adds support for post meta |
| [custompostmeta-wp](https://github.com/getpop/custompostmeta-wp) | Implementation for WordPress of contracts from package "Custom Post Meta" |
| [posts](https://github.com/getpop/posts) | Adds support for posts |
| [posts-wp](https://github.com/getpop/posts-wp) | Implementation for WordPress of contracts from package "Posts" |
| [queriedobject](https://github.com/getpop/queriedobject) | Adds support to query single objects (users, posts, etc) in the request |
| [queriedobject-wp](https://github.com/getpop/queriedobject-wp) | Implementation for WordPress of contracts from package "Queried Object" |
| [query-parsing](https://github.com/getpop/query-parsing) | Utilities to parse the query |
| [resourceloader](https://github.com/getpop/resourceloader) | Load resources for the website |
| [resources](https://github.com/getpop/resources) | Resources for the website (CSS, JS files) |
| [root](https://github.com/getpop/root) | Declaration of dependencies shared by all PoP components |
| [routing](https://github.com/getpop/routing) | Routing system |
| [routing-wp](https://github.com/getpop/routing-wp) | Implementation for WordPress of contracts from package "Routing" |
| [site](https://github.com/getpop/site) | Create a component-based website |
| [site-wp](https://github.com/getpop/site-wp) | Implementation for WordPress of package Site |
| [spa](https://github.com/getpop/spa) | Single-Page Application for PoP |
| [stances](https://github.com/getpop/stances) | Adds support for stances |
| [stances-wp](https://github.com/getpop/stances-wp) | Implementation for WordPress of contracts from package "Stances" |
| [static-site-generator](https://github.com/getpop/static-site-generator) | Create a static version of the site |
| [taxonomies](https://github.com/getpop/taxonomies) | Adds support for taxonomies |
| [taxonomies-wp](https://github.com/getpop/taxonomies-wp) | Implementation for WordPress of contracts from package "Taxonomies" |
| [taxonomymeta](https://github.com/getpop/taxonomymeta) | Adds support for taxonomy (category and tag) meta |
| [taxonomymeta-wp](https://github.com/getpop/taxonomymeta-wp) | Implementation for WordPress of contracts from package "Taxonomy Meta" |
| [taxonomyquery](https://github.com/getpop/taxonomyquery) | Adds support for taxonomy (category and tag) queries |
| [taxonomyquery-wp](https://github.com/getpop/taxonomyquery-wp) | Implementation for WordPress of contracts from package "Taxonomy Query" |
| [trace-tools](https://github.com/getpop/trace-tools) | Directives for capturing operational data, to improve performance, do analytics, and others |
| [translate-directive](https://github.com/getpop/translate-directive) | Directive `@translate` to translate content using different provider APIs |
| [translate-directive-acl](https://github.com/getpop/translate-directive-acl) | Access Control List for Translate Directive |
| [translation](https://github.com/getpop/translation) | Translation API for PoP components |
| [translation-wp](https://github.com/getpop/translation-wp) | Implementation of the Translation API for WordPress |
| [useful-directives](https://github.com/getpop/useful-directives) | Set of useful directives |
| [user-roles](https://github.com/getpop/user-roles) | Adds support for user roles |
| [user-roles-access-control](https://github.com/getpop/user-roles-access-control) | Access Control based on the user having a given role/capability |
| [user-roles-acl](https://github.com/getpop/user-roles-acl) | Access Control List for User Roles |
| [user-roles-wp](https://github.com/getpop/user-roles-wp) | Implementation for WordPress of contracts from package "User Roles" |
| [user-state](https://github.com/getpop/user-state) | Enables users to log in and have user state |
| [user-state-access-control](https://github.com/getpop/user-state-access-control) | Access Control based on the user being logged-in or not |
| [user-state-wp](https://github.com/getpop/user-state-wp) | Implementation for WordPress of contracts from package "User State" |
| [usermeta](https://github.com/getpop/usermeta) | Adds support for user meta |
| [usermeta-wp](https://github.com/getpop/usermeta-wp) | Implementation for WordPress of contracts from package "User Meta" |
| [users](https://github.com/getpop/users) | Adds support for users |
| [users-wp](https://github.com/getpop/users-wp) | Implementation for WordPress of contracts from package "Users" |
-->
