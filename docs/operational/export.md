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

...and then, having executed the first query, we can pass the retrieved user's `name` as variable `$_search` to perform the search in a second query:

```graphql
query GetPostsContainingString($_search: String = "") {
  posts(search: $_search) {
    id
    title
  }
}
```

The `@export` directive relies on the [multiple-query execution](multiple-query-execution) feature, to export the value from a field, and inject this value into a second field through a dynamic variable (whose name is defined under argument `as`), thus combining the 2 queries into 1:

```graphql
query GetLoggedInUserName {
  me {
    name @export(as: "_search")
  }
}

query GetPostsContainingString($_search: String = "") {
  posts(search: $_search) {
    id
    title
  }
}
```

## Combinations of data to export

As seen in the query above, `@export` must handle exporting a single value from a single field: the user's `name`. 

Fields returning lists should also be exportable. For instance, in the query below, the exported value is the list of names from the logged-in user's friends (hence the type of the `$search` variable went from `String` to `[String]`):

```graphql
query GetLoggedInUserFriendNames {
  me {
    friends {
      name @export(as: "_search")
    }
  }
}

query GetPostsContainingLoggedInUserFriendNames($_search: [String] = []) {
  posts(searchAny: $_search) {
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
query GetLoggedInUserNameAndSurname {
  me {
    name @export(as: "_search")
    surname @export(as: "_search")
  }
}

query GetPostsContainingLoggedInUserNameAndSurname($_search: Map = {}) {
  posts(searchByAnyProperty: $_search) {
    id
    title
  }
}
```

And then, similar to upgrading from a single value to a list of values, we can upgrade from a single dictionary to a list of dictionaries.

For instance, we could export fields `name` and `surname` from the list of the logged-in user's friends (for which, the input type changed to `[Map]`):

```graphql
query GetLoggedInUserFriendNamesAndSurnames {
  me {
    friends {
      name @export(as: "_search")
      surname @export(as: "_search")
    }
  }
}

query GetPostsContainingLoggedInUserFriendNamesAndSurnames($_search: [Map] = []) {
  posts(searchAnyByAnyProperty: $_search) {
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

## Gotchas

In order for `@export` to work, the query must be coded with the following 2 peculiarities:

1. The name of the dynamic variable must start with `"_"`
2. The dynamic variable must be declared as a static (i.e. "normal") variable in the operation name, and always receive a default value

::: details Implementation source

Directive `@export` is implemented [here](https://github.com/GraphQLByPoP/graphql-server/blob/109d194c11dd2510d0ea5ce42b88fb556397400c/src/DirectiveResolvers/ExportDirectiveResolver.php).

:::

### 1. The name of the dynamic variable must start with `"_"`

For the solution, it was decided that `@export` will export the value into a normal variable, accessible as `$variable`. As a consequence, the query needs to declare the exported variables in the operation name.

Static variables and dynamic variables behave differently: while the value for a static variable can be determined when parsing the query, the value for a dynamic variable must be determined on runtime, right when reading the value of the variable. Then, the GraphQL by PoP engine must be able to tell which way to treat a variable, if the static or the dynamic way.

In order to avoid introducing new, unsupported syntax into the query (such as having `$staticVariables` and `%dynamicVariables%`), the solution is to have the dynamic variable name start with `"_"`, such as `$_dynamicVariable`. Then, if the name of the variable starts with `"_"`, the engine treats it as dynamic and doesn't resolve it when parsing the query; otherwise, it is treated as a static variable.

### 2. The dynamic variable must be declared as a static variable in the operation name, and always receive a default value

The GraphQL parser still treats a dynamic variable as a variable, hence it validates that it has been defined, and that it has a value on parsing time, or it throws an error `"The variable has not been set"`.

To avoid this error (which halts execution of the query), we must always define the variable in the operation name, and provide a default value for that argument, even if this value won't be used.

## Demonstration

::: tip

GraphiQL currently [does not allow](https://github.com/graphql/graphiql/issues/1635) to execute multiple queries as a single operation. 

To overcome this problem, if the operation name is `__ALL`, then the GraphQL server will execute all the submitted queries.

Then, attach the following query to the GraphiQL editor:

```query __ALL { id }```

And select this one when clicking on the "Run" button.

:::

### Executing the first case

The query below extracts the user's `name` into variable `$_authorName`, and then performs a search of all posts containing this string

```graphql
query GetUserName {
  user(by: { id: 1 }) {
    name @export(as: "_authorName")
  }
}

query GetPostsWithUserName($_authorName: String = "") {
  posts(searchfor: $_authorName) {
    id
    title
  }
}
```

When <a href="https://newapi.getpop.org/graphiql/?query=%23Hack%20to%20allow%20GraphiQL%20to%20send%20multiple%20queries%20to%20the%20server%0Aquery%20__ALL%20%7B%20id%20%7D%0A%0Aquery%20GetUserName%20%7B%0A%20%20user(by:{id%3A%201})%20%7B%0A%20%20%20%20name%20%40export(as%3A%20%22_authorName%22)%0A%20%20%7D%0A%7D%0A%0Aquery%20GetPostsWithUserName(%24_authorName%3A%20String%20%3D%20%22%22)%20%7B%0A%20%20posts(searchfor%3A%20%24_authorName)%20%7B%0A%20%20%20%20id%0A%20%20%20%20title%0A%20%20%7D%0A%7D&operationName=__ALL">running the query</a>, it produces this response:

![Running the first query with `@export`](/images/first-query.png)

It works: obtaining the user's name `"leo"`, and searching for all posts containing the keyword `"leo"`, was performed within the same query.

### Executing all 4 cases

This query:

```graphql
query GetSomeData {
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
}

query PrintSomeData(
  $_firstPostTitle: String = "",
  $_postTitles: [String] = [],
  $_firstPostData: Mixed = {},
  $_postData: [Mixed] = []
) {
  _firstPostTitle: echoVar(variable: $_firstPostTitle)
  _postTitles: echoVar(variable: $_postTitles)
  _firstPostData: echoVar(variable: $_firstPostData)
  _postData: echoVar(variable: $_postData)
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

The query uses field `echoVar` to visualize the content of the dynamic variables. When <a href="https://newapi.getpop.org/graphiql/?query=%23Hack%20to%20allow%20GraphiQL%20to%20send%20multiple%20queries%20to%20the%20server%0Aquery%20__ALL%20%7B%20id%20%7D%0A%0Aquery%20GetSomeData%20%7B%0A%20%20post(id%3A%201)%20%7B%0A%20%20%20%20title%20%40export(as%3A%22_firstPostTitle%22)%0A%20%20%20%20title%20%40export(as%3A%22_firstPostData%22)%0A%20%20%20%20date%20%40export(as%3A%22_firstPostData%22)%0A%20%20%7D%0A%20%20posts(limit%3A%202)%20%7B%0A%20%20%20%20title%20%40export(as%3A%22_postTitles%22)%0A%20%20%20%20title%20%40export(as%3A%22_postData%22)%0A%20%20%20%20date%20%40export(as%3A%22_postData%22)%0A%20%20%7D%0A%7D%0A%0Aquery%20PrintSomeData(%0A%20%20%24_firstPostTitle%3A%20String%20%3D%20%22%22%2C%0A%20%20%24_postTitles%3A%20%5BString%5D%20%3D%20%5B%5D%2C%0A%20%20%24_firstPostData%3A%20Mixed%20%3D%20%7B%7D%2C%0A%20%20%24_postData%3A%20%5BMixed%5D%20%3D%20%5B%5D%0A)%20%7B%0A%20%20_firstPostTitle%3A%20echoVar(variable%3A%20%24_firstPostTitle)%0A%20%20_postTitles%3A%20echoVar(variable%3A%20%24_postTitles)%0A%20%20_firstPostData%3A%20echoVar(variable%3A%20%24_firstPostData)%0A%20%20_postData%3A%20echoVar(variable%3A%20%24_postData)%0A%7D&operationName=__ALL">running the query</a>, it produces this response:

![Running the second query with `@export`](/images/second-query.png)

Once again, it works, as the response contains the results handling all 4 cases:

Case 1 - `@export` a single value:

```json
{
  "data": {
    "_firstPostTitle": "Hello world!"
  }
}
```

Case 2 - `@export` a list of values:

```json
{
  "data": {
    "_postTitles": [
      "Scheduled by Leo",
      "COPE with WordPress: Post demo containing plenty of blocks"
    ]
  }
}
```

Case 3 - `@export` a dictionary of field/value, containing 2 properties (`title` and `date`) from the same object:

```json
{
  "data": {
    "_firstPostData": {
      "title": "Hello world!",
      "date": "August 2, 2019"
    }
  }
}
```

Case 4 - `@export` a list of dictionaries of field/value:

```json
{
  "data": {
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
```