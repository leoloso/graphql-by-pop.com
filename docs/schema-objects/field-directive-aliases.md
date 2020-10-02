# Field/Directive Aliases

GraphQL by PoP enables to create field aliases on the server-side (the concept of [field aliases on GraphQL](https://graphql.org/learn/queries/#aliases) is executed on the client, not on the server).

## Uses cases

The following are use cases for the server-side field and directive aliases.

### Adding a targetted IFTTT rule

GraphQL by PoP enables to add directives to the query, on runtime, through coded [IFTTT rules](../dynamic-schema/ifttt-through-directives.html). But this alone is not enough to build a versatile schema.

Say that the site is in English, and it must be translated to French. We can then create IFTTT rule "Whenever requesting fields `Post.title` and `Post.content`, attach directive `@translate(from: "en", to: "fr")` to the field".

Now, whenever requesting this query:

```graphql
{
  posts {
    id
    title
    content
  }
}
```

The server will be executing this query:

```graphql
{
  posts {
    id
    title @translate(from: "en", to: "fr")
    content @translate(from: "en", to: "fr")
  }
}
```

Now, what happens if we want to retrieve the data without any processing, back in English? We can't do it anymore, because fields `Post.title` and `Post.content` will always have the directive `@translate` attached to them.

The solution is to create field aliases on the server-side:

- `Post.title` => `Post.frenchTitle`
- `Post.content` => `Post.frenchContent`

A field and its aliases are all available in the schema, and are resolved exactly the same way by the resolver, hence both `Post.title` and `Post.frenchTitle` will be resolved as `"Hello world!"`. But then, we can define the IFTTT rule on the aliased fields only, so that only the aliased fields are translated to French:

```php
$directiveArgs = ['from' => 'en', 'to' => 'fr'];
ContainerBuilderUtils::injectValuesIntoService(
    'ifttt_manager',
    'addEntriesForFields',
    TranslationGroups::TRANSLATE,
    [
        [PostTypeResolver::class, 'frenchTitle', $directiveArgs],
        [PostTypeResolver::class, 'frenchContent', $directiveArgs],
    ]
);
```

Now, this query:

```graphql
{
  posts {
    id
    title
    frenchTitle
    content
    frenchContent
  }
}
```

Will be executed by the server like this:

```graphql
{
  posts {
    id
    title
    frenchTitle @translate(from: "en", to: "fr")
    content
    frenchContent @translate(from: "en", to: "fr")
  }
}
```

## Tagging a version

GraphQL by PoP supports [field or directive-based versioning](../dynamic-schema/field-directive-based-versioning.html) for the schema (as contrasted to evolving the schema), where we pass a field (or directive) argument `versionConstraint` to indicate which version of the field to use.

Field aliases can be a convenient mechanism to expose all versions of the fields in the schema: we can "tag" an alias to a specific version of a field, like this:

- `Post.v1Title` => `Post.title(versionConstraint: 1.2.5)`

## Avoid namespacing directives in their names

Namespacing custom directives is a practice [recommend by the spec](http://spec.graphql.org/draft/#sel-GAHnBTFCBxBB3BlqK):

> When defining a directive, it is recommended to prefix the directive’s name to make its scope of usage clear and to prevent a collision with directives which may be specified by future versions of this document (which will not include `_` in their name). For example, a custom directive used by Facebook’s GraphQL service should be named `@fb_auth` instead of `@auth`.

The issue with this practice is that it makes the schema ugly, where `@fb_auth` is not as elegant as simply `@auth`. Even worse, it is not 100% reliable in avoiding conflicts, since companies may use the same namespace to identify themselves. For instance, a library offering directive `@fb_auth` may be produced not just by Facebook but also by Google's Firebase.

An alternative solution offered by aliases, is to generate an aliased version of the directive only when the conflict actually happens.

For instance, if we are using directive `@auth` provided by Facebook, and we later on also need to use directive `@auth` provided by Firebase, only then we create aliases for them, such as `@fb_auth` and `@g_fb_auth`.

With directive aliases, our schema can be elegant and legible by default, and namespacing is introduced only in the slight chance it is ever needed, and not always.

## How to create server-side aliases

An alias is implemented as any normal `FieldResolver` or `DirectiveResolver`, plus adding a special trait to indicate which is the aliased field or directive.

### Fields

Add trait [`AliasSchemaFieldResolverTrait`](https://github.com/getpop/component-model/blob/15e9ca01cd6eef94f9193b6be1ef485cb15a69ee/src/FieldResolvers/AliasSchemaFieldResolverTrait.php) to the `FieldResolver` class, and implement methods `getAliasedFieldName` and `getAliasedFieldResolverClass`, like in [this example](https://github.com/leoloso/examples-for-pop/blob/d73894c28941ae2b037b5e1675a4a9781237efe1/src/FieldResolvers/MeshRootAliasFieldResolver.php):

```php
namespace Leoloso\ExamplesForPoP\FieldResolvers;

use PoP\Engine\TypeResolvers\RootTypeResolver;
use PoP\ComponentModel\FieldResolvers\AbstractDBDataFieldResolver;
use PoP\ComponentModel\FieldResolvers\AliasSchemaFieldResolverTrait;

class MeshRootAliasFieldResolver extends AbstractDBDataFieldResolver
{
    use AliasSchemaFieldResolverTrait;

    public static function getClassesToAttachTo(): array
    {
        return array(RootTypeResolver::class);
    }

    public static function getFieldNamesToResolve(): array
    {
        return [
            'personalMeshServices',
            'personalMeshServiceData',
            'personalContentMesh',
        ];
    }

    protected function getAliasedFieldName(string $fieldName): string
    {
        $aliasFieldNames = [
            'personalMeshServices' => 'meshServices',
            'personalMeshServiceData' => 'meshServiceData',
            'personalContentMesh' => 'contentMesh',
        ];
        return $aliasFieldNames[$fieldName];
    }

    protected function getAliasedFieldResolverClass(): string
    {
        return MeshRootFieldResolver::class;
    }
}
```

### Directives

Add trait [`AliasSchemaDirectiveResolverTrait`](https://github.com/getpop/component-model/blob/0ccd012c445cc88a78690c9fb09695a14b32d152/src/DirectiveResolvers/AliasSchemaDirectiveResolverTrait.php) to the `DirectiveResolver` class, and implement method `getAliasedDirectiveResolverClass`, like in [this example](https://github.com/leoloso/examples-for-pop/blob/27dc6c48bfd7a0937719e9c523e13464ea920aba/src/DirectiveResolvers/MakeTitleAliasDirectiveResolver.php#L12):

```php
namespace Leoloso\ExamplesForPoP\DirectiveResolvers;

use PoP\ComponentModel\DirectiveResolvers\AbstractGlobalDirectiveResolver;
use PoP\ComponentModel\DirectiveResolvers\AliasSchemaDirectiveResolverTrait;

class MakeTitleAliasDirectiveResolver extends AbstractGlobalDirectiveResolver
{
    use AliasSchemaDirectiveResolverTrait;

    const DIRECTIVE_NAME = 'unambiguousMakeTitle';
    public static function getDirectiveName(): string
    {
        return self::DIRECTIVE_NAME;
    }

    protected static function getAliasedDirectiveResolverClass(): string
    {
        return MakeTitleDirectiveResolver::class;
    }
}
```
