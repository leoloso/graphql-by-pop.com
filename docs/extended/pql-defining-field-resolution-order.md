# Defining the Field Resolution Order in PQL

The PQL accepts the [`;` token to separate operations in the query](pql-syntax.html#appending-fields), and it will be replaced with a series of `self` fields (as described in [Manipulating the Field Resolution Order](../architecture/manipulating-field-resolution-order.html)) when [transforming from requested to executable query](../architecture/decoupling-queries.html). This guarantees that the operations will be executed in the given order in the query.

For instance, [this query](https://nextapi.getpop.org/api/graphql/?query=posts.author.id|name|url;posts.comments.id|content):

```php
/?query=
  posts.
    author.
      id|
      name|
      url;
  posts.
    comments.
      id|
      content
```

... is resolved as this one:

```php
/?query=
  posts.
    author.
      id|
      name|
      url,
  self.
    self.
      posts.
        comments.
        id|
        content
```