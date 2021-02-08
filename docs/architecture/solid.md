# SOLID

GraphQL by PoP follows the [SOLID](https://en.wikipedia.org/wiki/SOLID) approach for the software architecture, providing different entities to tackle different responsibilities, as to make the code maintainable, extensible and understandable.

This is how the user entity is already provided by the plugin. The `User` type is provided through [this code](https://github.com/getpop/users/blob/c157600b00901ea74cc87187f55fc2e3242fe656/src/TypeResolvers/UserTypeResolver.php):

```php
class UserTypeResolver extends AbstractTypeResolver
{
  public function getTypeName(): string
  {
    return 'User';
  }

  public function getSchemaTypeDescription(): ?string
  {
    return $this->translationAPI->__('Representation of a user', "users");
  }

  public function getID(object $user)
  {
    return $this->usersAPI->getUserId($user);
  }

  public function getTypeDataLoaderClass(): string
  {
    return UserTypeDataLoader::class;
  }
}
```

The type resolver does not directly load the objects from the database, but instead delegates this task to a `TypeDataLoader` object (in the example above, from [class `UserTypeDataLoader`](https://github.com/getpop/users/blob/27221fdc23899fb4e9d8a076df87995e16fab8bf/src/TypeDataLoaders/UserTypeDataLoader.php)).

Adding fields `username`, `email` and `url` to type `User` is done via a `FieldResolver` object with [this code](https://github.com/getpop/users/blob/4ea244c419ad21bf9297d476180acf9435d9d104/src/FieldResolvers/UserFieldResolver.php):

```php
class UserFieldResolver extends AbstractDBDataFieldResolver
{
  public static function getClassesToAttachTo(): array
  {
    return [
      UserTypeResolver::class,
    ];
  }

  public static function getFieldNamesToResolve(): array
  {
    return [
      'username',
      'email',
      'url',
    ];
  }

  public function getSchemaFieldDescription(
    TypeResolverInterface $typeResolver,
    string $fieldName
  ): ?string {
    $descriptions = [
      'username' => $this->translationAPI->__("User's username handle", "users"),
      'email' => $this->translationAPI->__("User's email", "users"),
      'url' => $this->translationAPI->__("URL of the user's profile in the website", "users"),
    ];
    return $descriptions[$fieldName];
  }

  public function getSchemaFieldType(
    TypeResolverInterface $typeResolver,
    string $fieldName
  ): ?string {
    $types = [
      'username' => SchemaDefinition::TYPE_STRING,
      'email' => SchemaDefinition::TYPE_EMAIL,
      'url' => SchemaDefinition::TYPE_URL,
    ];
    return $types[$fieldName];
  }

  public function resolveValue(
    TypeResolverInterface $typeResolver,
    object $user,
    string $fieldName,
    array $fieldArgs = []
  ) {
    switch ($fieldName) {
      case 'username':
        return $this->usersAPI->getUserLogin($user);

      case 'email':
        return $this->usersAPI->getUserEmail($user);

      case 'url':
        return $this->usersAPI->getUserURL($user);
    }

    return null;
  }
}
```

As it can be observed, the definition of a field for the GraphQL schema, and its resolution, has been split into a multitude of functions: 

- `getSchemaFieldDescription`
- `getSchemaFieldType`
- `resolveValue`

Other functions include:

- [`getSchemaFieldArgs`](https://github.com/PoPSchema/comments/blob/d4dded01eaf9def89c53331b0b839e722495c779/src/FieldResolvers/CommentFieldResolver.php#L141): to declare the field arguments (including their name, description, type, and if they are mandatory or not)
- [`isSchemaFieldResponseNonNullable`](https://github.com/PoPSchema/comments/blob/d4dded01eaf9def89c53331b0b839e722495c779/src/FieldResolvers/CommentFieldResolver.php#L56): to indicate if a field is non-nullable
- [`getImplementedInterfaceClasses`](https://github.com/PoPSchema/customposts/blob/31d48ee3636117c03111738f5ca90d8c05b17e07/src/FieldResolvers/AbstractCustomPostFieldResolver.php#L23): to define the resolvers for [interfaces](https://graphql.org/learn/schema/#interfaces) implemented by the fields
- [`resolveFieldTypeResolverClass`](https://github.com/PoPSchema/comments/blob/master/src/FieldResolvers/CustomPostFieldResolver.php#L99): to define the type resolver when the field is a connection
- [`resolveFieldMutationResolverClass`](https://github.com/PoPSchema/post-mutations/blob/ad00382d5ca27f1ce719c48759d38eb66cb8d2c2/src/FieldResolvers/RootFieldResolver.php#L125): to define the resolver when the field executes [mutations](https://graphql.org/learn/queries/#mutations)

This code is more legible than if all functionality is satisfied through a single function, or through a configuration array, thus making it easier to implement and maintain the resolvers.
