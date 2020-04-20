# (*) Granular Feedback

Issues are handled differently depending on their severity:

- Informative, such as Deprecated fields and directives: to indicate they must be replaced with a substitute
- Non-blocking issues, such as Schema/Database warnings: when an issue happens on a non-mandatory field
- Blocking issues, such as Query/Schema/Database errors: when they use a wrong syntax, declare non-existing fields or directives, or produce an issues on mandatory arguments

```less
//1. Deprecated fields
/?query=
  posts.
    title|
    isPublished

//2. Schema warning
/?query=
  posts(limit:3.5).
    title

//3. Database warning
/?query=
  users.
    posts(limit:name()).
      title

//4. Query error
/?query=
  posts.
    id[book](key:value)

//5. Schema error
/?query=
  posts.
    nonExistantField|
    isStatus(
      status:non-existant-value
    )
```

<a href="https://newapi.getpop.org/api/graphql/?query=posts.title%7Cpublished">View query results #1</a>

<a href="https://newapi.getpop.org/api/graphql/?query=posts(limit:3.5).title">View query results #2</a>

<a href="https://newapi.getpop.org/api/graphql/?query=users.posts(limit:name()).title">View query results #3</a>

<a href="https://newapi.getpop.org/api/graphql/?query=posts.id%5Bbook%5D(key:value)">View query results #4</a>

<a href="https://newapi.getpop.org/api/graphql/?query=posts.nonExistantField%7CisStatus(status:non-existant-value)">View query results #5</a>

## Issues bubble upwards

If a field or directive fails and it is input to another field, this one may also fail.

```less
/?query=
  post(divide(a,4)).
    title
```

<a href="https://newapi.getpop.org/api/graphql/?query=post(divide(a,4)).title">View query results</a>

## Path to the issue

Issues contain the path to the composed field or directive were it was produced.

```less
/?query=
  echo([hola,chau])<
    forEach<
      translate(notexisting:prop)
    >
  >
```

<a href="https://newapi.getpop.org/api/graphql/?query=echo(%5Bhola,chau%5D)%3CforEach%3Ctranslate(notexisting:prop)%3E%3E">View query results</a>

## Log information

Any informative piece of information can be logged (enabled/disabled through configuration).

```less
/?
actions[]=show-logs&
postId=1&
query=
  post($postId).
    title|
    date(d/m/Y)
```

<a href="https://newapi.getpop.org/api/graphql/?actions%5B%5D=show-logs&amp;postId=1&amp;query=post(%24postId).title%7Cdate(d/m/Y)">View query results</a>
