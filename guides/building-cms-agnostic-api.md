# Building a CMS-agnostic API

Making code that is agnostic of the CMS or framework has several benefits. For instance, if we ever decide to replace our CMS with another one, having the API code be agnostic from the CMS simplifies matters: The more CMS-agnostic our API code is, the less effort will be required to port it to other platforms.

GraphQL by PoP is itself CMS-agnostic, however the code for the implemented API may or may not be. This guide will demonstrate the considerations to have for building an API that is as CMS-agnostic as possible.

Making the API completely CMS-agnostic is very tough though, even possibly impossible, since sooner or later it will need to depend on the specific CMS's opinionatedness (or at least on the specific CMS's API). Then, instead of attempting to achieve 100% code reusability, our goal must simply be to maximize the amount of code that is CMS-agnostic to make it reusable across different CMSs or frameworks (for the context of this guide, these 2 terms will be used interchangeably). Then, migrating the API to a different framework will be not without pain, but at least it will be as painless as possible.

The solution to this challenge concerns the architecture of our API: We must keep the core of the API cleanly decoupled from the specifics of the underlying framework, by coding against interfaces instead of implementations. Doing so will grant additional benefits to our codebase: We can then focus our attention almost exclusively on the business logic (which is the real essence and purpose of the API), causing the code to become more understandable and less muddled with the limitations imposed by the particular CMS.

The design of our architecture will be based on the following pillars:

1. Code against interfaces, not implementations
2. Create packages, distribute them through Composer
3. Dependency Injection to glue all parts together

Let's analyze them one by one.

## Code against interfaces, not implementations

Coding against interfaces is the practice of interacting with a certain piece of code through a contract. A contract, which is set-up through an interface from our programming language, establishes the intent of certain functionality, by explicitly stating what functions are available, what inputs are expected for each function, and what each function will return, and it is not concerned with how the functionality must be implemented. Then, our API can be cleanly decoupled from a specific implementation, not needing to know how its internals work, and being able to change to another implementation at any time without having to drastically change code. For instance, our API can store data by interacting with an interface called `DataStoreInterface` instead of any of its implementations, such as instances of classes `DatabaseDataStore` or `FilesystemDataStore`.

For instance, in the context of building a GraphQL server for WordPress, this implies that no WordPress code will be referenced directly, and WordPress itself will simply be a service provider for all the functions that the API needs.

Contracts, and their implementations, can be added to packages distributed through Composer, and glued together into the API through dependency injection, which are the items we will analyze next.

## Create packages, distribute them through Composer

Composer is itself CMS-agnostic, so it can be used for building any PHP application. Packages distributed through Composer, though, may be CMS-agnostic or not. Therefore, our API should depend on CMS-agnostic packages (which will work for any CMS) as much as possible, and when not possible, depend on the corresponding package that works for our specific CMS.

This strategy can be used to code against contracts, as explained earlier on. The packages for our API can be divided into two types: CMS-agnostic and CMS-specific ones. The CMS-agnostic package will contain all the contracts and all generic code, and the API will exclusively interact with these packages. For each CMS-agnostic package containing contracts we must also create a CMS-specific package containing the implementation of the contracts for the required CMS, which is set into the API by means of dependency injection (which we'll analyze below).

For instance, to implement an API to retrieve posts, we create a CMS-agnostic package called "Posts", with contract `PostAPIInterface` containing function `getPosts`, like this:

```php
interface PostAPIInterface
{
  public function getPosts($args);
}
```

This function can be resolved for WordPress through a package called "Posts for WordPress", which resolves the contract through a class `WPPostAPI`, implementing function `getPosts` to simply execute WordPress function `get_posts`, like this:

```php
class WPPostAPI implements PostAPIInterface
{
  public function getPosts($args) {
    return get_posts($args);
  }
}
```

If we ever need to port our API from WordPress to another CMS, we must only implement the corresponding CMS-specific package for the new CMS (eg: "Posts for Laravel") and update the dependency injection configuration matching contracts to implementations, and that's it!

## Dependency Injection to glue all parts together

Dependency injection is a technique which allows to declare which object from the CMS-specific package (aka the "service provider") is implementing which interface from the CMS-agnostic package (aka the "contract"), thus glueing all parts of the application together in a loosely-coupled manner.

Dependency injection must be used to bind together generic contracts and services, and not only those depending on the CMS (for instance, a contract `DataStoreInterface`, resolved through service provider `FilesystemDataStore`, may be completely unrelated to the underlying CMS). In addition, a very simple application which does not require an underlying CMS will still benefit from dependency injection. Hence, GraphQL by PoP is already integrated with a dependency injection solution: Symfony's [DependencyInjection component](https://symfony.com/components/DependencyInjection).

Using Symfony's DependencyInjection component, a service `Cache` implementing a contract `CacheInterface`, like this one:

```php
namespace MyPackage\MyProject;
class Cache implements CacheInterface
{
  private $cacheItemPool;
  private $hooksAPI;

  public function __construct(
    CacheItemPoolInterface $cacheItemPool,
    HooksAPIInterface $hooksAPI
  ) {
    $this->cacheItemPool = $cacheItemPool;
    $this->hooksAPI = $hooksAPI;
  }

  // ...
}
```

... can be set as the default service provider through the following `services.yaml` configuration file:

```yaml
services:
  _defaults:
    bind:
      MyPackage\MyProject\HooksAPIInterface: '@hooks_api'

  hooks_api:
    class: \MyPackage\MyProject\ContractImplementations\HooksAPI

  cache:
    class: \MyPackage\MyProject\Cache
    public: true
    arguments:
      $cacheItemPool: '@cache_item_pool'

  cache_item_pool:
    class: \Symfony\Component\Cache\Adapter\FilesystemAdapter
```

As it can be observed, class `Cache` requires two parameters in its constructor, and these are resolved and provided by the dependency injection component based on the configuration. In this case, while parameter `$cacheItemPool` is manually set, parameter `$hooksAPI` is automatically resolved through type-hinting (i.e. matching the expected parameter's type, with the service that resolves that type). Autowiring thus helps reduce the amount of configuration required to glue the services and their implementations together.

## Make your packages as granular as possible

Each package must be as granular as possible, dealing with a specific objective, and containing no more or less code than is needed. This is by itself a good practice as to avoid creating bloated packages and establishing a modular architecture, however it is mandatory when we do not know which CMS the API will run on. This is because different CMSs are based on different models, and it is not guaranteed that every objective can be satisfied by the CMS, or under what conditions. Keeping packages small and objective then enables to fulfil the required conditions on a progressive manner, or discard using this package only when its corresponding functionality can't be satisfied by the CMS.

For instance, if we come from a WordPress mindset, we could initially assume that entities "posts" and "comments" will always be part of the Content Management System, and we may include them under a package called "CMS core". However, [October CMS](https://octobercms.com) doesn't ship with either posts or comments in its core functionality, and these are implemented through plugins. For the next iteration, we may decide to create a package to provide for these two entities, called "Posts and Comments", or even "Posts" under the assumption that comments are dependent on posts and bundled with them. However, once again, the plugins in October CMS don't implement these two together: There is a plugin implementing posts and another plugin implementing comments (which has a dependency on the posts plugin). Finally, our only option is to implement two separate packages: "Posts" and "Comments", and assign a dependency from the latter to the former one.

Likewise, a post in WordPress contains post meta attributes (i.e. additional attributes to those defined in the database model) and we may assume that every CMS will support the same concept. However, we can't guarantee that another CMS will provide this functionality and, even if it did, its implementation may be so different than that from WordPress that not the same operations could be applied on the meta attributes. For instance, both WordPress and October CMS have support for post meta attributes. However, whereas WordPress stores each post meta value as a row on a different database table than where the post is stored, October CMS stores all post meta values in a single entry as a serialized JSON object in a column from the post table. As a consequence, WordPress can fetch posts filtering data based on the meta value, but October CMS cannot. Hence, the package "Posts" must not include the functionality for post meta, which must then be implemented on its own package "Custom Post Meta" (satisfiable by both WordPress and October CMS), and this package must not include functionality for querying the meta attributes when fetching posts, which must then be implemented on its own package "Custom Post Meta Query" (satisfiable only by WordPress).

## Tradeoffs of CMS-agnosticism

These are the advantages and disadvantages of making the API be CMS-agnostic:

**Advantages:**

- The effort required to port our API to other platforms is greatly reduced
- Because the code reflects our business logic and not the opinionatedness of the CMS, it is more understandable
- The API is naturally organized through packages which provide progressive enhancement of functionalities

**Disadvantages:**

- Code becomes more verbose
- Longer execution time from added layers of code

## Code implementations

Let's proceed to code an API using the strategies to make it CMS-agnostic. The initial CMS will be WordPress, and the produced code must deal with WordPress only through CMS-specific packages.

::: tip
For ease of reading, namespaces have been omitted throughout this guide. However, namespaces must be added following the PHP Standards Recommendation [PSR-4](https://www.php-fig.org/psr/psr-4/).
:::

### Accessing services

In GraphQL by PoP, class `ContainerBuilderFactory` provides access to the defined services in all `services.yaml` files. This class simply stores a static instance of the component's `ContainerBuilder` object:

```php
use Symfony\Component\DependencyInjection\ContainerBuilder;

class ContainerBuilderFactory {
  private static $instance;
  public static function init()
  {
    self::$instance = new ContainerBuilder();
  }
  public static function getInstance()
  {
    return self::$instance;
  }
}
```

Then, after creating a service called `"cache"`, we can access it like this:

```php
$cacheService = ContainerBuilderFactory::getInstance()->get('cache');
```

To make it convenient to access and avoid errors from dealing with strings, we can create a facade class to provide this service:

```php
class CacheFacade
{
    public static function getInstance(): CacheInterface
    {
        return ContainerBuilderFactory::getInstance()->get('cache');
    }
}
```

### Accessing functions

The mantra "code against interfaces, not implementations" means that all those functions provided by the CMS cannot be accessed directly anymore. Instead, we must access the function from a contract (an interface), on which the CMS function will simply be the implementation.

For instance, if our application accesses function `get_posts`:

```php
$posts = get_posts($args);
```

We must then abstract this function under some contract:

```php
interface PostAPIInterface
{
  public function getPosts($args);
}
```

The contract must be implemented for WordPress:

```php
class WPPostAPI implements PostAPIInterface
{
  public function getPosts($args) {
    return get_posts($args);
  }
}
```

A service `"posts_api"` must be added to the dependency injection `services.yaml` configuration file, indicating which class resolves the service:

```yaml
services:
  posts_api:
    class: \WPPostAPI
```

And finally, the application can reference the function through service `"posts_api"`:

```php
$postsAPIService = ContainerBuilderFactory::getInstance()->get('posts_api');
$posts = $postsAPIService->getPosts($args);
```

### Function names

If you have noticed from the code demonstrated above, function `get_posts` is abstracted as `getPosts`. This is so because function names must be camelCased to comply with [PSR-2](https://www.php-fig.org/psr/psr-2/).

Certain functions can be redefined, making more sense in an abstract context. For instance, WordPress function `get_user_by($field, $value)` uses parameter `$field` with values `"id"`, `"ID"`, `"slug"`, `"email"` or `"login"` to know how to get the user. Instead of replicating this methodology, we can explicitly define a separate function for each of them:

```php
interface UsersAPIInterface
{
  public function getUserById($value);
  public function getUserByEmail($value);
  public function getUserBySlug($value);
  public function getUserByLogin($value);
}
```

And these are resolved for WordPress:

```php
class WPUsersAPI implements UsersAPIInterface
{
  public function getUserById($value)
  {
    return get_user_by('id', $value);
  }
  public function getUserByEmail($value)
  {
    return get_user_by('email', $value);
  }
  public function getUserBySlug($value)
  {
    return get_user_by('slug', $value);
  }
  public function getUserByLogin($value)
  {
    return get_user_by('login', $value);
  }
}
```

Certain other functions should be renamed because their names convey information about their implementation, which may not apply for a different CMS. For instance, WordPress function `get_the_author_meta` can receive parameter `"user_lastname"`, indicating that the user's lastname is stored as a "meta" value (which is defined as an additional property for an object, not originally mapped in the database model). However, other CMSs may have a column `"lastname"` in the user table, so it doesn't apply as a meta value.

Then, our contract will implement the following functions:

```php
interface UsersAPIInterface
{
  public function getUserDisplayName($user_id);
  public function getUserEmail($user_id);
  public function getUserFirstname($user_id);
  public function getUserLastname($user_id);
  ...
}
```

Which are resolved for WordPress:

```php
class WPUsersAPI implements UsersAPIInterface
{
  public function getUserDisplayName($user_id)
  {
    return get_the_author_meta('display_name', $user_id);
  }
  public function getUserEmail($user_id)
  {
    return get_the_author_meta('user_email', $user_id);
  }
  public function getUserFirstname($user_id)
  {
    return get_the_author_meta('user_firstname', $user_id);
  }
  public function getUserLastname($user_id)
  {
    return get_the_author_meta('user_lastname', $user_id);
  }
  ...
}
```

Our functions could also be re-defined as to remove the limitations from WordPress. For instance, function `update_user_meta($user_id, $meta_key, $meta_value)` can receive one meta attribute at a time, which makes sense since each of these is updated on its own database query. However, October CMS maps all meta attributes together on a single database column, so it makes more sense to update all values together on a single database operation. Then, our contract can include an operation `updateUserMetaAttributes($user_id, $meta)` which can update several meta values at the same time:

```php
interface UserMetaInterface
{
  public function updateUserMetaAttributes($user_id, $meta);
}
```

Which is resolved for WordPress like this:

```php
class WPUsersAPI implements UsersAPIInterface
{
  public function updateUserMetaAttributes($user_id, $meta)
  {
    foreach ($meta as $meta_key => $meta_value) {
      update_user_meta($user_id, $meta_key, $meta_value);
    }
  }
}
```

Finally, we may want to re-define a function to remove its ambiguities. For instance, WordPress function `add_query_arg` can receive parameters in two different ways:

1. Using a single key and value: `add_query_arg('key', 'value', 'http://example.com');`
2. Using an associative array: `add_query_arg(['key1' => 'value1', 'key2' => 'value2'], 'http://example.com');`

This becomes difficult to keep consistent across CMSs. Hence, our contract can define functions `addQueryArg` (singular) and `addQueryArgs` (plural) as to remove the ambiguity:

```php
public function addQueryArg(string $key, string $value, string $url);
public function addQueryArgs(array $key_values, string $url);
```

### Function parameters

We must also abstract the parameters to the function, making sure they make sense in a generic context. For each function to abstract, we must consider:

- renaming and/or re-defining the parameters
- renaming and/or re-defining the attributes passed on array parameters

For instance, WordPress function `get_posts` receives a unique parameter `$args`, which is an array of attributes. One of its attributes is `fields` which, when given the value `"ids"`, makes the function return an array of IDs instead of an array of objects. However, I deem this implementation too specific for WordPress, and for a generic context I'd prefer a different solution: Convey this information through a separate parameter called `$options`, under attribute `"return-type"`.

To accomplish this, we add parameter `$options` to the function in our contract:

```php
interface PostAPIInterface
{
  public function getPosts($args, $options = []);
}
```

Instead of referencing WordPress constant value `"ids"` (which we can't guarantee will be the one used in all other CMSs), we create a corresponding constant value for our abstracted application:

```php
class Constants
{
  const RETURNTYPE_IDS = 'ids';
}
```

The WordPress implementation must map and recreate the parameters between the contract and the implementation:

```php
class WPPostAPI implements PostAPIInterface
{
  public function getPosts($args, $options = []) {
    if ($options['return-type'] == Constants::RETURNTYPE_IDS) {
      $args['fields'] = 'ids';
    }
    return get_posts($args);
  }
}
```

And finally, we can execute the code through our contract:

```php
$options = [
  'return-type' => Constants::RETURNTYPE_IDS,
];
$post_ids = $postsAPIService->getPosts($args, $options);
```

While abstracting the parameters, we should avoid transfering WordPress's technical debt to our abstracted code, whenever possible. For instance, parameter `$args` from function `get_posts` can contain attribute `'post_type'`. This attribute name is somewhat misleading, since it can receive one element (`post_type => "post"`) but also a list of them (`post_type => "post, event"`), so this name should be in plural instead: `post_types`. When abstracting this piece of code, we can set our interface to expect attribute `post_types` instead, which will be mapped to WordPress's `post_type`.

Similarly, different functions accept arguments with different names, even though these have the same objective, so their name can be unified. For instance, through parameter `$args`, WordPress function `get_posts` accepts attribute `posts_per_page`, and function `get_users` accepts attribute `number`. These attribute names can perfectly be replaced with the more generic attribute name `limit`.

We can also decide to rename parameters if it makes sense, or to adhere to a standard. For instance, we can decide to replace all `"_"` with `"-"`, so our newly-defined argument `post_types` becomes `post-types`.

Applying these prior considerations, our abstracted code will look like this:

```php
class WPPostAPI implements PostAPIInterface
{
  public function getPosts($args, $options = []) {
    ...
    if (isset($args['post-types'])) {
      $args['post_type'] = $args['post-types'];
      unset($args['post-types']);
    }
    if (isset($args['limit'])) {
      $args['posts_per_page'] = $args['limit'];
      unset($args['limit']);
    }
    return get_posts($args);
  }
}
```

We can also re-define attributes to modify the shape of their values. For instance, WordPress parameter `$args` in function `get_posts` can receive attribute `date_query`, whose properties (`"after"`, `"inclusive"`, etc) can be considered specific to WordPress:

```php
$date = current_time('timestamp');
$args['date_query'] = array(
  array(
    'after' => date('Y-m-d H:i:s', $date),
    'inclusive' => true,
  )
);
```

To unify the shape of this value into something more generic, we can re-implement it using other arguments, such as `"date-from"` and `"date-from-inclusive"`:

```php
class WPPostAPI implements PostAPIInterface
{
  public function getPosts($args, $options = []) {
    ...
    if (isset($args['date-from'])) {
      $args['date_args'][] = [
        'after' => $args['date-from'],
        'inclusive' => false,
      ];
      unset($args['date-from']);
    }
    if (isset($args['date-from-inclusive'])) {
      $args['date_args'][] = [
        'after' => $args['date-from-inclusive'],
        'inclusive' => true,
      ];
      unset($args['date-from-inclusive']);
    }
    return get_posts($args);
  }
}
```

In addition, we need to consider if to abstract or not those parameters which are too specific to WordPress. For instance, function `get_posts` allows to order posts by attribute `menu_order`, which doesn't work in a generic context. Then, we'd rather not abstract this code and keep it on the CMS-specific package for WordPress.

Finally, we can also add argument types (and, since here we are, also return types) to our contract fuction, making it more understandable and allowing the code to fail in compilation time instead of during runtime:

```php
interface PostAPIInterface
{
  public function getPosts(array $args, array $options = []): array;
}
```

### States (and other constant values)

We need to make sure that all states have the same meaning in all CMSs. For instance, posts in WordPress can have one among the following states: `"publish"`, `"pending"`, `"draft"` or `"trash"`. To make sure that the application references the abstracted version of the states and not the CMS-specific one, we can simply define a constant value for each of them:

```php
class PostStates {
  const PUBLISHED = 'published';
  const PENDING = 'pending';
  const DRAFT = 'draft';
  const TRASH = 'trash';
}
```

As it can be seen, the actual constant values may or may not be the same as in WordPress: while `"publish"` was renamed as `"published"`, the other ones remain the same.

For the implementation for WordPress, we convert from the agnostic value to the WordPress-specific one:

```php
class WPPostAPI implements PostAPIInterface
{
  public function getPosts($args, $options = []) {
    ...
    if (isset($args['post-status'])) {
      $conversion = [
        PostStates::PUBLISHED => 'publish',
        PostStates::PENDING => 'pending',
        PostStates::DRAFT => 'draft',
        PostStates::TRASH => 'trash',
      ];
      $args['post_status'] = $conversion[$args['post-status']];
      unset($args['post-status']);
    }
    return get_posts($args);
  }
}
```

Finally, we can reference these constants throughout our CMS-agnostic application:

```php
$args = [
  'post-status' => PostStates::PUBLISHED,
];
$posts = $postsAPIService->getPosts($args);
```

This strategy works under the assumption that all CMSs will support these states. If any CMS does not support a particular state (eg: `"pending"`) then it should throw an exception whenever a corresponding functionality is invoked.

### CMS helper functions

WordPress implements several helper functions that must also abstracted, such as `make_clickable`. Because these functions are very generic, we can implement a default behaviour for them that works well in an abstract context, and which can be overriden if the CMS implements a better solution.

We first define the contract:

```php
interface HelperAPIInterface
{
  public function makeClickable(string $text);
}
```

And provide a default behaviour for the helper functions through an abstract class:

```php
abstract class AbstractHelperAPI implements HelperAPIInterface
{
  public function makeClickable(string $text) {
    return preg_replace('!(((f|ht)tp(s)?://)[-a-zA-Zа-яА-Я()0-9@:%_+.~#?&;//=]+)!i', '<a href="$1">$1</a>', $text);
  }
}
```

Now, our application can either use this functionality or, if it runs on WordPress, use the WordPress-specific implementation:

```php
class WPHelperAPI extends AbstractHelperAPI
{
  public function makeClickable(string $text) {
    return make_clickable($text);
  }
}
```

### User permissions

For all CMSs which support user management, in addition to abstracting the corresponding functions (such as `current_user_can` and `user_can` in WordPress), we must also make sure that the user permissions (or capabilities) have the same effect across all CMSs. To achieve this, our abstracted application needs to explicitly state what is expected from the capability, and the implementation for each CMS must either satisfy it through one of its own capabilities, or throw an exception if it can't satisfy it. For instance, if the application needs to validate if the user can edit posts, it can represent it through a capability called `"capability:editPosts"`, which is satisfied for WordPress through its capability `"edit_posts"`.

This is still an instance of the "code against interfaces, not implementations" principle, however here we run against a problem: Whereas in PHP we can define interfaces and classes to model contracts and service providers (which works in compilation time, so that the code doesn't compile if a class implementing an interface does not implement all functions defined in the interface), PHP offers no similar construct to validate that a contract capability (which is simply a string, such as `"capability:editPosts"`) has been satisfied through a capability by the CMS. This concept, which I call a "loose contract", will need to be handled by our application, on runtime.

To deal with "loose contracts", GraphQL by PoP provides a service `LooseContractService` through which:

- the application can define what "contract names" must be implemented, through function `requireNames`
- the CMS-specific implementations can satisfy those names, through function `implementNames`
- the application can get the implementation of a name through function `getImplementedName`
- the application can also inquire for all non-satisfied required names through function `getNotImplementedRequiredNames`, as to throw an exception or log the error, if needed

The service looks like this:

```php
class LooseContractService
{
  protected $requiredNames = [];
  protected $nameImplementations = [];

  public function requireNames(array $names): void
  {
    $this->requiredNames = array_merge(
      $this->requiredNames,
      $names
    );
  }

  public function implementNames(array $nameImplementations): void
  {
    $this->nameImplementations = array_merge(
      $this->nameImplementations,
      $nameImplementations
    );
  }

  public function getImplementedName(string $name): ?string {
    return $this->nameImplementations[$name];
  }

  public function getNotImplementedRequiredNames(): array {
    return array_diff(
      $this->requiredNames,
      array_keys($this->nameImplementations)
    );
  }
}
```

The application, when initialized, can then establish loose contracts by requiring names:

```php
$looseContractService = ContainerBuilderFactory::getInstance()->get('loose_contracts');
$looseContractService->requireNames([
  'capability:editPosts',
]);
```

And the CMS-specific implementation can satisfy these:

```php
$looseContractService->implementNames([
  'capability:editPosts' => 'edit_posts',
]);
```

The application can then resolve the required name to the implementation from the CMS. If this required name (in this case, a capability) is not implemented, then the application may throw an exception:

```php
$cmsCapabilityName = $looseContractService->getImplementedName('capability:editPosts');
if (!$cmsCapabilityName) {
  throw new Exception(sprintf(
    "The CMS has no support for capability \"%s\"",
    'capability:editPosts'
  ));
}
// Now can use the capability to check for permissions
$userManagementAPIService = ContainerBuilderFactory::getInstance()->get('user_management_api');
if ($userManagementAPIService->userCan($user_id, $cmsCapabilityName)) {
  ...
}
```

Alternatively, the application can also fail when first initialized if any one required name is not satisfied:

```php
if ($notImplementedNames = $looseContractService->getNotImplementedRequiredNames()) {
  throw new Exception(sprintf(
    "The CMS has not implemented loose contract names %s",
    implode(', ', $notImplementedNames)
  ));
}
```

### Application options

WordPress ships with several application options, such as those stored in table `wp_options` under entries `"blogname"`, `"blogdescription"`, `"admin_email"`, `"date_format"` and many others. Abstracting application options involves:

- abstraction the function `getOption`
- abstracting each of the required options, aiming to make the CMS satisfy the notion of this option (eg: if a CMS doesn't have an option for the site's description, it can't return the site's name instead)

Let's solve these 2 actions in turn. Concerning function `getOption`, we can expect all CMSs to support storing and retrieving options, so we can place the corresponding function under a `CMSCoreInterface` contract:

```php
interface CMSCoreInterface
{
  public function getOption($option, $default = false);
}
```

As it can be observed from the function signature above, we are making the assumption that each option will also have a default value. However, not every CMS may allow to set default values for options. But it doesn't matter, since the implementation can simply return `NULL` then.

This function is resolved for WordPress like this:

```php
class WPCMSCore implements CMSCoreInterface
{
  public function getOption($option, $default = false)
  {
    return get_option($option, $default);
  }
}
```

To solve the 2nd action, which is abstracting each needed option, it is important to notice that even though we can always expect the CMS to support `getOption`, we can't expect it to implement each single option used by WordPress, such as `"use_smiles"` or `"default_ping_status"`. Hence, we must first filter all options, and abstract only those that make sense in a generic context, such as `"siteName"` or `"dateFormat"`.

Then, having the list of options to abstract, we can use a "loose contract" (as explained earlier on) and require a corresponding option name for each, such as `"option:siteName"` (resolved for WordPress as `"blogname"`) or `"option:dateFormat"` (resolved as `"date_format"`).

### Database column names

In WordPress, when we are requesting data from function `get_posts` we can set attribute `"orderby"` in `$args` to order the results, which can be based on a column from the posts table (such as values `"ID"`, `"title"`, `"date"`, `"comment_count"`, etc), a meta value (through values `"meta_value"` and `"meta_value_num"`) or other values (such as `"post__in"` and `"rand"`).

Whenever the value corresponds to the table column name, we can abstract them using a "loose contract", as explained earlier on. Then, the application can reference a loose contract name:

```php
$args = [
  'orderby' => $looseContractService->getImplementedName('dbcolumn:orderby:posts:date'),
];
$posts = $postsAPIService->getPosts($args);
```

And this name is resolved for WordPress:

```php
$looseContractService->implementNames([
  'dbcolumn:orderby:posts:date' => 'date',
]);
```

Now, let's say that in our WordPress application we have created a meta value `"likes_count"` (which stores how many likes a post has) to order posts by popularity, and we want to abstract this functionality too. To order results by some meta property, WordPress expects an additional attribute `"meta_key"`, like this:

```php
$args = [
  'orderby' => 'meta_value',
  'meta_key' => 'likes_count',
];
```

Because of this additional attribute, this implementation can be considered WordPress-specific, and very difficult to abstract to make it work everywhere. Then, instead of generalizing this functionality, we can simply expect every CMS to add their own, specific implementation.

Let's do that. First, we create a helper class to retrieve the CMS-agnostic query:

```php
class QueryHelper
{
  public function getOrderByQuery()
  {
    return array(
      'orderby' => $looseContractService->getImplementedName('dbcolumn:orderby:posts:likesCount'),
    );
  }
}
```

The OctoberCMS-specific package can add a column `"likes_count"` to the posts table, and resolve name `"dbcolumn:orderby:posts:likesCount"` to `"like_count"` and it will work. The WordPress-specific package, though, must resolve `"dbcolumn:orderby:posts:likesCount"` as `"meta_value"` and then override the helper function to add the additional property `"meta_key"`:

```php
class WPQueryHelper extends QueryHelper
{
  public function getOrderByQuery()
  {
    $query = parent::getOrderByQuery();
    $query['meta_key'] = 'likes_count';
    return $query;
  }
}
```

Finally, we set-up the helper query class as a service in the `ContainerBuilder`, configure it to be resolved to the WordPress-specific class, and we obtain the query for ordering results:

```php
$queryHelperService = ContainerBuilderFactory::getInstance()->get('query_helper');
$args = $queryHelperService->getOrderByQuery();
$posts = $postsAPIService->getPosts($args);
```

Abstracting the values for ordering results which do not correspond to column names or meta properties (such as `"post__in"` and `"rand"`) seems to be more difficult. Because my application doesn't use them, I haven't considered how to do it, or even if it is possible. Then I took the easy way out: I have considered these to be WordPress-specific, hence the application makes them available only when running on WordPress.

### Errors

When dealing with errors, we must consider abstracting the following elements:

- the definition of an error
- error codes and messages

Let's review these in turn.

**Definition of an error:**

An `Error` is a special object, different than an `Exception`, used to indicate that some operation has failed, and why it failed. WordPress represents errors through class `WP_Error`, and allows to check if some returned value is an error through function `is_wp_error`.

We can abstract checking for an error:

```php
interface CMSCoreInterface
{
  public function isError($object);
}
```

Which is resolved for WordPress like this:

```php
class WPCMSCore implements CMSCoreInterface
{
  public function isError($object)
  {
    return is_wp_error($object);
  }
}
```

However, to deal with errors in our abstracted code, we can't expect all CMSs to have an error class with the same properties and methods as WordPress's `WP_Error` class. Hence, we must abstract this class too, and convert from the CMS error to the abstracted error after executing a function from the CMS. GraphQL by PoP provides this class as `Error`, which has signatures very similar to those from `WP_Error`.

We implement a function to convert from the CMS to the abstract error through a helper class:

```php
class WPHelpers
{
  public static function returnResultOrConvertError($result)
  {
    if (is_wp_error($result)) {
      // Create a new instance of the abstracted error class
      $error = new Error();
      foreach ($result->get_error_codes() as $code) {
        $error->add($code, $result->get_error_message($code), $result->get_error_data($code));
      }
      return $error;
    }
    return $result;
  }
}
```

And we finally invoke this method for all functions that may return an error:

```php
class UserManagementService implements UserManagementInterface
{
  public function getPasswordResetKey($user_id)
  {
    $result = get_password_reset_key($user_id);
    return WPHelpers::returnResultOrConvertError($result);
  }
}
```

**Error codes and messages:**

Every CMS will have its own set of error codes and corresponding explanatory messages. For instance, WordPress function `get_password_reset_key` can fail due to the following reasons, as represented by their error codes and messages:

1. `"no_password_reset"`: Password reset is not allowed for this user
2. `"no_password_key_update"`: Could not save password reset key to database

In order to unify errors so that an error code and message is consistent across CMSs, we will need to inspect these and replace them with our custom ones (possibly in function `returnResultOrConvertError` explained above).

### Hooks

WordPress offers the concept of "hooks": a mechanism through which we can change a default behavior or value (through "filters") and execute related functionality (through "actions").

Hooks are such a powerful concept that the application can greatly benefit by making it available to the different CMS-agnostic packages (allowing them to interact with each other) and not leave this wiring-up to be implemented only at the CMS level. Hence, GraphQL by PoP already ships a solution for the "hook" concept in the CMS-agnostic application, and this solution is based on the hooks implemented by WordPress, with similar signature and functionality.

Whenever we need to execute a hook, we do it through the corresponding service:

```php
$hooksAPI = HooksAPIFacade::getInstance();
$title = $hooksAPI->applyFilters("modifyTitle", $title, $post_id);
```

We need to make sure that, whenever a hook is executed, a consistent action will be executed no matter which is the CMS. For hooks defined inside of our application that is no problem, since we can resolve them ourselves, most likely in our CMS-agnostic package. However, when the hook is provided by the CMS, such as action `"init"` (triggered when the system has been initialized) or filter `"the_title"` (triggered to modify a post's title) in WordPress, and we invoke these hooks, we must make sure that all other CMSs will process them correctly and consistently. (Please notice that this concerns hooks that make sense in every CMS, such as `"init"`; certain other hooks can be considered too specific to WordPress, such as filter `"rest_{$this->post_type}_query"` from a REST controller, so we don't need to abstract them.)

The solution is to hook into actions or filters defined exclusively in the application (i.e. not in the CMS), and to bridge from CMS hooks to application hooks whenever needed. For instance, instead of adding an action for hook `"init"` (as defined in WordPress), any code in our application must add an action on hook `"cms:init"`, and then we implement the bridge in the WordPress-specific package from `"init"` to `"cms:init"`:

```php
$hooksAPIService->addAction('init', function() use($hooksAPIService) {
  $hooksAPIService->doAction('cms:init');
});
```

Finally, the application can add a "loose contract" name for `"cms:init"`, and the CMS-specific package must implement it (as demonstrated earlier on).

### Object properties

A rather inconvenient consequence of abstracting our code is that we can't reference the properties from an object directly, and we must do it through a function instead. This is because different CMSs will represent a same object as containing different properties, and it is easier to abstract a function to access the object properties than to abstract the object itself (in which case, among other disadvantages, we may have to reproduce the object caching mechanism from the CMS). For instance, a post object `$post` contains its ID under `$post->ID` in WordPress and under `$post->id` in October CMS. To resolve this property, our contract `PostObjectPropertyResolverInterface` will contain function `getId`:

```php
interface PostObjectPropertyResolverInterface {
  public function getId($post);
}
```

Which is resolved for WordPress like this:

```php
class WPPostObjectPropertyResolver implements PostObjectPropertyResolverInterface {
  public function getId($post)
  {
    return $post->ID;
  }
}
```

Similarly, the post content property is `$post->post_content` in WordPress and `$post->content` in October CMS. Our contract will then allow to access this property through function `getContent`:

```php
interface PostObjectPropertyResolverInterface {
  public function getContent($post);
}
```

Which is resolved for WordPress like this:

```php
class WPPostObjectPropertyResolver implements PostObjectPropertyResolverInterface {
  public function getContent($post)
  {
    return $post->post_content;
  }
}
```

Please notice that function `getContent` receives the object itself through parameter `$post`. This is because we are assuming the content will be a property of the post object in all CMSs. However, we should be cautious on making this assumption, and decide on a property by property basis. If we don't want to make the previous assumption, then it makes more sense for function `getContent` to receive the post's ID instead:

```php
interface PostObjectPropertyResolverInterface {
  public function getContent($post_id);
}
```

Being more conservative, the latter function signature makes the code potentially more reusable, however it is also less efficient, because the implementation will still need to retrieve the post object:

```php
class WPPostObjectPropertyResolver implements PostObjectPropertyResolverInterface {
  public function getContent($post_id)
  {
    $post = get_post($post_id);
    return $post->post_content;
  }
}
```

In addition, some properties may be needed in their original value and also after applying some processing; for these cases, we will need to implement a corresponding extra function in our contract. For instance, the post content needs be accessed also as HTML, which is done through executing `apply_filters('the_content', $post->post_content)` in WordPress, or directly through property `$post->content_html` in October CMS. Hence, our contract may have 2 functions to resolve the content property:

```php
interface PostObjectPropertyResolverInterface {
  public function getContent($post_id); // = raw content
  public function getHTMLContent($post_id);
}
```

We must also be concerned with abstracting the value that the property can have. For instance, a comment is approved in WordPress if its property `comment_approved` has the value `"1"`. However, other CMSs may have a similar property with value `true`. Hence, the contract should remove any potential inconsistency or ambiguity:

```php
interface CommentObjectPropertyResolverInterface {
  public function isApproved($comment);
}
```

Which is implemented for WordPress like this:

```php
class WPCommentObjectPropertyResolver implements CommentObjectPropertyResolverInterface {
  public function isApproved($comment)
  {
    return $comment->comment_approved == "1";
  }
}
```

### Global state

WordPress sets several variables in the global context, such as `global $post` when querying a single post. Keeping variables in the global context is considered an anti-pattern, since the developer could unintentionally override their values, producing bugs that are difficult to track down. Hence, abstracting our code gives us the chance to implement a better solution.

The approach used by GraphQL by PoP is to add state through class `ApplicationState`, which contains a property to store all variables that our application will need. Adding state is done by setting-up a hook:

```php
class VarsHooks extends AbstractHookSet
{
    protected function init()
    {
        $this->hooksAPI->addAction(
            'ApplicationState:addVars',
            array($this, 'addVars')
        );
    }

    public function addVars($vars_in_array)
    {
        $vars = &$vars_in_array[0];
        $vars['my-var'] == $this->getMyVarValue()
    }
}
```

And then we can read the state like this:

```php
$vars = ApplicationState::getVars();
$myVar = $vars['my-var'];
```

### Translation

GraphQL by PoP provide a service for translation:

```php
interface TranslationAPIInterface
{
  public function __($text, $domain = 'default');
  public function _e($text, $domain = 'default');
}
```

And to use it in our API, we do:

```php
$translationAPI = TranslationAPIFacade::getInstance();
$text = $translationAPI->__("translate this", "my-domain");
```

## Conclusion

Setting-up a CMS-agnostic architecture for our API may be a lengthy process. However, being able to provide an API which works for different frameworks with minimal effort makes it well worth it.
