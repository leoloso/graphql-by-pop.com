# (*) Normalized Data

Just by removing the `"/graphql"` bit from the URL, the response is normalized, making its output size greatly reduced when a same field is fetched multiple times.

<!-- ```less
/api/?query=
  posts.
     author.
       posts.
         comments.
           author.
             id|
             name|
             posts.
               id|
               title|
               url
``` -->

Compare the output of the query in PoP native format:

<a href="https://newapi.getpop.org/api/?query={posts{author{posts{comments{author{id name posts{id title url}}}}}}}">View query results</a>

...with the same output in GraphQL format:

<a href="https://newapi.getpop.org/api/graphql/?query={posts{author{posts{comments{author{id name posts{id title url}}}}}}}">View query results</a>
