# Embeddable fields

(This feature is not part of the GraphQL spec. It is based on the requested "[composable fields](https://github.com/graphql/graphql-spec/issues/682)" feature.)

::: v-pre
Syntactic sugar for the PQL's [composable fields](../extended/pql-language-features.html#composable-fields): Resolve a field within an argument for another field from the same type, using syntax `{{fieldName}}`, and also including arguments, using `{{fieldName(fieldArgs)}}`.
:::

To make it convenient to use, field `echo(value: String): String` is also added on every type of the schema.

For instance, running <a href="https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20posts%20%7B%0A%20%20%20%20description%3A%20echo(value%3A%20%22%27%7B%7B%20title%20%7D%7D%27%20was%20posted%20on%20%7B%7B%20date(format%3A%20%5C%22d%2Fm%2FY%5C%22)%7D%7D%22)%0A%20%20%7D%0A%7D" target="_blank">this query</a>:

::: v-pre
```graphql
query {
  posts {
    description: echo(value: "'{{ title }}' was posted on {{ date(format: \"d/m/Y\") }}")
  }
}
```
:::

...produces response:

```json
{
  "data": {
    "posts": [
      {
        "description": "'Scheduled by Leo' was posted on 01/01/2020"
      },
      {
        "description": "'COPE with WordPress: Post demo containing plenty of blocks' was posted on 08/08/2019"
      },
      {
        "description": "'A lovely tango, not with leo' was posted on 02/08/2019"
      },
      {
        "description": "'Hello world!' was posted on 02/08/2019"
      },
      {
        "description": "'Markup: HTML Tags and Formatting' was posted on 11/01/2013"
      },
      {
        "description": "'Markup: Image Alignment' was posted on 10/01/2013"
      }
    ]
  }
}
```

::: details View PQL query
::: v-pre
```less
query=
  posts.
    echo('{{ title }}' was posted on {{ date(d/m/Y) }})@description
```

[<a href="https://newapi.getpop.org/api/graphql/?query=posts.echo(%27{{%20title%20}}%27%20was%20posted%20on%20{{%20date(d/m/Y)%20}})@description">View query results</a>]

:::

Please notice that the embedded field `title` needs not be resolved in advance in the query; the GraphQL server already takes care of that.

Embedded fields also work within directive arguments.

For instance, running <a href="https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20posts%20%7B%0A%20%20%20%20title%3A%20echo(value%3A%20%22(%7B%7B%20commentCount%20%7D%7D)%20%7B%7B%20title%20%7D%7D%20-%20posted%20on%20%7B%7B%20date(format%3A%20%5C%22d%2Fm%2FY%5C%22)%7D%7D%22)%20%40include(if%3A%20%22%7B%7B%20hasComments%20%7D%7D%22)%0A%20%20%20%20title%20%40skip(if%3A%20%22%7B%7B%20hasComments%20%7D%7D%22)%0A%20%20%7D%0A%7D%0A" target="_blank">this query</a>:

::: v-pre
```graphql
query {
  posts {
    title: echo(value: "({{ commentCount }}) {{ title }} - posted on {{ date(format: \"d/m/Y\")}}") @include(if: "{{ hasComments }}")
    title @skip(if: "{{ hasComments }}")
  }
}
```
:::

...produces response:

```json
{
  "data": {
    "posts": [
      {
        "title": "(1) Scheduled by Leo - posted on 01/01/2020"
      },
      {
        "title": "COPE with WordPress: Post demo containing plenty of blocks"
      },
      {
        "title": "A lovely tango, not with leo"
      },
      {
        "title": "(1) Hello world! - posted on 02/08/2019"
      },
      {
        "title": "(2) Markup: HTML Tags and Formatting - posted on 11/01/2013"
      },
      {
        "title": "Markup: Image Alignment"
      }
    ]
  }
}
```

::: details View PQL query
::: v-pre
```less
query=
  posts.
    echo(({{ commentCount }}) {{ title }} - posted on {{ date(d/m/Y) }})@title<include({{ hasComments }})>|
    title<skip({{ hasComments }})>
```

[<a href="https://newapi.getpop.org/api/graphql/?query=posts.echo((%7B%7B%20commentCount%20%7D%7D)%20%7B%7B{%20title%20%7D%7D%20-%20posted%20on%20%7B%7B%20date(d/m/Y)%20%7D%7D)@title%3Cinclude(%7B%7B%20hasComments%20%7D%7D)%3E|title%3Cskip(%7B%7B%20hasComments%20%7D%7D)%3E">View query results</a>]

:::

### Examples

We can send a a newsletter defining the `to`, `subject` and `content` data through fields `newsletterTo`, `newsletterSubject` and `newsletterContent` from the `Root` type:

::: v-pre
```graphql
mutation {
  sendEmail(
    to: "{{ newsletterTo }}",
    subject: "{{ newsletterSubject }}",
    content: "{{ newsletterContent }}"
  )
}
```
:::

Using nested mutations, we can send an email to several users, personalizing the `subject` for each, producing `"Hey Joe!"` and `"Hey Rachel!"`:

::: v-pre
```graphql
mutation {
  users {
    sendEmail(
      subject: "Hey {{ name }}!",
      content: "What's up? Access to the service will expire soon!"
    )
  }
}
```
:::

::: v-pre
Adding arguments on the embedded field, we can add the service expiration date for each user in the `content` as `{{ serviceExpirationDate(format:\"d/m/Y\") }}` (the string quotes must be escaped: `\"`):
:::

::: v-pre
```graphql
mutation {
  users {
    sendEmail(
      subject: "Hey {{ name }}!",
      content: "What's up? You only have until {{ serviceExpirationDate(format:\"d/m/Y\") }} to renew the service."
    )
  }
}
```
:::

Using directive arguments, we can send a single email to many users, adding them all in the to field:

::: v-pre
```graphql
mutation {
  users {
    id @sendEmail(to: "{{ email }}", subject: "Congratulations team!", content: "You have won the competition!")
  }
}
```
:::

## Configuration

### Environment variables

| Environment variable | Description | Default |
| --- | --- | --- |
| `ENABLE_EMBEDDABLE_FIELDS` | Enable using embeddable fields | `false` |
