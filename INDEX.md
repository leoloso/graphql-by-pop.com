---
{
  "home": true,
  "layout": "CustomLayout",
  "heroImage": "/graphql-by-pop-logo.svg",
  "actionText": "Get Started  →",
  "actionLink": "/docs/",
  "graphiQLText": "Run query in GraphiQL  →",
  "graphiQLLink": "https://newapi.getpop.org/graphiql/?operationName=PostsWithComments&query=query%20PostsWithComments%20%7B%0A%20%20posts%20%7B%0A%20%20%20%20title%0A%20%20%20%20comments%20%7B%0A%20%20%20%20%20%20date%0A%20%20%20%20%20%20content%0A%20%20%20%20%20%20author%20%7B%0A%20%20%20%20%20%20%20%20name%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A",
  "pqlText": "Run query in new tab  →",
  "pqlLink": "https://newapi.getpop.org/api/graphql/?query=posts.title|comments.date|content|author.name",
  "pql2Link": "https://newapi.getpop.org/api/graphql/?format=Y-m-d&query=posts.if%20(hasComments(),sprintf(%22This%20post%20has%20%s%20comment(s)%20and%20title%20%27%s%27%22,%20[commentCount(),title()]),sprintf(%22This%20post%20was%20created%20on%20%s%20and%20has%20no%20comments%22,%20[date(format:%20if(not(empty($format)),%20$format,%20d/m/Y))]))@postDesc",
  "superpowerText": "Get me started  →",
  "featuresTitle": "Designed for optimal experience",
  "features": [
    {
      "icon": "🏎",
      "title": "Fast",
      "details": "Queries are resolved in linear time on the number of types involved"
    },
    {
      "icon": "🛴",
      "title": "Simple",
      "details": "Resolvers deal with IDs (instead of objects), removing the need to implement batching/deferred"
    },
    {
      "icon": "🚂",
      "title": "Extensible",
      "details": "Types have their resolvers attached by injection, and resolvers can override each other"
    },
    {
      "icon": "🚀",
      "title": "Powerful",
      "details": "The engine is based on executing directives, allowing any type of custom functionality"
    }
  ],
  "architectureTitle": "Rock-solid architecture",
  "architectureItems": [
    {
      "icon": "👨🏻‍💻",
      "title": "⧐ Code-first approach ⧏",
      "details": "The schema is generated from code. Work with your teammates concurrently on the schema without conflicts, without tooling, and without bureaucracy.",
      "class": "degrade degrade-inverse"
    },
    {
      "iconAfter": "🧞‍♂️",
      "title": "⧐ Dynamic schema ⧏",
      "details": "The resolvers attach themselves to the types. Each field can be handled by different resolvers, and the chosen one is selected on runtime, depending on the context.",
      "class": "degrade"
    },
    {
      "icon": "🌗",
      "title": "⧐ Public/private schema managed through ACLs ⧏",
      "details": "From a single source of truth, expose different schemas for different users, managing it through Access Control Lists based on the user being logged-in or not, roles, capabilities, or custom rules.",
      "class": "degrade degrade-inverse"
    },
    {
      "iconAfter": "⏳",
      "title": "⧐ Field/directive-based versioning ⧏",
      "details": "In addition to evolving the GraphQL schema, every field and directive can be independently versioned, and the specific version to use is chosen through field/directive arguments in the query.",
      "class": "degrade"
    },
    {
      "icon": "📦",
      "title": "⧐ Robust caching ⧏",
      "details": "Cache the response from the query in several layers (server, CDN, etc) using standard HTTP caching, defining the max age field by field. Cache the results from expensive operations in disk or memory, defining the expiry time field by field.",
      "class": "degrade degrade-inverse"
    },
    {
      "iconAfter": "🧑🏽‍🍳",
      "title": "⧐ Nested mutations ⧏",
      "details": "Perform mutations on every type, not just on the root type, and have a mutation be executed on the result from another mutation. The schema gets neater and slimmer!",
      "class": "degrade"
    },
    {
      "icon": "🤖",
      "title": "⧐ Automatic namespacing ⧏",
      "details": "No need to worry if different teams or 3rd party providers using the same names for their types and interfaces. Create neater schemas by removing the 'MyCompanyName' prefix from your types, you won't need it.",
      "class": "degrade degrade-inverse"
    },
    {
      "iconAfter": "👩🏻‍🔧",
      "title": "⧐ Proactive warnings/deprecations ⧏",
      "details": "Issues with the query are shown in the response to the query, and not just when doing introspection. Avoid your users from never finding out that your schema has been upgraded!",
      "class": "degrade"
    }
  ],
  "wordpressTitle": "",
  "wordpressItems": [
    {
      "image": "/assets/wordpress-logo.png",
      "title": "WordPress-ready!",
      "details": "The GraphQL API for WordPress plugin brings all the power of GraphQL by PoP into your WordPress site",
      "actions": [
        {
          "text": "Download plugin for WordPress  →",
          "link": "https://graphql-api.com/download/"
        },
        {
          "text": "Visit GitHub repo  →",
          "link": "https://github.com/leoloso/PoP/tree/master/layers/GraphQLAPIForWP/plugins/graphql-api-for-wp",
        }
      ]
    }
  ],
  "footer": "Made with ❤️ by Leonardo Losoviz"
}
---

::: slot queries

# Query what you need. Get predictable results

<div class="queries-wrapper bleed">

<div class="queries">

<div class="query">

Send a GraphQL query to your API and get exactly the data you need.

```graphql
query PostsWithComments {
  posts {
    title
    comments {
      date
      content
      author {
        name
      }
    }
  }
}
```

</div>

<div class="query">

The response from the API always mirrors the GraphQL query.

```json
{
  "data": {
    "posts": [
      {
        "title": "Hello world!",
        "comments": [
          {
            "date": "2020-04-08",
            "content": "Check us out!",
            "author": {
              "name": "Leo"
            }
          }
        ]
      }
    ]
  }
}
```

</div>

</div>

</div>

:::

<!-- ::: slot extended-graphql-1

# Extend your server with innovative features

<div class="text-center">

![Extended GraphQL server](/assets/graphql-by-pop-logo-extended.svg)

</div>

## → Execute the query through the URL

The URL-based PoP Query Language (PQL) enables to send the query through GET, and use standard solutions for caching, file uploads, and others.

<div class="queries-wrapper">

<div class="queries">

<div class="query">

Send your query using the PQL via GET.

```less
/?query=
  posts.
    title|
    comments.
      date|
      content|
      author.
        name
```

</div>

<div class="query">

The response mirrors the shape of the query.

```json
{
  "data": {
    "posts": [
      {
        "title": "Hello world!",
        "comments": [
          {
            "date": "2020-04-08",
            "content": "Check us out!",
            "author": {
              "name": "Leo"
            }
          }
        ]
      }
    ]
  }
}
```

</div>

</div>

</div>

:::

::: slot extended-graphql-2

## → Add scripting-language capabilities to the query

PQL enables to compose fields, compose directives, control the execution order of the fields in the query, and much more. Resolve multiple operations in a single query.

<div class="queries-wrapper">

<div class="queries">

<div class="query">

Composed fields are resolved at the API-level.

```less
/?
format=Y-m-d&
query=
  posts.
    if (
      hasComments(),
      sprintf(
        "This post has %s comment(s) and title '%s'", [
          commentCount(),
          title()
        ]
      ),
      sprintf(
        "This post was created on %s and has no comments", [
          date(format: if(not(empty($format)), $format, d/m/Y))
        ]
      )
    )@postDesc
```

</div>

<div class="query">

A single query can produce complex results.

```json
{
  "data": {
    "posts": [
      {
        "postDesc": "This post was created on 2020-01-01 and has no comments"
      },
      {
        "postDesc": "This post has 1 comment(s) and title 'Hello world!'"
      },
      {
        "postDesc": "This post has 2 comment(s) and title 'Markup: HTML Tags and Formatting'"
      },
    ]
  }
}
```

</div>

</div>

</div>

::: -->

::: slot superpowers

# Superpower your API

<div class="bleed">

![Superpower your API](/assets/superheroes.png)

</div>

:::