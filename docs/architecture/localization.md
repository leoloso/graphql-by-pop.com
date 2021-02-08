# Localization

GraphQL by PoP localizes the descriptions via the `TranslationAPI`'s service, through function `__('some text', 'domain')`.

For instance, this code localizes the field descriptions:

```php
class UserFieldResolver extends AbstractDBDataFieldResolver
{
  public function getSchemaFieldDescription(
    TypeResolverInterface $typeResolver,
    string $fieldName
  ): ?string {
    $translationAPI = TranslationAPIFacade::getInstance();
    $descriptions = [
      'username' => $translationAPI->__("User's username handle", 'users'),
      'email' => $translationAPI->__("User's email", 'users'),
      'url' => $translationAPI->__("URL of the user's profile in the website", 'users'),
    ];
    return $descriptions[$fieldName];
  }
}
```