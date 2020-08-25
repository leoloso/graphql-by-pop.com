# (*) Public/Private Schema Mode

When access to some a field or directive is denied through [Access Control](access-control.html), there are 2 ways for the API to behave:

**Public mode**: the fields in the schema are exposed, and when the permission is not satisfied, the user gets an error message with a description of why the permission was rejected. This behavior makes the metadata from the schema always available.

**Private mode**: the schema is customized to every user, containing only the fields available to him or her, and so when attempting to access a forbidden field, the error message says that the field doesn't exist. This behavior exposes the metadata from the schema only to those users who can access it.

## How does it work?

TODO

## Configuration

### Environment variables

| Environment variable | Description | Default |
| --- | --- | --- |
| `USE_PRIVATE_SCHEMA_MODE` | Use the private schema mode | `false` |

