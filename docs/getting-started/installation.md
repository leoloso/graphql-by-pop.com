# Installation

To date, only the adapters for WordPress have been implemented.

## Requirements

GraphQL by PoP requires PHP 7.1 or higher.

## Installing on WordPress

### By WordPress plugin

_Coming soon..._

### Via Composer

1. Make sure your `composer.json` file has the configuration below to accept minimum stability `"dev"`:

```json
{
    ...
    "minimum-stability": "dev",
    "prefer-stable": true,
    ...
}
```

2. Add the following packages to the `require` section of your `composer.json` file:

```json
{
    "require": {
        "getpop/engine-wp": "dev-master",
        "getpop/postmeta-wp": "dev-master",
        "getpop/pages-wp": "dev-master",
        "getpop/usermeta-wp": "dev-master",
        "getpop/commentmeta-wp": "dev-master",
        "getpop/taxonomyquery-wp": "dev-master",
        "getpop/postmedia-wp": "dev-master",
        "getpop/graphql": "dev-master",
        "getpop/api-endpoints-for-wp": "dev-master"
    }
}
```

> Note: Only packages `"getpop/engine-wp"` and `"getpop/graphql"` are mandatory. The other ones are required to load data from posts, pages, users, comments, taxonomies and media, and to set-up the API endpoint permalink

3. Download and install the packages in your project:

```bash
$ composer update
```

4. Install the mu-plugins in your project (somehow, this action is not triggered when first downloading the dependencies, so a subsequent `install` is needed):

```bash
$ composer install
```

5. Check that the GraphQL API works by executing a query against endpoint `/api/graphql`.

Assuming that your server is `http://localhost`, execute in terminal:

```bash
$ curl \
  -X POST \
  -H "Content-Type: application/json" \
  --data '{ "query": "{ posts { title } }" }' \
  http://localhost/api/graphql/
```

#### Optionals

1. To accept external API queries, add the snippet below in file `.htaccess`:

```apache
<IfModule mod_rewrite.c>
# Enable the server to accept external API queries
Header set Access-Control-Allow-Methods "OPTIONS, GET, POST"
Header set Access-Control-Allow-Headers "origin, content-type"
Header set Access-Control-Allow-Origin "*"
</IfModule>
```

2. Improve performance: Set-up the API endpoint through the `.htaccess` file

Instead of adding dependency `"getpop/api-endpoints-for-wp"`, you can set-up the API endpoint `/api/graphql` by adding the following code in the root `.htaccess` file (before the WordPress rewrite code, which starts with `# BEGIN WordPress`):

```apache
<IfModule mod_rewrite.c>
# Rewrite from api/graphql/ to /?scheme=api&datastructure=graphql
RewriteEngine On
RewriteBase /
RewriteCond %{SCRIPT_FILENAME} !-d
RewriteCond %{SCRIPT_FILENAME} !-f
RewriteRule ^api/graphql/?$ /?scheme=api&datastructure=graphql [L,P,QSA]
</IfModule>
```

### Scaffold a new WordPress site with the API installed

Follow the instructions under project [Bootstrap a PoP API for WordPress](https://github.com/leoloso/PoP-API-WP#creating-a-new-wordpress-site-with-pop-installed).
