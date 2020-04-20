# (*) IFTTT through Directives

GraphQL by PoP provides the ability to implement IFTTT (If This Then That) strategies through directives. These directives are dynamically added to the query whenever some specific field or directive is present in the query, so that:

- If a specific field from some type is present in the query, execute a certain directive (or directives) on the field
- If a specific directive is invoked, execute another directive (or directives) before or after it

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

TODO

## Example package

In [this schema](https://newapi.getpop.org/graphql-interactive/), the `User` type has fields `roles` and `capabilities`, which can be considered to be sensitive information, so they should not be accessible by the random user.

Package [Access Control List for User Roles](https://github.com/getpop/user-roles-acl) deals with this issue, by attaching directive `@validateDoesLoggedInUserHaveAnyRole` to these two fields, configured to validate that only a user with a given role (configured through environment variable) can access them:

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
