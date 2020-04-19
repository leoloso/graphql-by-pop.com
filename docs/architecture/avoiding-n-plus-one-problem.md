# Avoiding the N+1 Problem (WIP)

The “N+1 problem” is completely avoided already by architectural design. It doesn't matter how many levels deep the graph is, it will resolve fast.

Example of a deeply-nested query:

```less
/?query=
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
               url|
               tags.
                 id|
                 slug
```

<a href="https://newapi.getpop.org/api/graphql/?query=posts.author.posts.comments.author.id%7Cname%7Cposts.id%7Ctitle%7Curl%7Ctags.id%7Cslug">View query results</a>
