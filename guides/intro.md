# Intro to Guides

This section explains how certain functionalities have been implemented by GraphQL by PoP, and how the developer can replicate them for their custom APIs.

| Guide | Description |
| ------------- | ------------- |
| [Rapid Iteration on the Schema](./rapid-iteration-on-the-schema) | Exemplifies the best strategy to follow to allow autonomous teams work on the same schema, without conflicts or tooling |
| [Versioning fields and directives](./versioning-fields-and-directives) | When upgrading the API, how to avoid breaking any client while keeping the schema as neat as possible |
| [Sending a Localized Newsletter, User by User](./localized-newsletter) | Step-by-step description of sending newsletters translated to the recipient's language, using a single PQL query |
| [Building a CMS-agnostic API](./building-cms-agnostic-api) | Concepts and code which make GraphQL by PoP core code, and a custom API, be CMS-agnostic |
| [(x) Filling a Void with a Directive](./filling-void-with-directive) | How directives enable to implement novel functionalities, not yet supported by the server |
| [(x) Creating a Custom Access Control Rule](./creating-access-control-rule) | How we can define custom rules for an Access Control List, to manage who can access a certain field or directive |
| [(x) Executing the Backend for Frontends Pattern](./executing-the-backend-for-frontends-pattern) | Learn how to implement the [BFF](https://samnewman.io/patterns/architectural/bff/) pattern, where a single source of truth contains all the data for multiple applications (website, app, etc), and exposes to each application only the data it needs |
