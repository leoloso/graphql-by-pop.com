# IFTTT through Directives

GraphQL by PoP provides the ability to implement IFTTT (If This Then That) strategies through directives. These directives are dynamically added to the query whenever some specific field or directive is present in the query.

In general, IFTTT are rules that trigger actions whenever a specified event happens. In our situation, the pairs of event/action are:

- If "field X found on the query" then "attach directive Y to field X"
- If "directive Z found on the query" then "execute directive Y before/after directive Z"

Dynamically adding IFTTT directives to the schema is a recursive process: such directive can, itself, be configured its own set of IFTTT directives which are also added to the directive chain up.

## Use cases

We can add the following capabilities to the API, among others.

### Define the cache control max-age a field by field basis

Attach a `@CacheControl` directive to all fields, customizing the value of the `maxAge` parameter: 1 year for the `Post`'s field `url`, and 1 hour for field `title`.

### Set-up access control

Attach a `@validateDoesLoggedInUserHaveAnyRole` directive to field `email` from the `User` type, so only the admins can query the user email.

### Synchronize access-control with cache-control

By chaining up directives, we can make sure that, whenever validating if the user can access a field/directive, the response will not be cached. For instance:

- Attach directive `@validateIsUserLoggedIn` to field `me`
- Attach directive `@CacheControl` with `maxAge` argument value of `0` to directive `@validateIsUserLoggedIn`.

### Beef up security

Attach a `@validateIsUserLoggedIn` directive to directive `@translate`, to avoid malicious actors executing queries against the GraphQL service that can bring the server down and spike its bills (in this case, `@translate` is based on Google Translate and it pays a fee to use this service)

## How it works



How do we add directives to the schema via IFTTT? Say, for instance, we want to create a custom directive `@authorize(role: String!)`, to validate the that user executing field `myPosts` has the expected role `author`, or show an error otherwise.

If we created the schema using the SDL, it would look like this:

```graphql
directive @authorize(role: String!) on FIELD_DEFINITION

type User {
  myPosts: [Post] @authorize(role: "author")
}
```

The IFTTT rule defines the same intent that the SDL above is declaring: whenever requesting field `myPosts`, execute directive `@authorize(role: "author")` on it.

This rule for GraphQL by PoP looks like [this](https://github.com/PoPSchema/user-roles-acl/blob/2c179ff6d7c88be2e63542fbad619963755fc566/src/Config/ServiceConfiguration.php#L51):

```php
ContainerBuilderUtils::injectValuesIntoService(
    'access_control_manager',
    'addEntriesForFields',
    UserRolesAccessControlGroups::ROLES,
    [
        [RootTypeResolver::class, 'myPosts', ['author']],
    ]
);
```

Now, whenever field `myPosts` is found on the query, the engine will automatically attach `@authorize(role: 'author')` to that field on the executable query.

IFTTT rules can also be triggered when encountering a directive, not just a field. For instance, we can set-up rule "Whenever directive `@translate` is found on the query, execute directive `@cache(time: 3600)` on that field".

Adding IFTTT directives to the query is a recursive process: it will trigger a new event to be processed by IFTTT rules, potentially attaching other directives to the query, and so on.

For instance, rule "Whenever directive `@cache` is found, execute directive `@log`" would log an entry about the execution of the field, and then trigger a new event concerning this newly added directive.

## Example package

In [this schema](https://newapi.getpop.org/graphql-interactive/), the `User` type has fields `roles` and `capabilities`, which can be considered to be sensitive information, so they should not be accessible by the random user.

Package [Access Control List for User Roles](https://github.com/GatoGraphQL/GatoGraphQL/tree/master/layers/Schema/packages/user-roles-acl) deals with this issue, by attaching directive `@validateDoesLoggedInUserHaveAnyRole` to these two fields, configured to validate that only a user with a given role (configured through environment variable) can access them:

```php
if ($roles = Environment::anyRoleLoggedInUserMustHaveToAccessRolesFields()) {
  ContainerBuilderUtils::injectValuesIntoService(
    'access_control_manager',
    'addEntriesForFields',
    UserRolesAccessControlGroups::ROLES,
    [
      [UserTypeResolver::class, 'roles', $roles],
      [UserTypeResolver::class, 'capabilities', $roles],
    ]
  );
}
```

When [executing the query in GraphiQL](https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20user(by:{id%3A1})%20%7B%0A%20%20%20%20name%0A%20%20%20%20capabilities%0A%20%20%20%20roles%20%7B%0A%20%20%20%20%20%20name%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D), non-logged-in users and users without the required roles will not be allowed access those fields.
