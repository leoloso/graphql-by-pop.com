# (*) Intro to the Dynamic Schema

The schema used for a specific request ca be shaped based on the context. The exposed schema is, then, a subset of the grand schema. We can think of the grand schema as a schema multiverse, and the request accessing a tailored schema from the multiverse.

## Code-First Schema Definition

TODO

## Features

These are the features powering the dynamic schema:

- Execute [IFTTT strategies](./ifttt-through-directives) through adding extra directives to the query
- Fields and directives can be satisfied by [multiple resolvers](./multiple-resolvers), and on runtime it is decided which resolver will handle the field or directive
- Fields and directives can be [independently versioned](./field-directive-based-versioning)
- Access to fields or directives can be granted to users [based on different rules](./access-control): being logged-in, having a certain role or capability, and others
- Users denied access to a field or directive can either be shown the reason why, or told that the item does not exists. This is called the [public/private schema mode](./public-private-schema-mode)
- The grand schema can contain all the data for multiple applications (website, app, etc), and [expose only the needed data](./backend-for-frontends) to each application
- Types and Interfaces can be [automatically namespaced](./automatic-namespacing), to avoid conflicts among 3rd party components

## Advantages

The advantages of the dynamic schema over a static schema are several:

- The data model can be customized for client/project
- Teams become autonoumous, and can avoid the bureaucracy of communicating/planning/coordinating changes to the schema
- Rapid iteration, such as allowing a selected group of testers to try out new features in production
- Quick bug fixing, such as fixing a bug specifically for a client, without worrying about breaking changes for other clients
- Versioned fields and directives can provide legacy functionality without polluting the schema
- All the data for all multiple applications is managed as a single source of truth
