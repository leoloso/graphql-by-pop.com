# Manipulating the Field Resolution Order

The goal for the [`@export` directive](/docs/operational/export) in GraphQL is to export the value of a field (or set of fields) into a variable, to be used somewhere else in the query. 

This directive would not work if reading the variable takes place before exporting the value into the variable. Hence, the engine needs to provide a way to control the field execution order. 

GraphQL by PoP provides a way to manipulate the field execution order through the query itself. The engine loads data in iterations for each type, first resolving all fields from the first type it encounters in the query, then resolving all fields from the second type it encounters in the query, and so on until there are no more types to process. 

For instance, the following query involving objects of type `Director`, `Film` and `Actor`:

```graphql
{
  directors {
    name
    films {
      title
      actors {
        name
      }
    }
  }
}
```

...is resolved by the GraphQL engine in this order:

![Dealing with types in iterations](/images/dataloading-engine-type-iterations.png "Dealing with types in iterations")

If after processed, a type is referenced again in the query to retrieve non-loaded data (eg: from additional objects, or additional fields from already-loaded objects), then the type is added again at the end of the iteration list.

For instance, if we also query the `Actor`'s `preferredDirector` field (which returns an object of type `Director`) like this:

```graphql
{
  directors {
    name
    films {
      title
      actors {
        name
        preferredDirector {
          name
        }
      }
    }
  }
}
```

...then the GraphQL engine processes the query in this order:

![Repeated types in iterations](/images/dataloading-engine-repeated-type-iterations.png "Repeated types in iterations")

Let's see how this plays out for executing `@export` in a single query. For our first attempt, we create the query as we would normally do, without thinking about the execution order of the fields:

```graphql
query GetPostsAuthorNames($_authorName: String = "") {
  user(by: { id: 1 }) {
    name @export(as: "_authorName")
  }
  posts(filter:{ search: $_authorName }) {
    id
    title
  }
}
```

When [running the query](https://newapi.getpop.org/graphiql/?query=query%20GetPostsAuthorNames(%24_authorName%3A%20String%20%3D%20%22%22)%20%7B%0A%20%20user(by:{id%3A%201})%20%7B%0A%20%20%20%20name%20%40export(as%3A%20%22_authorName%22)%0A%20%20%7D%0A%20%20posts(filter:{search%3A%20%24_authorName})%20%7B%0A%20%20%20%20id%0A%20%20%20%20title%0A%20%20%7D%0A%7D&operationName=GetPostsAuthorNames), it produces this response:

![Executing a query using a variable](/images/third-query.png)

...which contains the following error:

```json
{
  "errors": [
    {
      "message": "Expression '_authorName' is undefined",
    }
  ]
}
```

This error means that, by the time variable `$_authorName` was read, it had not been set yet; it was `undefined`.

Let's see why this happens. First, we analyze what types appear in the query, added as comments below:

```graphql
# Type: Root
query GetPostsAuthorNames($_authorName: String = "") {
  # Type: User
  user(by: {id: 1}) {
    # Type: String
    name @export(as: "_authorName")
  }
  # Type: Post
  posts(filter:{ search: $_authorName }) {
    # Type: ID
    id
    # Type: String
    title
  }
}
```

To process the types and load their data, the data-loading engine adds the query type `Root` into a FIFO (First-In, First-Out) list, thus making `[Root]` the initial list passed to the algorithm, and then iterates over the types sequentially, like this:

<table class="table">
<thead>
<tr>
<th>#</th><th>Operation</th><th>List</th>
</tr>
</thead>
<tbody>
<tr><td>0</td><td>Prepare FIFO list</td><td><code>[Root]</code></td></tr>
<tr><td>1a</td><td>Pop the first type of the list (<code>Root</code>)</td><td><code>[]</code></td></tr>
<tr><td>1b</td><td>Process all fields queried from the <code>Root</code> type:<br/>→ <code>user(by: {id: 1})</code><br/>→ <code>posts(filter:{ search: $_authorName })</code><br/>Add their types (<code>User</code> and <code>Post</code>) to the list</td><td><code>[User, Post]</code></td></tr>
<tr><td>2a</td><td>Pop the first type of the list (<code>User</code>)</td><td><code>[Post]</code></td></tr>
<tr><td>2b</td><td>Process the field queried from the <code>User</code> type:<br/>→ <code>name @export(as: "_authorName")</code><br/>Because it is a scalar type (<code>String</code>), there is no need to add it to the list</td><td><code>[Post]</code></td></tr>
<tr><td>3a</td><td>Pop the first type of the list (<code>Post</code>)</td><td><code>[]</code></td></tr>
<tr><td>3b</td><td>Process all fields queried from the <code>Post</code> type:<br/>→ <code>id</code><br/>→ <code>title</code><br/>Because these are scalar types (<code>ID</code> and <code>String</code>), there is no need to add them to the list</td><td><code>[]</code></td></tr>
<tr><td>4</td><td>List is empty, iteration ends.</td><td>&nbsp;</td></tr>
</tbody>
</table>

Here we can see the problem: `@export` is executed on step `2b`, but it was read on step `1b`. 

It is here that we need to control the field execution flow. The solution implemented is to delay when the exported variable is read, achieved by artificially querying for field [`self`](https://github.com/getpop/component-model/blob/57a27af3841da284ea59c6f7ff3a9b4c0befa472/src/FieldResolvers/CoreFieldResolver.php) from type `Root`.

The `self` field, as its name indicates, returns the same object; applied to the `Root` object, it returns the same `Root` object. You may wonder: "if I already have the root object, then why would I need to retrieve it again?". Because then the engine's algorithm will need to add this new reference to `Root` at the end of the FIFO list, and we can deliberately distribute the queried fields before or after every one of these iterations.

That's why field `posts(filter:{ search: $_authorName })` is placed inside a `self` field in the query above, and [running the query](https://newapi.getpop.org/graphiql/?query=query%20GetPostsAuthorNames(%24_authorName%3A%20String%20%3D%20%22%22)%20%7B%0A%20%20user(by:{id%3A%201})%20%7B%0A%20%20%20%20name%20%40export(as%3A%20%22_authorName%22)%0A%20%20%7D%0A%20%20self%20%7B%0A%20%20%20%20posts(filter:{search%3A%20%24_authorName})%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20title%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D&operationName=GetPostsAuthorNames) produces the expected response:

```graphql
query GetPostsAuthorNames($_authorName: String = "") {
  user(by: {id: 1}) {
    name @export(as: "_authorName")
  }
  self {
    posts(filter:{ search: $_authorName }) {
      id
      title
    }
  }
}
```

![Running the first query with `@export`](/images/first-query.png)

Let's explore the order in which types are processed for this query, to understand why it works well:

<table class="table">
<thead>
<tr>
<th>#</th><th>Operation</th><th>List</th>
</tr>
</thead>
<tbody>
<tr><td>0</td><td>Prepare FIFO list</td><td><code>[Root]</code></td></tr>
<tr><td>1a</td><td>Pop the first type of the list (<code>Root</code>)</td><td><code>[]</code></td></tr>
<tr><td>1b</td><td>Process all fields queried from the <code>Root</code> type:<br/>→ <code>user(by: {id: 1})</code><br/>→ <code>self</code><br/>Add their types (<code>User</code> and <code>Root</code>) to the list</td><td><code>[User, Root]</code></td></tr>
<tr><td>2a</td><td>Pop the first type of the list (<code>User</code>)</td><td><code>[Root]</code></td></tr>
<tr><td>2b</td><td>Process the field queried from the <code>User</code> type:<br/>→ <code>name @export(as: "_authorName")</code><br/>Because it is a scalar type (<code>String</code>), there is no need to add it to the list</td><td><code>[Root]</code></td></tr>
<tr><td>3a</td><td>Pop the first type of the list (<code>Root</code>)</td><td><code>[]</code></td></tr>
<tr><td>3b</td><td>Process the field queried from the <code>Root</code> type:<br/>→ <code>posts(filter:{ search: $_authorName })</code><br/>Add its type (<code>Post</code>) to the list</td><td><code>[Post]</code></td></tr>
<tr><td>4a</td><td>Pop the first type of the list (<code>Post</code>)</td><td><code>[]</code></td></tr>
<tr><td>4b</td><td>Process all fields queried from the <code>Post</code> type:<br/>→ <code>id</code><br/>→  <code>title</code><br/>Because these are scalar types (<code>ID</code> and <code>String</code>), there is no need to add them to the list</td><td><code>[]</code></td></tr>
<tr><td>5</td><td>List is empty, iteration ends.</td><td>&nbsp;</td></tr>
</tbody>
</table>

Now, we can see that the problem has been resolved: `@export` is executed on step `2b`, and it is read on step `3b`.