# CMS-agnosticism

GraphQL by PoP is CMS-agnostic, so it can work with any PHP CMS or framework (including WordPress, Laravel and Symfony, even though to date only the implementation for WordPress has been done).

In order to become CMS-agnostic, all functionality that must interact with the CMS is divided into 2 separate packages:

- A CMS-agnostic package, containing all the business code and contracts to interact with the implementing CMS, whichever that is (eg: [posts](https://github.com/PoPSchema/posts))
- A CMS-specific package, containing the implementation of the contracts for a specific CMS (eg: [posts-wp](https://github.com/PoPSchema/posts-wp), implementing the contracts for WordPress)

Then, most of the code (around 90%) lies within the CMS-agnostic package. In order to port the API to a different CMS (eg: from WordPress to Laravel), only the CMS-specific package must be implemented (representing around 10% of the overall code).

Minimizing the amount of code that must be re-implemented, and avoiding duplicate code across packages, are the main drivers defining how the code is split into packages.
