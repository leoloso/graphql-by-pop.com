# Making `@skip` and `@include` Dynamic

Directives `@skip` and `@include` receive the condition to evaluate through argument `"if"`, which can only be the actual boolean value (`true` or `false`) or a variable with the boolean value (`$showExcerpt`), as in this query:

```graphql
query GetPostTitleAndMaybeExcerpt(
  $showExcerpt: Bool!
) {
  post(by: { id: 1 }) {
    id
    title
    excerpt @include(if: $showExcerpt)
  }
}
```

What about executing the `"if"` condition based on some property from the object itself? For instance, we may want to show the `excerpt` field based on the `Post` object having comments or not. 

Well, [directive `@export`](/docs/operational/export) makes this possible. For this query:

```graphql
query GetPostHasComments(
  $id: ID!
) {
  post(by: { id: $id }) {
    hasComments @export(as: "_hasComments")
  }
}

query ShowExcerptIfPostHasComments(
  $_hasComments: Boolean = false
) {
  post(by: { id: $id }) {
    title
    excerpt @include(if: $_hasComments)
  }
}
```

...the response will include field `excerpt` or not, depending on the queried post having comments or not. 

Let's check it out. <a href="https://newapi.getpop.org/graphiql/?query=%23%20Hack%20to%20allow%20GraphiQL%20to%20send%20multiple%20queries%20to%20the%20server%0Aquery%20__ALL%20%7B%20id%20%7D%0A%0Aquery%20GetPostHasComments(%0A%20%20%24id%3A%20ID!%0A)%20%7B%0A%20%20post(by:{id%3A%20%24id})%20%7B%0A%20%20%20%20hasComments%20%40export(as%3A%20%22_hasComments%22)%0A%20%20%7D%0A%7D%0A%0Aquery%20ShowExcerptIfPostHasComments(%0A%20%20%24_hasComments%3A%20Boolean%20%3D%20false%0A)%20%7B%0A%20%20post(by:{id%3A%20%24id})%20%7B%0A%20%20%20%20title%0A%20%20%20%20excerpt%20%40include(if%3A%20%24_hasComments)%0A%20%20%7D%0A%7D&operationName=__ALL&variables=%7B%0A%20%20%22id%22%3A%201%0A%7D">Running the query for post with ID `1`</a> produces this response:

![The response includes field `excerpt`](/images/dynamic-include-first-query.png)

<a href="https://newapi.getpop.org/graphiql/?query=%23%20Hack%20to%20allow%20GraphiQL%20to%20send%20multiple%20queries%20to%20the%20server%0Aquery%20__ALL%20%7B%20id%20%7D%0A%0Aquery%20GetPostHasComments(%0A%20%20%24id%3A%20ID!%0A)%20%7B%0A%20%20post(by:{id%3A%20%24id})%20%7B%0A%20%20%20%20hasComments%20%40export(as%3A%20%22_hasComments%22)%0A%20%20%7D%0A%7D%0A%0Aquery%20ShowExcerptIfPostHasComments(%0A%20%20%24_hasComments%3A%20Boolean%20%3D%20false%0A)%20%7B%0A%20%20post(by:{id%3A%20%24id})%20%7B%0A%20%20%20%20title%0A%20%20%20%20excerpt%20%40include(if%3A%20%24_hasComments)%0A%20%20%7D%0A%7D&operationName=__ALL&variables=%7B%0A%20%20%22id%22%3A%201499%0A%7D">Running the query for post with ID `1499`</a> produces this response:

![The response includes field `excerpt`](/images/dynamic-include-second-query.png)

As it can be seen, `@include` became dynamic: the same query produces different results based on some property from the queried object itself, and not from an external variable.

This features works only when the exported variable (in this case, `$_hasComments`) concerns a single value, but not for lists. This is because the algorithm evaluates the `if` condition for all objects in the list in the same iteration, overriding each other; then, when this result is checked to perform the `@skip`/`@include` validation in some later iteration from the algorithm, only the value from the last object in the list will be available.
