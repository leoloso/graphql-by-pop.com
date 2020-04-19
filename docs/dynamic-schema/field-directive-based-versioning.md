# Field/Directive-based Versioning (WIP)

Fields and directives can be independently versioned, and the version to use can be specified in the query through the field/directive argument `versionConstraint`. 

To select the version for the field/directive, we use the same [semver version constraints employed by Composer](https://getcomposer.org/doc/articles/versions.md#writing-version-constraints):

```less
// Selecting version for fields
/?query=
  userServiceURLs(versionConstraint:^0.1)|
  userServiceURLs(versionConstraint:">0.1")|
  userServiceURLs(versionConstraint:^0.2)

// Selecting version for directives
/?query=
  post($postId).
    title@titleCase<makeTitle(versionConstraint:^0.1)>|
    title@upperCase<makeTitle(versionConstraint:^0.2)>
&postId=1
```

<a href="https://newapi.getpop.org/api/graphql/?query=userServiceURLs(versionConstraint:^0.1)|userServiceURLs(versionConstraint:%22%3E0.1%22)|userServiceURLs(versionConstraint:^0.2)">View query results #1</a>

<a href="https://newapi.getpop.org/api/graphql/?query=post($postId).title@titleCase%3CmakeTitle(versionConstraint:^0.1)%3E|title@upperCase%3CmakeTitle(versionConstraint:^0.2)%3E&postId=1">View query results #2</a>

## Demonstration for GraphQL

In [this query](https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20olderVersion%3AuserServiceURLs(versionConstraint%3A%220.1.0%22)%0A%20%20newerVersion%3AuserServiceURLs(versionConstraint%3A%220.2.0%22)%0A%7D), field `userServiceURLs` has 2 versions, `0.1.0` and `0.2.0`:

![Querying a field using by version](https://raw.githubusercontent.com/getpop/api-graphql/master/assets/images/versioning-field-directives-1.jpg)

Let's use constraints with `^` and `>` to select the version. In [this query](https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20%23This%20will%20produce%20version%200.1.0%0A%20%20firstVersion%3AuserServiceURLs(versionConstraint%3A%22%5E0.1%22)%0A%20%20%23%20This%20will%20produce%20version%200.2.0%0A%20%20secondVersion%3AuserServiceURLs(versionConstraint%3A%22%3E0.1%22)%0A%20%20%23%20This%20will%20produce%20version%200.2.0%0A%20%20thirdVersion%3AuserServiceURLs(versionConstraint%3A%22%5E0.2%22)%0A%7D), constraint `"^0.1"` is resolved to version `"0.1.0"`, but constraint `">0.1"` is resolved to version `"0.2.0"`:

![Querying a field using version constraints](https://raw.githubusercontent.com/getpop/api-graphql/master/assets/images/versioning-field-directives-2.jpg)

[This query](https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20post(id%3A1)%20%7B%0A%20%20%20%20titleCase%3Atitle%40makeTitle(versionConstraint%3A%22%5E0.1%22)%0A%20%20%20%20upperCase%3Atitle%40makeTitle(versionConstraint%3A%22%5E0.2%22)%0A%20%20%7D%0A%7D) demonstrates it for directives:

![Querying a directive using version constraints](https://raw.githubusercontent.com/getpop/api-graphql/master/assets/images/versioning-field-directives-3.jpg)

Adding the `versionConstraint` parameter in the <a href='https://newapi.getpop.org/graphiql/?versionConstraint=^0.1&query=query {%0A%20 userServiceURLs%0A}'>GraphQL endpoint itself</a> will implicitly define that version constraint in all fields, and any field can still override this default value with its own `versionConstraint`, as in <a href='https://newapi.getpop.org/graphiql/?versionConstraint=^0.1&query=query {%0A%20 %23This will produce version 0.1.0%0A%20 implicitVersion%3A userServiceURLs%0A%20 %23This will produce version 0.2.0%0A%20 explicitVersion%3A userServiceURLs(versionConstraint%3A"^0.2")%0A}'>this query</a>:

![Overriding a default version constraint](https://raw.githubusercontent.com/getpop/api-graphql/master/assets/images/versioning-field-directives-4.jpg)
