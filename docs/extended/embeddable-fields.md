# Embeddable fields

(This feature is not part of the GraphQL spec. It is based on the requested "[composable fields](https://github.com/graphql/graphql-spec/issues/682)" feature.)

Resolve a field within an argument for another field from the same type, using syntax `{{ fieldName }}`.

For instance, we can send a a newsletter defining the `to`, `subject` and `content` data through fields `newsletterTo`, `newsletterSubject` and `newsletterContent` from the `Root` type:

```graphql
mutation {
  sendEmail(
    to: "{{ newsletterTo }}",
    subject: "{{ newsletterSubject }}",
    content: "{{ newsletterContent }}"
  )
}
```

Using nested mutations, we can send an email to several users, personalizing the content for each.

For instance, add the user's name in the `subject` as `{ { name } }`, producing `"Hey Joe!"` and `"Hey Rachel!"` (It is `{{` and `}}` instead of `{ {` and `} }`, but somehow this webpage doesn't compile):

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

The embedded field can also accept arguments: `{ { fieldName(fieldArgs) } }`.

For instance, add the service expiration date for each user in the `content` as `{ { serviceExpirationDate(format:\"d/m/Y\") } }` (the string quotes must be escaped: `\"`):

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

It can also work within directive arguments.

For instance, send a single email to many users, adding them all in the to field:

```graphql
mutation {
  users {
    id @sendEmail(to: "{{ email }}", subject: "Congratulations team!", content: "You have won the competition!")
  }
}
```

Please notice that the embedded fields (such as `name` and `serviceExpirationDate`) need not be resolved in advance in the query; the GraphQL server already takes care of that.

## Configuration

### Environment variables

| Environment variable | Description | Default |
| --- | --- | --- |
| `ENABLE_EMBEDDABLE_FIELDS` | Enable using embeddable fields | `false` |
