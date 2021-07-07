# PQL Language Features

PQL adds several language features over GQL. This is a summary of them.

## Operators

Standard operations, such as `not`, `or`, `and`, `if`, `equals`, `isNull`, `sprintf` and many others, are supported as fields:

```less
1. ?query=not(true)
2. ?query=or([1,0])
3. ?query=and([1,0])
4. ?query=if(true, Show this text, Hide this text)
5. ?query=equals(first text, second text)
6. ?query=isNull(),isNull(something)
7. ?query=sprintf(%s API is %s, [PoP, cool])
```

[View query results: <a href="https://nextapi.getpop.org/api/graphql?query=not(true)">query #1</a>, <a href="https://nextapi.getpop.org/api/graphql?query=or([1,0])">query #2</a>, <a href="https://nextapi.getpop.org/api/graphql?query=and([1,0])">query #3</a>, <a href="https://nextapi.getpop.org/api/graphql?query=if(true,Show this text,Hide this text)">query #4</a>, <a href="https://nextapi.getpop.org/api/graphql?query=equals(first text, second text)">query #5</a>, <a href="https://nextapi.getpop.org/api/graphql?query=isNull(),isNull(something)">query #6</a>, <a href="https://nextapi.getpop.org/api/graphql?query=sprintf(%s API is %s, [PoP, cool])">query #7</a>]

## Composable fields

Arguments passed to a field can receive other fields or operators as input.

```less
?query=
  posts.
    if (
      hasComments(),
      sprintf(
        "Post with ID %s has %s comment(s) and title '%s'",
        [
          id(),
          commentCount(),
          title()
        ]
      ),
      sprintf(
        "Post with ID %s, created on %s, has no comments",
        [
          id(),
          date(d/m/Y)
        ]
      )
    )@postDesc
```

[<a href="https://nextapi.getpop.org/api/graphql/?query=posts.if(hasComments(),sprintf(Post with ID %s has %s comment(s) and title '%s',[id(),commentCount(),title()]),sprintf(%22Post with ID %s, created on %s, has no comments%22,[id(),date(d/m/Y)]))@postDesc">View query results</a>]

## Composable fields in directive arguments

Through composable fields, the directive can be evaluated against the object, granting it a dynamic behavior.

The example below implements the standard GraphQL `skip` directive, however it is able to decide if to skip the field or not based on a condition from the object itself:

```less
/?query=
  posts.
    title|
    featuredimage<
      skip(if:isNull(featuredimage()))
    >.
      src
```

[<a href="https://newapi.getpop.org/api/graphql/?query=posts.title%7Cfeaturedimage<skip(if:isNull(featuredimage()))>.src" target="_blank">View query results</a>]

## Composable directives

A directive can modify the behaviour of another directive. Values can be passed from one to another through "expressions": special variables set by each directive, wrapped with `%...%`.

For instance, in the example below, directive `<forEach>` iterates through all the items in an array, passing each of them to its composed directive `<applyFunction>` through expression `%value%`.

```less
?query=
  echo([
    [banana, apple],
    [strawberry, grape, melon]
  ])@fruitJoin<
    forEach<
      applyFunction(
        function: arrayJoin,
        addArguments: [
          array: %value%,
          separator: "---"
        ]
      )
    >
  >
```

[<a href="https://newapi.getpop.org/api/graphql/?query=echo([[banana,apple],[strawberry,grape,melon]])@fruitJoin%3CforEach%3CapplyFunction(function:arrayJoin,addArguments: [array:%value%,separator:%22---%22])%3E%3E">View query results</a>]

## Directive expressions

An expression, defined through symbols `%...%`, is a variable used by directives to pass values to each other. An expression can be pre-defined by the directive or created on-the-fly in the query itself.

In the example below, an array contains strings to translate and the language to translate the string to. The array element is passed from directive `<forEach>` to directive `<advancePointerInArray>` through pre-defined expression `%value%`, and the language code is passed from directive `<advancePointerInArray>` to directive `<translate>` through variable `%toLang%`, which is defined only in the query:

```less
/?query=
  echo([
    [
      text: Hello my friends,
      translateTo: fr
    ],
    [
      text: How do you like this software so far?,
      translateTo: es
    ]
  ])@translated<
    forEach<
      advancePointerInArray(
        path: text,
        appendExpressions: [
          toLang:extract(%value%,translateTo)
        ]
      )<
        translateMultiple(
          from: en,
          to: %toLang%,
          oneLanguagePerField: true,
          override: true
        )
      >
    >
  >
```

[<a href="https://newapi.getpop.org/api/graphql/?query=echo([[text:Hello my friends,translateTo:fr],[text:How do you like this software so far?,translateTo:es]])@translated<forEach<advancePointerInArray(path:text,appendExpressions:[toLang:extract(%value%,translateTo)])<translateMultiple(from:en,to:%toLang%,oneLanguagePerField:true,override:true)>>>" target="_blank">View query results</a>]

## Skip output if null

Exactly the same result above (`<skip(if(isNull(...)))>`) can be accomplished using the `?` operator: Adding it after a field, it skips the output of its value if it is null.

```less
/?query=
  posts.
    title|
    featuredimage?.
      src
```

[<a href="https://newapi.getpop.org/api/graphql/?query=posts.title%7Cfeaturedimage?.src" target="_blank">View query results</a>]

## Skip argument names

Field and directive argument names can be deduced from the schema.

This query...

```less
/?
postId=1&
query=
  post($postId).
    date(d/m/Y)|
    title<
      skip(false)
    >
```

...is equivalent to this query:

```less
/?
postId=1&
query=
  post(id: $postId).
    date(format: d/m/Y)|
    title<
      skip(if: false)
    >
```

[View query results: <a href="https://newapi.getpop.org/api/graphql/?postId=1&amp;query=post(%24postId).date(d/m/Y)%7Ctitle%3Cskip(false)%3E" target="_blank">query #1</a>, <a href="https://newapi.getpop.org/api/graphql/?postId=1&amp;query=post(id:%24postId).date(format:d/m/Y)%7Ctitle<skip(if:false)>" target="_blank">query #2</a>]
