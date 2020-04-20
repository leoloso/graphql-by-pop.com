# Using Components instead of Graphs

GraphQL by PoP does not use graphs to represent the data model. Instead, it uses components.

This is not an unexpected approach. Under title [Thinking in Graphs](https://graphql.org/learn/thinking-in-graphs/), the GraphQL project states (emphasis added):

> Graphs are powerful tools for modeling many real-world phenomena because they resemble our natural mental models and verbal descriptions of the underlying process. With GraphQL, you **model your business domain as a graph** by defining a schema; within your schema, you define different types of nodes and how they connect/relate to one another. On the client, this creates a pattern similar to Object-Oriented Programming: types that reference other types. **On the server, since GraphQL only defines the interface, you have the freedom to use it with any backend (new or legacy!)**.

The takeaway from this definition is the following:

Even though the response has the shape of a graph, this doesn't mean that data is actually represented as a graph when dealing with it on the server-side. **The graph is only a _mental model_, not an actual implementation**.

This is good news, because dealing with graphs (or trees) is not trivial. Components, instead, are much simpler to implement and provide all the same benefits.

## Simplifying the data model through components

Using components to represent the data structure on the server-side is optimal concerning simplicity, because it allows to consolidate the different models for our data into a single structure. Instead of having a flow like this:

`build query to feed components (client)` => `process data as graph/tree (server)` => `feed data to components (client)`

...our flow will be like this:

`components (client)` => `components (server)` => `components (client)`

This is achievable because the GraphQL request can be thought-of as having a "component hierarchy" data structure, in which every object type represents a component, and every relationship field from an object type to another object type represents a component wrapping another component.

Let's use an example to visualize this relationship from component to GraphQL query. Let's say that we want to build the following "Featured director" widget:

![Featured director widget](/images/featured-director-widget.jpg)

Using Vue or React (or any other component-based library), we would first identify the components. In this case, we would have an outer component `<FeaturedDirector>` (in red), which wraps a component `<Film>` (in blue), which itself wraps a component `<Actor>` (in green):

![Identifying components in the widget](/images/featured-director-widget-components.jpg)

The pseudo-code will look like this:

```html
<!-- Component: <FeaturedDirector> -->
<div>
  Country: {country}
  {foreach films as film}
    <Film film={film} />
  {/foreach}
</div>

<!-- Component: <Film> -->
<div>
  Title: {title}
  Pic: {thumbnail}
  {foreach actors as actor}
    <Actor actor={actor} />
  {/foreach}
</div>

<!-- Component: <Actor> -->
<div>
  Name: {name}
  Photo: {avatar}
</div>
```

Then we identify what data is needed for each component. For `<FeaturedDirector>` we need the `name`, `avatar` and `country`. For `<Film>` we need `thumbnail` and `title`. And for `<Actor>` we need `name` and `avatar`:

![Identifying data properties for each component](/images/featured-director-widget-data.jpg)

And we build our GraphQL query to fetch the required data:

```graphql
query {
  featuredDirector {
    name
    country
    avatar
    films {
      title
      thumbnail
      actors {
        name
        avatar
      }
    }
  }
}
```

As it can be appreciated, there is a direct relationship between the component hierarchy above, and this GraphQL query.
