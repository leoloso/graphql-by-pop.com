# Versioning fields and directives

Let's make use of GraphQL by PoP's [field/directive-based versioning](../docs/dynamic-schema/field-directive-based-versioning) to upgrade our API, exploring strategies to avoid breaking any client while keeping the schema as neat as possible.

## Strategies for versioning

What happens if we do not pass the `versionConstraint`? This depends on the implementation of the API, which can choose what strategy to follow:

### Make it mandatory to define a version constraint

Forbid the client from not specifying the version constraint by making the field argument mandatory. Then, whenever not provided, the query will return an error:

```json
{
  "errors": [
    {
      "message": "Argument 'versionConstraint' in field 'yourFieldName' cannot be empty"
    }
  ],
  "data": {
    ...
  }
}
```

### Use the old version by default until a certain date

Keep using the old version until a certain date, in which the new version will become the default one to use; while in this transition period, ask the developers to explicitly add a version constraint to the old version before that date, through a new `warning` entry in the query.

Running <a href="https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20%23This%20will%20produce%20version%200.1.0%2C%20and%20warn%20the%20users%0A%20%20%23to%20explicitly%20set%20a%20version%20on%20the%20query%0A%20%20userServiceURLs%0A%7D">this query</a> will produce this response:

```json
{
  "extensions": {
    "warnings": [
      {
        "message": "Field 'yourFieldName' has a new version: '0.2.0'. This version will become the default one on January 1st. We advise you to use this new version already and test that it works fine; if you find any problem, please report the issue in https://github.com/mycompany/myproject/issues. To do the switch, please add the 'versionConstraint' field argument to your query, using Composer's semver constraint rules (https://getcomposer.org/doc/articles/versions.md): yourFieldName(versionConstraint:\"^0.2\"). If you are unable to switch to the new version, please make sure to explicitly point to the current version '0.1.0' before January 1st: yourFieldName(versionConstraint:\"0.1.0\"). In case of doubt, please contact us at name@company.com."
      }
    ]
  },
  "data": {
    ...
  }
}
```

### Use the latest version by default

Use the latest version of the field whenever the `versionConstraint` is not set, and encourage the users to explicitly define which version must be used, showing the list of all available versions for that field through a new `warning` entry.

Running <a href="https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20%23This%20will%20produce%20version%200.2.0%20and%20show%0A%20%20%23all%20available%20versions%20to%20the%20users%0A%20%20userServiceData%0A%7D">this query</a> will produce this response:

```json
{
  "extensions": {
    "warnings": [
      {
        "message": "Field 'yourFieldName' has more than 1 version. Please add the 'versionConstraint' field argument to your query to indicate which version to use (using Composer's semver constraint rules: https://getcomposer.org/doc/articles/versions.md). To use the latest version, use: yourFieldName(versionConstraint:\"^0.2\"). Available versions: '0.2.0', '0.1.0'."
      }
    ]
  },
  "data": {
    ...
  }
}
```
