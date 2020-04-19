# Mutations (WIP)

The query will be able to place mutations anywhere (not only on the root) and these will be integrated to the graph: The mutation result can, itself, be input to another field, be added to a nested subquery, and so on.

```less
/?query=
  addPost($title, $content).
    addComment($comment1)|
    addComment($comment2).
      author<sendConfirmationByEmail>.
        followers<notifyByEmail, notifyBySlack>
```
