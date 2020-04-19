# Integrating with REST (WIP)

Get the best from both GraphQL and REST: query resources based on endpoint, with no under/overfetching.

```less
// Query data for a single resource
{single-post-url}/api/rest/?query=
  id|
  title|
  author.
    id|
    name

// Query data for a set of resources
{post-list-url}/api/rest/?query=
  id|
  title|
  author.
    id|
    name
```

<a href="https://newapi.getpop.org/2013/01/11/markup-html-tags-and-formatting/api/rest/?query=id%7Ctitle%7Cauthor.id%7Cname">View query results #1</a>

<a href="https://newapi.getpop.org/posts/api/rest/?query=id%7Ctitle%7Cauthor.id%7Cname">View query results #2</a>

## Generating the JSON-schema

TODO
