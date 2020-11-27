# Localization

GraphQL servers using the SDL-first approach find it difficult to localize the information in the schema (the [corresponding issue for the spec](https://github.com/graphql/graphql-spec/issues/193) was created more than 4 years ago, and still has no resolution).

Using the code-first approach, though, the GraphQL API can localize the descriptions in a straightforward manner, through PHP function `__('some text', 'domain')`, and the localized strings will be retrieved from a POT file corresponding to the region and language selected in the WordPress admin.

For instance, as we saw earlier on, this code localizes the field descriptions:

```php
class UserFieldResolver extends AbstractDBDataFieldResolver
{
  public function getSchemaFieldDescription(
    TypeResolverInterface $typeResolver,
    string $fieldName
  ): ?string {
    $translationAPI = TranslationAPIFacade::getInstance();
    $descriptions = [
      'username' => $translationAPI->__("User's username handle", "graphql-api"),
      'email' => $translationAPI->__("User's email", "graphql-api"),
      'url' => $translationAPI->__("URL of the user's profile in the website", "graphql-api"),
    ];
    return $descriptions[$fieldName];
  }
}
```