# @export

The goal for an `@export` directive in GraphQL is to export the value of a field (or set of fields) into a variable, to be used somewhere else in the query. Its most evident use case is to combine 2 queries into 1, avoiding the second query to wait for the 1st one to be executed, improving performance. There is a proposal to add it to the GraphQL spec, through issue [[RFC] Dynamic variable declaration](https://github.com/graphql/graphql-spec/issues/583).

How is this directive employed? Let's suppose we want to search all posts which mention the name of the logged-in user. Normally, we would need 2 queries to accomplish this: 

We first retrieve the user's `name`:

```graphql
query GetLoggedInUserName {
  me {
    name
  }
}
```

...and then, having executed the first query, we can pass the retrieved user's `name` as variable `$search` to perform the search in a second query:

```graphql
query GetPostsContainingString($search: String = "") {
  posts(search: $search) {
    id
    title
  }
}
```

The `@export` directive allows to export the value from a field, and inject this value into a second field through a dynamic variable (whose name is defined under argument `as`), thus combining the 2 queries into 1:

```graphql
query GetPostsContainingLoggedInUserName($search: String = "") {
  me {
    name @export(as: "search")
  }
  posts(search: $search) {
    id
    title
  }
}
```

## Combinations of data to export

As seen in the query above, `@export` must handle exporting a single value from a single field: the user's `name`. 

Fields returning lists should also be exportable. For instance, in the query below, the exported value is the list of names from the logged-in user's friends (hence the type of the `$search` variable went from `String` to `[String]`):

```graphql
query GetPostsContainingLoggedInUserName($search: [String] = []) {
  me {
    friends {
      name @export(as: "search")
    }
  }
  posts(searchAny: $search) {
    id
    title
  }
}
```

::: tip

Please notice that argument `"as"` is used to define the dynamic variable's name also to export lists.

:::

We may also need to export several properties from a same object. Then, `@export` also allows to export these properties to the same variable, as a dictionary of values.

For instance, the query could export both the `name` and `surname` fields from the user, and have a `searchByAnyProperty` input that receives a dictionary (for which, the input type changed to `Map`):

```graphql
query GetPostsContainingLoggedInUserName($search: Map = {}) {
  me {
    name @export(as: "search")
    surname @export(as: "search")
  }
  posts(searchByAnyProperty: $search) {
    id
    title
  }
}
```

And then, similar to upgrading from a single value to a list of values, we can upgrade from a single dictionary to a list of dictionaries.

For instance, we could export fields `name` and `surname` from the list of the logged-in user's friends (for which, the input type changed to `[Map]`):

```graphql
query GetPostsContainingLoggedInUserName($search: [Map] = []) {
  me {
    friends {
      name @export(as: "search")
      surname @export(as: "search")
    }
  }
  posts(searchAnyByAnyProperty: $search) {
    id
    title
  }
}
```

In summary, `@export` handles these 4 cases:

1. Exporting a single value from a single field
2. Exporting a list of values from a single field
3. Exporting a dictionary of values, containing several fields from the same object
4. Exporting a list of a dictionary of values, with each dictionary containing several fields from the same object

## Implementation

The implementation for `@export`, handling all 4 cases detailed above, is [this one](https://github.com/getpop/graphql/blob/109d194c11dd2510d0ea5ce42b88fb556397400c/src/DirectiveResolvers/ExportDirectiveResolver.php). 

The reasons why the variable name starts with `_`, why the query uses a field called `self`, and why the input has a default value even though it is never used, will be explained later on.

Let's see how it behaves.

### Executing the first case

The query below extracts the user's `name` into variable `$_authorName`, and then performs a search of all posts containing this string

```graphql
query GetPostsAuthorNames($_authorName: String = "") {
  user(id: 1) {
    name @export(as: "_authorName")
  }
  self {
    posts(searchfor: $_authorName) {
      id
      title
    }
  }
}
```

When [running the query](https://newapi.getpop.org/graphiql/?query=query%20GetPostsAuthorNames(%24_authorName%3A%20String%20%3D%20%22%22)%20%7B%0A%20%20user(id%3A%201)%20%7B%0A%20%20%20%20name%20%40export(as%3A%20%22_authorName%22)%0A%20%20%7D%0A%20%20self%20%7B%0A%20%20%20%20posts(searchfor%3A%20%24_authorName)%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20title%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D&operationName=GetPostsAuthorNames), it produces this response:

![Running the first query with `@export`](/images/first-query.png)

It works: obtaining the user's name `"leo"`, and searching for all posts containing the keyword `"leo"`, was performed within the same query.

### Executing all 4 cases


This query:

```graphql
query GetSomeData(
  $_firstPostTitle: String = "",
  $_postTitles: [String] = [],
  $_firstPostData: Mixed = {},
  $_postData: [Mixed] = []
) {
  post(id: 1) {
    title @export(as:"_firstPostTitle")
    title @export(as:"_firstPostData")
    date @export(as:"_firstPostData")
  }
  posts(limit: 2) {
    title @export(as:"_postTitles")
    title @export(as:"_postData")
    date @export(as:"_postData")
  }
  self {
    _firstPostTitle: echoVar(variable: $_firstPostTitle)
    _postTitles: echoVar(variable: $_postTitles)
    _firstPostData: echoVar(variable: $_firstPostData)
    _postData: echoVar(variable: $_postData)
  }
}
```

...comprises the 4 cases that `@export` must handle, like this:

Case 1 - `@export` a single value:

```graphql
post(id: 1) {
  title @export(as: "_firstPostTitle")
}
```

Case 2 - `@export` a list of values:

```graphql
posts(limit: 2) {
  title @export(as: "_postTitles")
}
```

Case 3 - `@export` a dictionary of field/value, containing 2 properties (`title` and `date`) from the same object:

```graphql
post(id: 1) {
  title @export(as: "_firstPostData")
  date @export(as: "_firstPostData")
}
```

Case 4 - `@export` a list of dictionaries of field/value:

```graphql
posts(limit: 2) {
  title @export(as: "_postData")
  date @export(as: "_postData")
}
```

The query uses field `echoVar` to visualize the content of the dynamic variables. When [running the query](https://newapi.getpop.org/graphiql/?query=query%20GetSomeData(%0A%20%20%24_firstPostTitle%3A%20String%20%3D%20%22%22%2C%0A%20%20%24_postTitles%3A%20%5BString%5D%20%3D%20%5B%5D%2C%0A%20%20%24_firstPostData%3A%20Mixed%20%3D%20%7B%7D%2C%0A%20%20%24_postData%3A%20%5BMixed%5D%20%3D%20%5B%5D%0A)%20%7B%0A%20%20post(id%3A1)%20%7B%0A%20%20%20%20title%20%40export(as%3A%22_firstPostTitle%22)%0A%20%20%20%20title%20%40export(as%3A%22_firstPostData%22)%0A%20%20%20%20date%20%40export(as%3A%22_firstPostData%22)%0A%20%20%7D%0A%20%20posts(limit%3A2)%20%7B%0A%20%20%20%20title%20%40export(as%3A%22_postTitles%22)%0A%20%20%20%20title%20%40export(as%3A%22_postData%22)%0A%20%20%20%20date%20%40export(as%3A%22_postData%22)%0A%20%20%7D%0A%20%20self%20%7B%0A%20%20%20%20_firstPostTitle%3A%20echoVar(variable%3A%20%24_firstPostTitle)%0A%20%20%20%20_postTitles%3A%20echoVar(variable%3A%20%24_postTitles)%0A%20%20%20%20_firstPostData%3A%20echoVar(variable%3A%20%24_firstPostData)%0A%20%20%20%20_postData%3A%20echoVar(variable%3A%20%24_postData)%0A%20%20%7D%0A%7D&operationName=GetSomeData), it produces this response:

![Running the second query with `@export`](/images/second-query.png)

Once again, it works, as the response contains the results handling all 4 cases:

Case 1 - `@export` a single value:

```json
{
  "data": {
    "self": {
      "_firstPostTitle": "Hello world!"
    }
  }
}
```

Case 2 - `@export` a list of values:

```json
{
  "data": {
    "self": {
      "_postTitles": [
        "Scheduled by Leo",
        "COPE with WordPress: Post demo containing plenty of blocks"
      ]
    }
  }
}
```

Case 3 - `@export` a dictionary of field/value, containing 2 properties (`title` and `date`) from the same object:

```json
{
  "data": {
    "self": {
      "_firstPostData": {
        "title": "Hello world!",
        "date": "August 2, 2019"
      }
    }
  }
}
```

Case 4 - `@export` a list of dictionaries of field/value:

```json
{
  "data": {
    "self": {
      "_postData": [
        {
          "title": "Scheduled by Leo",
          "date": "January 1, 2020"
        },
        {
          "title": "COPE with WordPress: Post demo containing plenty of blocks",
          "date": "August 8, 2019"
        }
      ]
    }
  }
}
```

## Gotchas of this solution

Nothing is perfect: in order for `@export` to work, the query must be coded with the following 3 peculiarities:

1. The name of the dynamic variable must start with `"_"`
2. Field `self` may be required to control the order in which fields are resolved
3. The dynamic variable must be declared as a static (i.e. "normal") variable in the operation name, and always receive a default value

Let's see why these are mandatory and how they work, one by one.

### 1. The name of the dynamic variable must start with `"_"`

For the solution, it was decided that `@export` will export the value into a normal variable, accessible as `$variable`. As a consequence, the query needs to declare the exported variables in the operation name.

Static variables and dynamic variables behave differently: while the value for a static variable can be determined when parsing the query, the value for a dynamic variable must be determined on runtime, right when reading the value of the variable. Then, the GraphQL by PoP engine must be able to tell which way to treat a variable, if the static or the dynamic way.

In order to avoid introducing new, unsupported syntax into the query (such as having `$staticVariables` and `%dynamicVariables%`), the solution is to have the dynamic variable name start with `"_"`, such as `$_dynamicVariable`. Then, if the name of the variable starts with `"_"`, the engine treats it as dynamic and doesn't resolve it when parsing the query; otherwise, it is treated as a static variable.

### 2. Field `self` may be required to control the order in which fields are resolved

The `@export` directive would not work if reading the variable takes place before exporting the value into the variable. Hence, the engine needs to provide a way to control the field execution order. 

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

Let's see how this plays out for executing `@export`. For our first attempt, we create the query as we would normally do, without thinking about the execution order of the fields:

```graphql
query GetPostsAuthorNames($_authorName: String = "") {
  user(id: 1) {
    name @export(as: "_authorName")
  }
  posts(searchfor: $_authorName) {
    id
    title
  }
}
```

When [running the query](https://newapi.getpop.org/graphiql/?query=query%20GetPostsAuthorNames(%24_authorName%3A%20String%20%3D%20%22%22)%20%7B%0A%20%20user(id%3A%201)%20%7B%0A%20%20%20%20name%20%40export(as%3A%20%22_authorName%22)%0A%20%20%7D%0A%20%20posts(searchfor%3A%20%24_authorName)%20%7B%0A%20%20%20%20id%0A%20%20%20%20title%0A%20%20%7D%0A%7D&operationName=GetPostsAuthorNames), it produces this response:

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
  user(id: 1) {
    # Type: String
    name @export(as: "_authorName")
  }
  # Type: Post
  posts(searchfor: $_authorName) {
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
<tr><td>1b</td><td>Process all fields queried from the <code>Root</code> type:<br/>→ <code>user(id: 1)</code><br/>→ <code>posts(searchfor: $_authorName)</code><br/>Add their types (<code>User</code> and <code>Post</code>) to the list</td><td><code>[User, Post]</code></td></tr>
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

This is a hack, however it allows to effectively control the order in which fields are resolved.

That's why field `posts(searchfor: $_authorName)` is placed inside a `self` field in the query above, and [running the query](https://newapi.getpop.org/graphiql/?query=query%20GetPostsAuthorNames(%24_authorName%3A%20String%20%3D%20%22%22)%20%7B%0A%20%20user(id%3A%201)%20%7B%0A%20%20%20%20name%20%40export(as%3A%20%22_authorName%22)%0A%20%20%7D%0A%20%20self%20%7B%0A%20%20%20%20posts(searchfor%3A%20%24_authorName)%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20title%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D&operationName=GetPostsAuthorNames) produces the expected response:

```graphql
query GetPostsAuthorNames($_authorName: String = "") {
  user(id: 1) {
    name @export(as: "_authorName")
  }
  self {
    posts(searchfor: $_authorName) {
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
<tr><td>1b</td><td>Process all fields queried from the <code>Root</code> type:<br/>→ <code>user(id: 1)</code><br/>→ <code>self</code><br/>Add their types (<code>User</code> and <code>Root</code>) to the list</td><td><code>[User, Root]</code></td></tr>
<tr><td>2a</td><td>Pop the first type of the list (<code>User</code>)</td><td><code>[Root]</code></td></tr>
<tr><td>2b</td><td>Process the field queried from the <code>User</code> type:<br/>→ <code>name @export(as: "_authorName")</code><br/>Because it is a scalar type (<code>String</code>), there is no need to add it to the list</td><td><code>[Root]</code></td></tr>
<tr><td>3a</td><td>Pop the first type of the list (<code>Root</code>)</td><td><code>[]</code></td></tr>
<tr><td>3b</td><td>Process the field queried from the <code>Root</code> type:<br/>→ <code>posts(searchfor: $_authorName)</code><br/>Add its type (<code>Post</code>) to the list</td><td><code>[Post]</code></td></tr>
<tr><td>4a</td><td>Pop the first type of the list (<code>Post</code>)</td><td><code>[]</code></td></tr>
<tr><td>4b</td><td>Process all fields queried from the <code>Post</code> type:<br/>→ <code>id</code><br/>→  <code>title</code><br/>Because these are scalar types (<code>ID</code> and <code>String</code>), there is no need to add them to the list</td><td><code>[]</code></td></tr>
<tr><td>5</td><td>List is empty, iteration ends.</td><td>&nbsp;</td></tr>
</tbody>
</table>

Now, we can see that the problem has been resolved: `@export` is executed on step `2b`, and it is read on step `3b`.

### 3. The dynamic variable must be declared as a static variable in the operation name, and always receive a default value

The GraphQL parser still treats a dynamic variable as a variable, hence it validates that it has been defined, and that it has a value on parsing time, or it throws an error `"The variable has not been set"`.

To avoid this error (which halts execution of the query), we must always define the variable in the operation name, and provide a default value for that argument, even if this value won't be used.

## Bonus: making `@skip` and `@include` dynamic

Directives `@skip` and `@include` receive the condition to evaluate through argument `"if"`, which can only be the actual boolean value (`true` or `false`) or a variable with the boolean value (`$showExcerpt`), as in this query:

```graphql
query GetPostTitleAndMaybeExcerpt(
  $showExcerpt: Bool!
) {
  post(id: 1) {
    id
    title
    excerpt @include(if: $showExcerpt)
  }
}
```

What about executing the `"if"` condition based on some property from the object itself? For instance, we may want to show the `excerpt` field based on the `Post` object having comments or not. 

Well, directive `@export` makes this possible. For this query:

```graphql
query ShowExcerptIfPostHasComments(
  $id: ID!,
  $_hasComments: Boolean = false
) {
  post(id: $id) {
    hasComments @export(as: "_hasComments")
  }
  self {
    post(id: $id) {
      title
      excerpt @include(if: $_hasComments)
    }
  }
}
```

...the response will include field `excerpt` or not, depending on the queried post having comments or not. 

Let's check it out. [Running the query for post with ID `1`](https://newapi.getpop.org/graphiql/?query=query%20ShowExcerptIfPostHasComments(%0A%20%20%24id%3A%20ID!%2C%0A%20%20%24_hasComments%3A%20Boolean%20%3D%20false%0A)%20%7B%0A%20%20post(id%3A%20%24id)%20%7B%0A%20%20%20%20hasComments%20%40export(as%3A%20%22_hasComments%22)%0A%20%20%7D%0A%20%20self%20%7B%0A%20%20%20%20post(id%3A%20%24id)%20%7B%0A%20%20%20%20%20%20title%0A%20%20%20%20%20%20excerpt%20%40include(if%3A%20%24_hasComments)%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D&operationName=ShowExcerptIfPostHasComments&variables=%7B%0A%20%20%22id%22%3A%201%0A%7D) produces this response:

![The response includes field `excerpt`](/images/dynamic-include-first-query.png)

[Running the query for post with ID `1499`](https://newapi.getpop.org/graphiql/?query=query%20ShowExcerptIfPostHasComments(%0A%20%20%24id%3A%20ID!%2C%0A%20%20%24_hasComments%3A%20Boolean%20%3D%20false%0A)%20%7B%0A%20%20post(id%3A%20%24id)%20%7B%0A%20%20%20%20hasComments%20%40export(as%3A%20%22_hasComments%22)%0A%20%20%7D%0A%20%20self%20%7B%0A%20%20%20%20post(id%3A%20%24id)%20%7B%0A%20%20%20%20%20%20title%0A%20%20%20%20%20%20excerpt%20%40include(if%3A%20%24_hasComments)%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D&operationName=ShowExcerptIfPostHasComments&variables=%7B%0A%20%20%22id%22%3A%201499%0A%7D) produces this response:

![The response includes field `excerpt`](/images/dynamic-include-second-query.png)

As it can be seen, `@include` became dynamic: the same query produces different results based on some property from the queried object itself, and not from an external variable.

This features works only when the exported variable (in this case, `$_hasComments`) concerns a single value, but not for lists. This is because the algorithm evaluates the `if` condition for all objects in the list in the same iteration, overriding each other; then, when this result is checked to perform the `@skip`/`@include` validation in some later iteration from the algorithm, only the value from the last object in the list will be available.
