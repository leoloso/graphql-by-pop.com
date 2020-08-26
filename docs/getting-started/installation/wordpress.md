# Installing on WordPress

## Via the "GraphQL API for WordPress" plugin

[GraphQL API for WordPress](https://github.com/GraphQLAPI/graphql-api-for-wp) is the implementation for WordPress of GraphQL by PoP.

### Requirements

WordPress 5.4 or above, PHP 7.2 or above.

### Install

Download [the latest version](https://github.com/GraphQLAPI/graphql-api-for-wp/releases/download/v0.4/graphql-api.zip) of the plugin. 

Then, in the WordPress admin:

- Go to `Plugins => Add New`
- Click on `Upload Plugin`
- Select the .zip file
- Click on `Install Now` (it may take a few minutes)
- Once installed, click on `Activate`

After installed, there will be a new "GraphQL API" section on the menu:

![The interactive schema visualizer](/images/interactive-schema.png)

## Via Composer

Installing via [Composer](https://getcomposer.org) enables to select exactly the required packages.

Please make sure to have Composer installed, and file `composer.json` in the root of your project. If you do not have this file, run this command to create it:

```bash
composer init -n
```

Then complete the following steps.

1. Make sure your `composer.json` file has the entries below to accept minimum stability `"dev"`:

```json
{
    "minimum-stability": "dev",
    "prefer-stable": true
}
```

2. Add the required packages entry the `require` section of your `composer.json` file:

```json
{
    "require": {
        "pop-schema/custompostmeta-wp": "dev-master",
        "pop-schema/posts-wp": "dev-master",
        "pop-schema/pages-wp": "dev-master",
        "pop-schema/usermeta-wp": "dev-master",
        "pop-schema/commentmeta-wp": "dev-master",
        "pop-schema/taxonomyquery-wp": "dev-master",
        "pop-schema/custompostmedia-wp": "dev-master",
        "graphql-by-pop/graphql-server": "dev-master",
        "graphql-by-pop/graphql-endpoint-for-wp": "dev-master",
        "getpop/engine-wp-bootloader": "dev-master",
        "composer/installers": "~1.0"
    }
}
```

::: details What are these packages?
From owner `"getpop"`, only packages `"getpop/graphql"` and `"getpop/engine-wp-bootloader"` are mandatory. The other ones are required to load data from posts, pages, users, comments, taxonomies and media, and to set-up the API endpoint permalink.

Package `"composer/installers"` is required to set-up some required must-use plugins.
:::

::: details Can install from tagged releases?
We are currently creating a release for all the required components from the [PoP repo](https://github.com/getpop), and this task will take several weeks. Until then, components must be installed using the `"dev-master"` version.

You can follow progress on this project: [Release components](https://github.com/GraphQLByPoP/graphql-by-pop.com/projects/4).

Please notice that the README file from unreleased components may temporarily have the `build` badge showing `error`, and the `code quality` badge showing `project not found`. Their code is, however, working well; the problem comes from PSR-2 and static analysis rules executed by [Travis](https://travis-ci.com) not yet satisfied, and the component's project not yet set-up in [Scrutinizer](https://scrutinizer-ci.com). We are fixing these issues component by component, as we release them.
:::

3. Add the following `"installer-paths"` under the `extra` section of your `composer.json` file:

```json
{
    "extra": {
        "installer-paths": {
            "wp-content/mu-plugins/{$name}": [
                "type:wordpress-muplugin"
            ]
        }
    }
}
```

::: warning
If your mu-plugins are installed under a different folder, please change this configuration accordingly.
:::

4. Download and install the packages in your project:

```bash
composer update
```

::: warning
After this step, there should be file a `mu-require.php` under the `wp-content/mu-plugins` folder. If for some reason it is not there, run `composer update` again.
:::

5. Load Composer and initialize the `Component` class for all the required packages, by adding code like this one at the beginning of file `wp-config.php`:

```php
// Load Composer’s autoloader
require_once (__DIR__.'/vendor/autoload.php');

// Initialize all PoP components
\PoP\Engine\ComponentLoader::initializeComponents([
    \PoPSchema\CommentMetaWP\Component::class,
    \PoPSchema\PostsWP\Component::class,
    \PoPSchema\PagesWP\Component::class,
    \PoPSchema\CustomPostMetaWP\Component::class,
    \PoPSchema\CustomPostMediaWP\Component::class,
    \PoPSchema\TaxonomyQueryWP\Component::class,
    \PoPSchema\UserMetaWP\Component::class,
    \GraphQLByPoP\GraphQLServer\Component::class,
    \GraphQLByPoP\GraphQLEndpointForWP\Component::class,
]);
```

6. In the WordPress admin, flush the re-write rules to enable the API endpoint:

- Go to `Settings => Permalinks`
- Click on the "Save Changes" button (no need to modify any input)

7. Check that the GraphQL API works by executing a query against endpoint `/api/graphql`. Assuming that your site is installed under `http://localhost`, execute in terminal:

```bash
curl \
  -X POST \
  -H "Content-Type: application/json" \
  --data '{ "query": "{ posts { title } }" }' \
  http://localhost/api/graphql/
```

The (formatted) response should be something like this:

```json
{
    "data": {
        "posts": [
            {
                "title":"Hello world!"
            }
        ]
    }
}
```

8. Celebrate! 🥳🕺🏻💃🏼🙌

### Optionals

1. To accept external API queries, add the snippet below in file `.htaccess`:

```apacheconf
<IfModule mod_rewrite.c>
# Enable the server to accept external API queries
Header set Access-Control-Allow-Methods "OPTIONS, GET, POST"
Header set Access-Control-Allow-Headers "origin, content-type"
Header set Access-Control-Allow-Origin "*"
</IfModule>
```

2. Set-up the API endpoint through the `.htaccess` file

Instead of defining the API endpoint by code through dependency `"getpop/graphql-endpoint-for-wp"` (and having to flush the rewrite rules), it can also be set-up with a rewrite rule in the `.htaccess` file. For this, remove that dependency from composer, and add the code below before the WordPress rewrite section (which starts with `# BEGIN WordPress`):

```apacheconf
<IfModule mod_rewrite.c>
# Rewrite from api/graphql/ to /?scheme=api&datastructure=graphql
RewriteEngine On
RewriteBase /
RewriteCond %{SCRIPT_FILENAME} !-d
RewriteCond %{SCRIPT_FILENAME} !-f
RewriteRule ^api/graphql/?$ /?scheme=api&datastructure=graphql [L,P,QSA]
</IfModule>
```

## Scaffold a new WordPress site with the API installed, via Composer and WP-CLI

Follow the instructions under project [Bootstrap a PoP API for WordPress](https://github.com/leoloso/PoP-API-WP#creating-a-new-wordpress-site-with-pop-installed).
