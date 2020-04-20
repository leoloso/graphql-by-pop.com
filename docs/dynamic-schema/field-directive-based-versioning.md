# (*) Field/Directive-based Versioning

Fields and directives can be independently versioned, and the version to use can be specified in the query through the field/directive argument `versionConstraint`.

To select the version for the field/directive, we use the same [semver version constraints employed by Composer](https://getcomposer.org/doc/articles/versions.md#writing-version-constraints):

```graphql
# Selecting version for fields
query {
  #This will produce version 0.1.0
  firstVersion: userServiceURLs(versionConstraint: "^0.1")
  # This will produce version 0.2.0
  secondVersion: userServiceURLs(versionConstraint: ">0.1")
  # This will produce version 0.2.0
  thirdVersion: userServiceURLs(versionConstraint: "^0.2")
}

# Selecting version for directives
query {
  post(id:1) {
    titleCase: title @makeTitle(versionConstraint: "^0.1")
    upperCase: title @makeTitle(versionConstraint: "^0.2")
  }
}
```

[View results: <a href="https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20%23This%20will%20produce%20version%200.1.0%0A%20%20firstVersion%3A%20userServiceURLs(versionConstraint%3A%22%5E0.1%22)%0A%20%20%23%20This%20will%20produce%20version%200.2.0%0A%20%20secondVersion%3A%20userServiceURLs(versionConstraint%3A%22%3E0.1%22)%0A%20%20%23%20This%20will%20produce%20version%200.2.0%0A%20%20thirdVersion%3A%20userServiceURLs(versionConstraint%3A%22%5E0.2%22)%0A%7D">query #1</a>, <a href="https://newapi.getpop.org/graphiql/?query=query%20%7B%0A%20%20post(id%3A1)%20%7B%0A%20%20%20%20titleCase%3A%20title%20%40makeTitle(versionConstraint%3A%20%22%5E0.1%22)%0A%20%20%20%20upperCase%3A%20title%20%40makeTitle(versionConstraint%3A%20%22%5E0.2%22)%0A%20%20%7D%0A%7D">query #2</a>]

## Why

The [evolution strategy](https://graphql.org/learn/best-practices/#versioning) adopted by GraphQL [has a problem](https://blog.logrocket.com/versioning-fields-graphql/): when deprecating a field (as to replace it with a newer implementation), the new field will need to have a new field name. Then, if the deprecated field cannot be removed (for instance, because some clients are still accessing it, from queries that were never revised), then all these fields for a same functionality tend to accumulate in the schema, and the new implementation of the field will not have an optimal name (indeed, it will be worse than the deprecated field's name).

Evolution alone, over time, tends to pollute the schema with undesired definitions. Versioning the schema on a field/directive basis can solve this problem.

## Choosing the version for all fields in the query

Adding the `versionConstraint` parameter in the GraphQL endpoint itself will implicitly define that version constraint in all fields.

For instance, [this GraphiQL client](https://newapi.getpop.org/graphiql/?versionConstraint=%5E0.2) has been versioned with constraint `^0.2`. 

Any field can still override this default value with its own `versionConstraint`. Running [this query](https://newapi.getpop.org/graphiql/?versionConstraint=%5E0.2&query=query%20%7B%0A%20%20%23This%20will%20produce%20version%200.2.0%0A%20%20implicitVersion%3A%20userServiceURLs%0A%20%20%23This%20will%20produce%20version%200.1.0%0A%20%20explicitVersion%3A%20userServiceURLs(versionConstraint%3A%20%22%5E0.1%22)%0A%7D):

```graphql
query {
  #This will produce version 0.2.0
  implicitVersion: userServiceURLs
  #This will produce version 0.1.0
  explicitVersion: userServiceURLs(versionConstraint: "^0.1")
}
```

Will produce different results, from the 2 different versions of the same field:

```json
{
  "data": {
    "implicitVersion": {
      "github": "https://api.github.com/repos/getpop/component-model"
    },
    "explicitVersion": {
      "github": "https://api.github.com/repos/leoloso/PoP"
    }
  }
}
```

## Visualizing the schema for a specific version

::: tip
In order to know which version of the field and directive is the one being used, GraphQL by PoP outputs the field's version as part of the field's description:

![Field description with version in GraphiQL](/images/versioning-field-description.png)

This is a temporary solution until [GraphQL allows to query the `extensions` field through introspection](https://github.com/graphql/graphql-spec/issues/543#issuecomment-462193626) (over which the versioning can be made available).
:::

GraphQL Voyager allows to visualize the schema for the different versions. In the [default schema](https://newapi.getpop.org/graphql-interactive/):

![GraphQL default interactive schema](/images/versioning-field-voyager.jpg)

...field `userServiceURLs` has the following signature, which corresponds to version `0.1.0`:

![Field description for version 0.1.0](/images/versioning-field-version-010.png)

However, when [adding `?versionConstraint=^0.2` to the URL](https://newapi.getpop.org/graphql-interactive/?versionConstraint=^0.2) (which in turn sets this parameter on the endpoint), we can visualize the schema for that version constraint. Then, field `userServiceURLs` has this different signature, corresponding to version `0.2.0`:

![Field description for version 0.2.0](/images/versioning-field-version-020.png)

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
