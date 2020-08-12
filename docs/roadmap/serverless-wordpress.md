# Serverless API for WordPress

The application can be composed of 2 parts:

- Admin-facing side, via WordPress
- API-side, via standalone PHP

[Corcel](https://github.com/corcel/corcel) is a library that enables to read the WordPress database from any standalone PHP application. Through Corcel, we can access the data in the WordPress site, but without using WordPress code.

GraphQL by PoP can use Corcel because of the [CMS-agnostic architecture](../architecture/cms-agnosticism.html), where we can replace the WordPress packages with "serverless WordPress" packages, which use code to access the WordPress data by Corcel.

Then, the standalone PHP application can be deployed to serverless PHP via [Bref](https://bref.sh).

At the same time, the content is edited through WordPress. But this WordPress instance can be dormant: it can be spin-up only whenever we need to do an update, and then terminate it again.

Only the WordPress database must be constantly live.
