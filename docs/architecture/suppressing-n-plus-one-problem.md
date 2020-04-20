# Suppressing the N+1 Problem

Let's learn how GraphQL by PoP completely avoids the "N+1 problem" already by architectural design.

## What is the "N+1 problem"

The "N+1 problem" basically means that the amount of queries executed against the database can be as large as the amount of nodes in the graph.

What does it mean? Let's check it out with an example: let's say we want to retrieve a list of directors, and for each of them his/her films, through the following query:

```graphql
{
  query {
    directors(first: 10) {
      name
      films(first: 10) {
        title
      }
    }
  }
}
```

To be efficient, we would expect to execute only 2 queries to retrieve the data from the database: 1 to fetch the directors' data, and 1 to retrieve the data for all films by all directors.

However, in order to satisfy this query, GraphQL will need to execute "N+1" queries against the database: 1 first to retrieve the list of the N directors (10 in this case) and then, for each of the N directors, 1 query to retrieve his/her list of films. In our case, we must execute 1+10=11 queries.

This problem arises because GraphQL resolvers only handle 1 object at a time, and not all the objects of the same kind at the same time. In our case, the resolver handling objects of the `Query` type (which is the root type) will be called once the first time to get the list of all the `Director` objects and then, the resolver handling the `Director` type will be called once for each `Director` object, to retrieve his/her list of films.

In other words: GraphQL resolvers see the tree, not the forest.

This problem is actually worse than it initially appears, because the number of nodes in a graph grows exponentially on the number of levels of the graph. Then, the name "N+1" is valid only for a graph 2-levels deep. For a graph 3-levels deep, it should be called the "N<sup>2</sup>+N+1" problem! And so on...

For instance, following our example above, let's also add each film's list of actors/actresses to the query, like this:

```graphql
{
  query {
    directors(first: 10) {
      name
      films(first: 10) {
        title
        actors(first: 10) {
          name
        }
      }
    }
  }
}
```

Then, the queries executed against the database are: 1 first to retrieve the list of the 10 directors, then 1 query to retrieve each director's list of films for each of the 10 directors, and finally 1 query to retrieve each list of actors/actresses for each of the 10 films for each of the 10 directors. This gives a total of 1+10+100=111 queries.

After noticing this behaviour, the "N+1 problem" can easily be considered GraphQL's biggest performance hurdle: if left unchecked, querying graphs a few levels deep may become so slow, as to effectively render GraphQL pretty much useless.

## General solution to the "N+1 problem"

The standard solution to the "N+1 problem" was first provided by the utility [DataLoader](https://github.com/graphql/dataloader). Its strategy is very simple: defer resolving segments of the query until a later stage, in which all of the objects of the same kind can be resolved all together, in a single query. This strategy, called "batching", effectively solves the "N+1" problem.

In addition, DataLoader caches objects after retrieving them, so that if a subsequent query needs to load an already-loaded object, it can skip execution and retrieve the object from the cache instead. This strategy, which is called "caching", is mostly an optimization on top of "batching".

## Problems with the "batching/deferred" solution

Technically speaking, there is no problem whatsoever with the "batching" or "deferred" strategy: it just works.

(From now on, let's refer to the strategy as "deferred" only.)

The problem, though, is that this strategy is an afterthought: the developer may first implement the server and then, noticing how slow it is to resolve the queries, will decide to introduce the deferring mechanism. Hence, implementing the resolvers may involve some faux steps, adding friction to the development process. In addition, since the developer must understand how the "deferred" mechanism works, it makes its implementation more complex than it could otherwise be.

This problem doesn't lie in the strategy itself, but in having the GraphQL server offering this functionality as an add-on, even though, without it, querying may be so slow as to render GraphQL pretty much useless.

The solution to this problem is, then, straightforward: the "deferred" strategy should not be an add-on but baked-in the GraphQL server itself. Instead of having 2 query execution strategies, "normal" and "deferred", there should only be only 1, "deferred". And the GraphQL server must execute the "deferred" mechanism even though the developer implements the resolver the "normal" way (in other words, the GraphQL server takes care of the extra complexity, not the developer).

And that is exactly what GraphQL by PoP does.

## Making "deferred" the only strategy executed by the GraphQL server

The problem with most GraphQL servers is that the responsibility of resolving the object types (`object`, `union` and `interface`) as objects is done by the resolvers themselves when processing the parent node (eg: `films` => `directors`), instead of delegating this task to the dataloading engine.

GraphQL by PoP transfers this responsibility away from the resolver and into the server's data-loading engine, like this:

1. The resolvers return IDs, and not objects, when resolving a relationship between the parent and child nodes
2. Given a list of IDs of a certain type, a `DataLoader` entity obtains the corresponding objects from that type
3. The server's data-loading engine is the glue between these 2 parts: it first obtains the object IDs from the resolvers and, just before executing the nested query for the relationship (by which time it will have accumulated all the IDs to be resolved for the specific type), it retrieves the objects for those IDs through the `DataLoader` (which can efficiently include all the IDs into a single query).

This approach can be summarized as: "Deal with IDs, not with objects".

Let's use the same example from earlier on to visualize this new approach. The query below retrieves a list of directors and their films:

```graphql
{
  query {
    directors(first: 10) {
      name
      films(first: 10) {
        title
      }
    }
  }
}
```

Pay attention to the 2 fields to retrieve from each director, `name` and `films`, and how they are currently different:

Field `name` is of [scalar type](https://graphql.org/learn/schema/#scalar-types). It is immediately resolvable, since we can expect the object of type `Director` to contain a property of type `string` called `name`, containing the director's name. Hence, once we have the `Director` object, there is no need to execute an extra query to resolve this property.

Field `films`, though, is a [list](https://graphql.org/learn/schema/#lists-and-non-null) of [object type](https://graphql.org/learn/schema/#object-types-and-fields). It is normally not immediately resolvable, since it references a list of objects, of type `Film`, which must still be retrieved from the database through 1 or more extra queries. Hence, the developer would need to implement the "deferred" mechanism for it.

Now, let's consider the different behaviour, and have field `films` be resolved as a list of IDs (instead of a list of objects). Because we can expect the `Director` object to contain a property called `filmIDs` containing the IDs of all its films, of type `array of string` (assuming that the ID is represented as a string), then this field can also be resolved immediately, without having to implement the "deferred" mechanism.

Finally, in addition to the ID, the resolver must give an extra piece of information: the type of the expected object (in our example, it could be `[(Film, 2), (Film, 5), (Film, 9)]`). This information is internal though, passed over to the engine, and does not need be output in the response to the query.

<!-- ## Type safety compromised?

An implication of this new approach is that a field of object type will be resolved in 2 different ways: if it contains a nested query it will be represented as an object (or list of objects) and, if not, as an ID (or list of IDs).

For instance, check the difference in the response from the following queries:

_Field `author` [with nested query](https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20post(id%3A%201)%20%7B%0A%20%20%20%20title%0A%20%20%20%20author%20%7B%0A%20%20%20%20%20%20name%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D):_

```graphql
query {
  post(id: 1) {
    title
    author {
      name
    }
  }
}
```

![Field with nested query "Field with nested query"](/images/connection-nested-query.jpg)

_Field `author` without nested query (can't be executed in GraphiQL, only in the Playground):_

```graphql
query {
  post(id: 1) {
    title
    author
  }
}
```

![Field without nested query "Field without nested query"](/images/connection-alone.jpg)

As it can be seen, the response to field `author` is, in the first case, the object `{"name": "leo"}` and, in the second case, it is the string `"1"`.

This inconsistency may, in practical terms, never arise, since a field of object type is always expected to provide a nested query (or it would produce an empty object, which makes no sense). Indeed, GraphiQL does not allow to query for an object without its nested query: it always adds some predefined default fields.

However, if this behaviour must be removed (for instance, to have the returned type always be coherent with the schema), then we can add a very simple solution: instead of resolving the field as an ID, we resolve it as an array with the ID stored under property `"id"` (or whatever the name of that property on the corresponding type), and have the data-loading engine retrieve the ID from within the array. Then, querying for an object without its nested query will return `{id: ...}`, which will be compatible with the definition in the schema for that type. -->

## Implementing the adapted approach in code

Let's see how GraphQL by PoP implements this approach in PHP code. The code below demonstrates the different resolvers (for the purpose of clarity, all code below has been edited).

### `FieldResolvers`

`FieldResolvers` receive an object of a specific type, and resolve its fields. For relationships, it must also indicate the type of the object it resolves to. This is their contract:

```php
interface FieldResolverInterface
{
  public function resolveValue($object, string $field, array $args = []);
  public function resolveFieldTypeResolverClass(string $field, array $args = []): ?string;
}
```

Its implementation looks like this:

```php
class PostFieldResolver implements FieldResolverInterface
{
  public function resolveValue($object, string $field, array $args = [])
  {
    $post = $object;
    switch ($field) {
      case 'title':
        return $post->title;
      case 'author':
        return $post->authorID; // This is an ID, not an object!
    }

    return null;
  }

  public function resolveFieldTypeResolverClass(string $field, array $args = []): ?string
  {
    switch ($field) {
      case 'author':
        return UserTypeResolver::class;
    }

    return null;
  }
}
```

Please notice how, by removing the logic dealing with promises/deferred objects, the code resolving field `author` has become very simple and concise.

### `TypeResolvers`

`TypeResolvers` are objects which deal a specific type: they know the type's name and which `TypeDataLoader` loads objects of its type, among others.

The data-loading engine, when resolving fields, will be given IDs from a certain `TypeResolver` class. Then, when retrieving the objects for those IDs, the data-loading engine will ask the `TypeResolver` which `TypeDataLoader` object to use to load those objects.

Their contract is defined like this:

```php
interface TypeResolverInterface
{
  public function getTypeName(): string;
  public function getTypeDataLoaderClass(): string;
}
```

In our example, class `UserTypeResolver` defines that type `User` must have its data loaded through class `UserTypeDataLoader`:

```php
class UserTypeResolver implements TypeResolverInterface
{
  public function getTypeName(): string
  {
    return 'User';
  }

  public function getTypeDataLoaderClass(): string
  {
    return UserTypeDataLoader::class;
  }
}
```

### `TypeDataLoaders`

`TypeDataLoaders` receive a list of IDs of a specific type, and return the corresponding objects of that type. This is their contract:

```php
interface TypeDataLoaderInterface
{
  public function getObjects(array $ids): array;
}
```

Retrieving users is done like this:

```php
class UserTypeDataLoader implements TypeDataLoaderInterface
{
  public function getObjects(array $ids): array
  {
    $userAPI = UserAPIFacade::getInstance();
    return $userAPI->getUsers($ids);
  }
}
```

## Executing a (really) big query

Let's test that this strategy works, by executing a query of great complexity, involving a graph 10-levels deep (`posts` => `author` => `posts` => `tags` => `posts` => `comments` => `author` => `posts` => `comments` => `author`), which could not be resolved if the "N+1 problem" were taking place.

Running [this query](https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20posts(limit%3A10)%20%7B%0A%20%20%20%20excerpt%0A%20%20%20%20title%0A%20%20%20%20url%0A%20%20%20%20author%20%7B%0A%20%20%20%20%20%20name%0A%20%20%20%20%20%20url%0A%20%20%20%20%20%20posts(limit%3A10)%20%7B%0A%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20tags(limit%3A10)%20%7B%0A%20%20%20%20%20%20%20%20%20%20slug%0A%20%20%20%20%20%20%20%20%20%20url%0A%20%20%20%20%20%20%20%20%20%20posts(limit%3A10)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20%20%20comments(limit%3A10)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20content%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20date%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20author%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20name%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20posts(limit%3A10)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20url%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20comments(limit%3A10)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20content%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20date%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20author%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20name%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20username%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20url%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A):

```graphql
query {
  posts(limit:10) {
    excerpt
    title
    url
    author {
      name
      url
      posts(limit:10) {
        title
        tags(limit:10) {
          slug
          url
          posts(limit:10) {
            title
            comments(limit:10) {
              content
              date
              author {
                name
                posts(limit:10) {
                  title
                  url
                  comments(limit:10) {
                    content
                    date
                    author {
                      name
                      username
                      url
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

...and scrolling down on the results we will see how big the response is, how many entities it involves, and how many levels it retrieved, and yet it was executed promptly, without any difficulty.
