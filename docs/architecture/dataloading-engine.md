# Dataloading Engine

GraphQL by PoP [uses server-side components](./using-components-instead-of-graphs) to represent the data model (not graphs or trees). Let's see how it executes the data-loading process to resolve the GraphQL query.

In order to process the data, we must flatten the components into types (`<FeaturedDirector>` => `Director`, `<Film>` => `Film`, `<Actor>` => `Actor`), order them as they appeared in the component hierarchy (`Director`, then `Film`, then `Actor`) and deal with them in "iterations", retrieving the object data for each type on its own iteration, like this:

![Dealing with types in iterations](/images/featured-director-type-iterations.png)

The server's data-loading engine must implement the following (pseudo-)algorithm to load the data:

_Preparation:_

1. Prepare an empty [queue](https://en.wikipedia.org/wiki/Queue_(abstract_data_type)) to store the list of IDs from the objects that must be fetched from the database, organized by type (each entry will be: `[type => list of IDs]`)
2. Retrieve the ID of the featured director object, and place it on the queue under type `Director`

_Loop until there are no more entries on the queue:_

1. Get the first entry from the queue: the type and list of IDs (eg: `Director` and `[2]`), and remove this entry off the queue
2. Using the type's `TypeDataLoader` object, execute a single query against the database to retrieve all objects for that type with those IDs
3. If the type has relational fields (eg: type `Director` has relational field `films` of type `Film`), then collect all the IDs from these fields from all the objects retrieved in the current iteration (eg: all IDs in field `films` from all objects of type `Director`), and place these IDs on the queue under the corresponding type (eg: IDs `[3, 8]` under type `Film`).

By the end of the iterations, we will have loaded all the object data for all types, like this:

![Dealing with types in iterations](/images/featured-director-loading-data-in-iterations.png)

Please notice how all IDs for a type are collected, until the type is processed in the queue. If, for instance, we add a relational field `preferredActors` to type `Director`, these IDs would be added to the queue under type `Actor`, and it would be processed together with the IDs from field `actors` from type `Film`:

![Dealing with types in iterations](/images/featured-director-loading-data-extension.png)

However, if a type has been processed and then we need to load more data from that type, then it's a new iteration on that type. For instance, adding a relational field `preferredDirector` to the `Author` type, will make the type `Director` be added to the queue once again:

![Iterating over a repeated type](/images/featured-director-loading-data-repeated.png)

Pay attention also that here we can use the "caching" mechanism as implemented in [dataloader](https://github.com/graphql/dataloader): on the second iteration for type `Director`, the object with ID 2 is not retrieved again, since it was already retrieved on the first iteration so it can be taken from the cache.

Now that we have fetched all the object data, we need to shape it into the expected response, mirroring the GraphQL query. However, as it can be seen, the data does not have the required tree structure. Instead, relational fields contain the IDs to the nested object, emulating how data is represented in a relational database. Hence, following this comparison, the data retrieved for each type can be represented as a table, like this:

_Table for type `Director`:_

<table class="table">
<tr><th>ID</th><th>name</th><th>country</th><th>avatar</th><th>films</th></tr>
<tr><td>2</td><td>George Lucas</td><td>USA</td><td>george-lucas.jpg</td><td>[3, 8]</td></tr>
</table>

_Table for type `Film`:_

<table class="table">
<tr><th>ID</th><th>title</th><th>thumbnail</th><th>actors</th></tr>
<tr><td>3</td><td>The Phantom Menace</td><td>episode-1.jpg</td><td>[4, 6]</td></tr>
<tr><td>8</td><td>Attack of the Clones</td><td>episode-2.jpg</td><td>[6, 7]</td></tr>
</table>

_Table for type `Actor`:_

<table class="table">
<tr><th>ID</th><th>name</th><th>avatar</th></tr>
<tr><td>4</td><td>Ewan McGregor</td><td>mcgregor.jpg</td></tr>
<tr><td>6</td><td>Nathalie Portman</td><td>portman.jpg</td></tr>
<tr><td>7</td><td>Hayden Christensen</td><td>christensen.jpg</td></tr>
</table>

Having all the data organized as tables, and knowing how every type relates to each other (i.e. `Director` references `Film` through field `films`, `Film` references `Actor` through field `actors`), the GraphQL server can easily convert the data into the expected tree shape:

![Tree-shaped response](/images/featured-director-graph.png)

Finally, the GraphQL server outputs the tree, which has the shape of the expected response:

```json
{
  data: {
    featuredDirector: {
      name: "George Lucas",
      country: "USA",
      avatar: "george-lucas.jpg",
      films: [
        {
          title: "Star Wars: Episode I",
          thumbnail: "episode-1.jpg",
          actors: [
            {
              name: "Ewan McGregor",
              avatar: "mcgregor.jpg",
            },
            {
              name: "Natalie Portman",
              avatar: "portman.jpg",
            }
          ]
        },
        {
          title: "Star Wars: Episode II",
          thumbnail: "episode-2.jpg",
          actors: [
            {
              name: "Natalie Portman",
              avatar: "portman.jpg",
            },
            {
              name: "Hayden Christensen",
              avatar: "christensen.jpg",
            }
          ]
        }
      ]
    }
  }
}
```

## Analyzing the time complexity of the solution

Let's analyze the [big O notation](https://en.wikipedia.org/wiki/Big_O_notation) of the data-loading algorithm to understand how the number of queries executed against the database grows as the number of inputs grows, to make sure that this solution is performant.

The data-loading engine loads data in iterations corresponding to each type. By the time it starts an iteration, it will already have the list of all the IDs for all the objects to fetch, hence it can execute 1 single query to fetch all the data for the corresponding objects. It then follows that the number of queries to the database will grow linearly with the number of types involved in the query. In other words, the time complexity is `O(n)`, where `n` is the number of types in the query (however, if a type is iterated more than once, then it must be added more than once to `n`).

This solution is very performant, much better than the exponential complexity expected from dealing with graphs, or logarithmic complexity expected from dealing with trees.

## Implemented PHP code

The data-loading process takes place on function `getModuleData` from class `Engine` in package [Component Model](https://github.com/GatoGraphQL/GatoGraphQL/tree/master/layers/Engine/packages/component-model).
