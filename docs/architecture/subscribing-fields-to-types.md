# Subscribing fields to types

The GraphQL API uses the [Publish-subscribe pattern](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) to have fields be "subscribed" to types, in which a `FieldResolver` entity has fields add to some `TypeResolver` entity.

In this example, class `UserFieldResolver` adds fields `username`, `email` and `url` to class `UserTypeResolver`, which resolves type `User`:

```php
class UserFieldResolver extends AbstractDBDataFieldResolver
{
  public static function getClassesToAttachTo(): array
  {
    return [UserTypeResolver::class];
  }

  public static function getFieldNamesToResolve(): array
  {
    return [
      'username',
      'email',
      'url',
    ];
  }
```

The `User` type does not know in advance which fields it will satisfy, but these (`username`, `email` and `url`) are instead injected to the type by the field resolver.

This way, the GraphQL schema becomes easily extensible: by simply adding a field resolver, any extensions can add new fields to an existing type (such as field `User.shippingAddress`), or override how a field is resolved (such as redefining `User.url` to return the user's website instead).