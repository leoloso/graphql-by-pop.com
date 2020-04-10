# Configuration

GraphQL by PoP relies on [Symfony's Dotenv component](https://symfony.com/doc/current/components/dotenv.html) to define the configuration through environment variables.

For the `DEV` environment, you can set-up environment variables in the project's `config/.env` file, like this:

```properties
USE_PRIVATE_SCHEMA_MODE=true
NAMESPACE_TYPES_AND_INTERFACES=true
```

You can also create additional localized `.env` files (such as `.env.local`) in folder `config/`, as detailed in the [component's documentation](https://symfony.com/doc/current/components/dotenv.html).

Throughout this documentation, whenever a component is configurable, there will be a `"Configuration"` section listing down its environment variables.
