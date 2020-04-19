# (*) Integrating with REST

By installing the [REST package](https://github.com/getpop/api-rest), the GraphQL server can also satisfy REST endpoints, from a single source of truth. Check out these example links:

- [List of posts](https://newapi.getpop.org/posts/api/rest/)
- [Single post](https://newapi.getpop.org/posts/cope-with-wordpress-post-demo-containing-plenty-of-blocks/api/rest/)

This package deliver the best from both GraphQL and REST, allowing to query resources based on endpoint, with no under/overfetching.

```less
// Query data for a single resource
{single-post-url}/api/rest/?query=
  id|
  title|
  author.
    id|
    name

// Query data for a set of resources
{post-list-url}/api/rest/?query=
  id|
  title|
  author.
    id|
    name
```

<a href="https://newapi.getpop.org/2013/01/11/markup-html-tags-and-formatting/api/rest/?query=id%7Ctitle%7Cauthor.id%7Cname">View query results #1</a>

<a href="https://newapi.getpop.org/posts/api/rest/?query=id%7Ctitle%7Cauthor.id%7Cname">View query results #2</a>

## Configuration

To enable pretty API endpoint `/api/rest/`, follow the instructions [here](https://github.com/getpop/api#enable-pretty-permalinks)

<!--
Add the following code in the `.htaccess` file to enable API endpoint `/api/rest/`:

```apache
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /

# Rewrite from /some-url/api/rest/ to /some-url/?scheme=api&datastructure=rest
RewriteCond %{SCRIPT_FILENAME} !-d
RewriteCond %{SCRIPT_FILENAME} !-f
RewriteRule ^(.*)/api/rest/?$ /$1/?scheme=api&datastructure=rest [L,P,QSA]

# b. Homepage single endpoint (root)
# Rewrite from api/rest/ to /?scheme=api&datastructure=rest
RewriteCond %{SCRIPT_FILENAME} !-d
RewriteCond %{SCRIPT_FILENAME} !-f
RewriteRule ^api/rest/?$ /?scheme=api&datastructure=rest [L,P,QSA]
</IfModule>
```
-->

## Usage

Append `/api/rest/` to the URL to fetch the pre-defined fields, and optionally add a `query` URL parameter to retrieve specific data fields using [this syntax](https://github.com/getpop/field-query).

Examples:

_**Single post, default fields**_:<br/>
[{single-post-url}/api/rest/](https://nextapi.getpop.org/2013/01/11/markup-html-tags-and-formatting/api/rest/)

_**Single post, custom fields**_:<br/>
[{single-post-url}/api/rest/?query=id|title|author.id|name](https://nextapi.getpop.org/2013/01/11/markup-html-tags-and-formatting/api/rest/?query=id|title|author.id|name)

_**Collection of posts, default fields**_:<br/>
[{post-list-url}/api/rest/](https://nextapi.getpop.org/posts/api/rest/)

_**Collection of posts, custom fields**_:<br/>
[{post-list-url}/api/rest/?query=id|title|author.id|name](https://nextapi.getpop.org/posts/api/rest/?query=id|title|author.id|name)

## Generating the JSON-schema

TODO
