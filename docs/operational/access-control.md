# (*) Access Control

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

When [executing the query in GraphiQL](https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20user(id%3A1)%20%7B%0A%20%20%20%20name%0A%20%20%20%20capabilities%0A%20%20%20%20roles%20%7B%0A%20%20%20%20%20%20name%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D), non-logged-in users and users without the required roles will not be allowed access those fields.
