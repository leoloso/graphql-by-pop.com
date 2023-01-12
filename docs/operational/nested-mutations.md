# Nested mutations

Nested mutations is the ability to perform mutations on a type other than the root type in GraphQL.

For instance, [this standard mutation](https://newapi.getpop.org/graphiql/?query=mutation%20%7B%0A%20%20updatePost(input:{id%3A%201459%2C%20title%3A%20%22New%20title%22})%20%7B%0A%20%20%20%20title%0A%20%20%7D%0A%7D) executed at the top level:

```graphql
mutation {
  updatePost(input: {
    id: 1459,
    title: "New title"
  }) {
    title
  }
}
```

Could also be executed through [this nested mutation](https://newapi.getpop.org/graphiql/?mutation_scheme=nested&query=mutation%20%7B%0A%20%20post(by:{id%3A%201459})%20%7B%0A%20%20%20%20update(input:{title%3A%20%22New%20title%22})%20%7B%0A%20%20%20%20%20%20title%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D), on type `Post`:

```graphql
mutation {
  post(by: { id: 1459 }) {
    update(input: {
      title: "New title"
    }) {
      title
    }
  }
}
```

<!-- ::: details View PQL query

```less
/?query=
  post(by: { id: 1459 }).
    update(input: {
      title: New title
    }).
      title
```

[<a href="https://newapi.getpop.org/api/graphql/?query=post(by:{id:1459}).update(input:{title:New%20title}).title">View query results</a>]

::: -->

Mutations can also be nested, modifying data on the result from another mutation.

In [this query](https://newapi.getpop.org/graphiql/?mutation_scheme=nested&query=%23mutation%20%7B%0A%23%20%20loginUser(by:{credentials:{%0A%23%20%20%20%20usernameOrEmail%3A%22test%22%2C%0A%23%20%20%20%20password%3A%22pass%22%0A%23%20%20}})%20%7B%0A%23%20%20%20%20id%0A%23%20%20%20%20name%0A%23%20%20%7D%0A%23%7D%0Amutation%20%7B%0A%20%20post(by:{id%3A%201459})%20%7B%0A%20%20%20%20title%0A%20%20%20%20addComment(input:{comment%3A%20%22Nice%20tango!%22})%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20content%0A%20%20%20%20%20%20reply(input:{comment%3A%20%22Can%20you%20dance%20like%20that%3F%22})%20%7B%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20content%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D), we obtain the post entity through `Root.post`, then execute mutation `Post.addComment` on it and obtain the created comment object, and finally execute mutation `Comment.reply` on this latter object:

```graphql
mutation {
  post(by: { id: 1459 }) {
    title
    addComment(input:{
      comment: "Nice tango!"
    }) {
      id
      content
      reply(input:{
        comment: "Can you dance like that?"
      }) {
        id
        content
      }
    }
  }
}
```

<!-- ::: details View PQL query

```less
/?query=
  post(by: { id: 1459 }).
    title|
    addComment(input: {
      comment: Nice tango!
    }).
      id|
      content|
      reply(input: {
        comment: Can you dance like that?
      }).
        id|
        content
```

[<a href="https://newapi.getpop.org/api/graphql/?query=post(by:{id:1459}).title|addComment(input:{comment:Nice%20tango!}).id|content|reply(input:{comment:Can%20you%20dance%20like%20that?}).id|content">View query results</a>]

::: -->

Producing this response:

```json
{
  "data": {
    "post": {
      "title": "A lovely tango, not with leo",
      "addComment": {
        "id": 117,
        "content": "<p>Nice tango!</p>\n",
        "reply": {
          "id": 118,
          "content": "<p>Can you dance like that?</p>\n"
        }
      }
    }
  }
}
```

## Changing the schema root type to `Root`

For the standard behavior, queries and mutations are handled separately, through two different root types: The `QueryRoot` and the `MutationRoot`.

![Standard root types](/images/schema-docs-root-types.png)

In this sitatuation, `MutationRoot` is the only type in the whole GraphQL schema which can contain mutation fields. However, this situation is different with nested mutations, since then every single type can execute a mutation (not just the root type), and at any level of the query (not just at the top).

Since both query and mutation fields can be added to a same type, then the `MutationRoot` type doesn't make sense anymore, and types `QueryRoot` and `MutationRoot` are merged into a single type `Root` handling both query and mutation fields.

![Standard root types](/images/schema-docs-nested-mutation.png)

## Removing "duplicate" fields from the root?

With nested mutations, mutation fields may be added two times to the schema:

- once under the `Root` type
- once under the specific type

For instance, these fields can be considered a "duplicate":

- `Root.updatePost`
- `Post.update`

We can decide to keep both of them, or remove the ones from the `Root` type, which are redundant. This is accomplished through environment settings (check section at the bottom).

## Validating mutations via the operation type

To execute mutations, the operation type must be `mutation`. This applies to nested mutations also.

For instance, if <a href="(https://newapi.getpop.org/graphiql/?mutation_scheme=nested&query=query%20%7B%0A%20%20post(by:{id%3A%201459})%20%7B%0A%20%20%20%20title%0A%20%20%20%20addComment(input:{comment%3A%20%22Hi%20there%22})%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20content%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D)" target="_blank">this query</a> is executed:

```graphql
query {
  post(by: { id: 1459 }) {
    title
    addComment(input:{
      comment: "Hi there"
    }) {
      id
      content
    }
  }
}
```

it would produce an error, indicating that mutation `addComment` cannot be executed because the query is using operation type `query`:

```json
{
  "errors": [
    {
      "message": "Use the operation type 'mutation' to execute mutations",
      "extensions": {
        "type": "Post",
        "id": 1459,
        "field": "addComment(input: { comment:\"Hi there\" })"
      }
    }
  ],
  "data": {
    "post": {
      "title": "A lovely tango, not with leo"
    }
  }
}
```

<a href="https://newapi.getpop.org/graphiql/?mutation_scheme=nested&query=%23%20%23%20Uncomment%20this%20mutation%20to%20log%20the%20user%20in%0A%23%20mutation%20%7B%0A%23%20%20%20loginUser(by:{credentials:%0A%23%20%20%20%20%20usernameOrEmail%3A%22test%22%2C%0A%23%20%20%20%20%20password%3A%22pass%22%0A%23%20%20%20}})%20%7B%0A%23%20%20%20%20%20id%0A%23%20%20%20%20%20name%0A%23%20%20%20%7D%0A%23%20%7D%0Amutation%20%7B%0A%20%20post(by:{id%3A%201459})%20%7B%0A%20%20%20%20title%0A%20%20%20%20addComment(input:{comment%3A%20%22Hi%20there%22})%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20content%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D" target="_blank">This query</a> will instead work well:

```graphql
mutation {
  post(by: { id: 5 }) {
    title
    update(input: {
      title: "New title"
    }) {
      newTitle: title
    }
  }
}
```

## Executing a single mutation on multiple objects

Using nested mutations, we can mutate several fields at once without modifying or duplicating any field from the schema, as is usually required for the standard behavior (eg: to accept a param `ids: [ID]!` for the multiple objects, instead of `id: ID!`).

For instance, [this query](https://newapi.getpop.org/graphiql/?mutation_scheme=nested&query=%23mutation%20%7B%0A%23%20%20loginUser(by:{credentials:%0A%23%20%20%20%20usernameOrEmail%3A%22test%22%2C%0A%23%20%20%20%20password%3A%22pass%22%0A%23%20%20}})%20%7B%0A%23%20%20%20%20id%0A%23%20%20%20%20name%0A%23%20%20%7D%0A%23%7D%0Amutation%20%7B%0A%20%20posts(pagination:{limit%3A%203})%20%7B%0A%20%20%20%20title%0A%20%20%20%20addComment(input:{comment%3A%20%22First%20comment%20on%20several%20posts%22})%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20content%0A%20%20%20%20%20%20reply(input:{comment%3A%20%22Response%20to%20my%20own%20parent%20comment%22})%20%7B%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20content%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D) adds the same comment to several posts:

```graphql
mutation {
  posts(pagination: { limit: 3 }) {
    title
    addComment(input: {
      comment: "First comment on several posts"
    }) {
      id
      content
      reply(input: {
        comment: "Response to my own parent comment"
      }) {
        id
        content
      }
    }
  }
}
```

<!-- ::: details View PQL query

```less
/?query=
  posts(pagination: { limit: 3 }).
    title|
    addComment(input: { comment: First comment on several posts }).
      id|
      content|
      reply(input: { comment: Response to my own parent comment }).
        id|
        content
```

[<a href="https://newapi.getpop.org/api/graphql/?query=posts(pagination:{limit:3}).title|addComment(input:{comment:First%20comment%20on%20several%20posts}).id|content|reply(input:{comment:Response%20to%20my%20own%20parent%20comment}).id|content">View query results</a>]

::: -->

Which produces this response:

```json
{
  "data": {
    "posts": [
      {
        "title": "Scheduled by Leo",
        "addComment": {
          "id": 126,
          "content": "<p>First comment on several posts</p>\n",
          "reply": {
            "id": 129,
            "content": "<p>Response to my own parent comment</p>\n"
          }
        }
      },
      {
        "title": "COPE with WordPress: Post demo containing plenty of blocks",
        "addComment": {
          "id": 127,
          "content": "<p>First comment on several posts</p>\n",
          "reply": {
            "id": 130,
            "content": "<p>Response to my own parent comment</p>\n"
          }
        }
      },
      {
        "title": "A lovely tango, not with leo",
        "addComment": {
          "id": 128,
          "content": "<p>First comment on several posts</p>\n",
          "reply": {
            "id": 131,
            "content": "<p>Response to my own parent comment</p>\n"
          }
        }
      }
    ]
  }
}
```

## Visualizing the mutation fields in the schema

Since a type now contains query and mutation fields, we may want to clearly visualize which is which, for instance on the docs when [using GraphiQL](https://newapi.getpop.org/graphiql/?mutation_scheme=nested).

Unfortunately, because there is no `isMutation` flag available on type `__Field` when doing introspection, then the solution employed is a bit hacky, and not completely satisfying: prepending label `"[Mutation] "` on the field's description:

![Description for type `Root` in GraphiQL docs](/images/mutation-desc-in-graphiql-docs.png)

In addition, GraphQL by PoP has added field `extensions` to type `__Field` (hidden from the schema, since it is not currently supported by the spec), as to retrieve the custom extension data, as done in [this introspection query](https://newapi.getpop.org/graphiql/?mutation_scheme=nested&query=query%20%7B%0A%20%20__schema%20%7B%0A%20%20%20%20queryType%20%7B%0A%20%20%20%20%20%20fields%20%7B%0A%20%20%20%20%20%20%20%20name%0A%20%20%20%20%20%20%20%20extensions%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D):

```graphql
query {
  __schema {
    queryType {
      fields {
        name
        # This field is not currently part of the spec
        extensions
      }
    }
  }
}
```

Which will produce these results (notice entries with `isMutation: true`):

```json
{
  "data": {
    "__schema": {
      "queryType": {
        "fields": [
          {
            "name": "addCommentToCustomPost",
            "extensions": {
              "isMutation": true
            }
          },
          {
            "name": "createPost",
            "extensions": {
              "isMutation": true
            }
          },
          {
            "name": "customPost",
            "extensions": []
          },
          {
            "name": "customPosts",
            "extensions": []
          },
          {
            "name": "loginUser",
            "extensions": {
              "isMutation": true
            }
          }
        ]
      }
    }
  }
}

```

## GraphQL spec

This functionality is currently not part of the GraphQL spec, but it has been requested:

- [Proposal: Serial fields (nested mutations)](https://github.com/graphql/graphql-spec/issues/252)

## Configuration

### Environment variables

| Environment variable | Description | Default |
| --- | --- | --- |
| `ENABLE_NESTED_MUTATIONS` | Enable using nested mutations | `false` |
| `DISABLE_REDUNDANT_ROOT_TYPE_MUTATION_FIELDS` | Disable the redundant (or duplicate) mutation fields from the root type (to be set if nested mutations are enabled) | `false` |
