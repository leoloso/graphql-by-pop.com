# Rapid Iteration on the Schema

Front-end developers enjoy working with GraphQL because they can be autonomous, able to write a query to fetch the data to power their components from the single GraphQL endpoint, without depending on anyone to provide a required endpoint, as was the case with REST. (That is, as long as all resolvers needed to satisfy the totality of the query have already been implemented; otherwise, this may not be true, since someone must still implement those resolvers, and this someone might even belong to a different team, creating some bottlenecks and bureaucracy).

A similar situation happens for creating the GraphQL schema itself: teams must be able to collaborate on a shared, company-wide schema, and do it autonomously, without depending on other teams, as to avoid bureaucracy and bottle-necks, and provide quick iteration.

This guide will exemplify the best strategy to follow when using GraphQL by PoP.

## Managing ownership of the schema elements

The [Principled GraphQL](https://principledgraphql.com/) is a set of best practices for creating, maintaining, and operating a data graph, created by the [Apollo](https://apollographql.com/) team after gathering the needs from thousands of developers. Among its collection of 10 best practices, the 3 from the Integrity Principles section ("Ensuring that the graph is well-defined, stable, and consistent") define how the graph must be created, managed and exposed:

[#1. One Graph](https://principledgraphql.com/integrity#1-one-graph): Your company should have one unified graph, instead of multiple graphs created by each team.

[#2. Federated Implementation](https://principledgraphql.com/integrity#2-federated-implementation): Though there is only one graph, the implementation of that graph should be federated across multiple teams.

[#3. Track the Schema in a Registry](https://principledgraphql.com/integrity#3-track-the-schema-in-a-registry): There should be a single source of truth for registering and tracking the graph.

Principles #1 and #2 establish that the graph is a coordinated effort involving people from different teams, evidencing that creating a GraphQL service requires making not only technical decisions but logistical ones too: how to set-up a company-wide process that enables everyone to contribute to the same graph.

Let's see an example on when different teams may need to collaborate. Let's say that the sales team owns, manages and develops the `Product` type, which currently has the following schema:

```graphql
type Product {
  id: Int
  name: String!
  price: Int!
}
```

Now, a different team, the tutorials team, decides to launch their tutorials at a discounted price, for which they would need to add field `discountedPrice` on the `Product` type (since a tutorial is a product). How can they achieve this? There are several options:

1. **The autonomous option:** since each team owns its services, the tutorials team can create a `TutorialProduct` type which extends from the `Product` type, and add the field under this type.
2. **The delegation option:** the tutorials team can request the sales team to add the field to the `Product` type.
3. **The cross-boundary option:** the tutorials team can directly add the field to the `Product` type.

The Principled GraphQL has a say about this. In [#2. Federated Implementation](https://principledgraphql.com/integrity#2-federated-implementation), it states:

> Each team should be responsible for maintaining the portion of the schema that exposes their data and services

Given this direction, any of the 3 options could be applied, since it is not always evident where a service ends and another one begins. For instance, if the `Product` type should be only owned by the sales team, then, options #1 and #2 would apply. If this type is generic enough that it could be owned by a cross-team team (comprising members from both the sales and tutorial teams), then option #3 could also apply.

None of these options is perfect: we need to analyze their trade-offs, and decide which is the most suitable for our case:

<table>
<thead>
<tr>
<th>&nbsp;</th><th>Trade-off</th>
</tr>
</thead>
<tbody>
<tr>
<th>Autonomous option</th><td>A field <code>discountedPrice</code> is generic enough that it could make sense to add it to the <code>Product</code> type. For instance, if the workshops team also needs to access a field <code>discountedPrice</code> for their workshops (another type of product) and they need to create a new <code>WorkshopProduct</code> extending <code>Product</code> to add it, field <code>discountedPrice</code> will live in several types, leading to duplicated code, breaking the DRY (Don't Repeat Yourself) principle and introducing the possibility of bugs.</td>
</tr>
<tr>
<th>Delegation option</th><td>It is bureaucratic and may create bottlenecks. For instance, if there is nobody from the sales team available to do the work demanded by the tutorials team, then the schema may not be updated in time. In addition, it creates overhead from the communication needed across teams (holding meetings to explain the work, sending emails, etc).</td>
</tr>
<tr>
<th>Cross-boundary option</th><td>Knowing who owns a specific service is more blurry, less thoroughly defined. It requires better documentation, to state which person implemented a certain field (this one person from the sales team? or that one from the tutorials team? or who?)</td>
</tr>
</tbody>
</table>

From these 3 options, the 3rd one, the cross-boundary option, is the most appealing one, because it enables to iterate quickly to upgrade the schema by avoiding bottlenecks on inter-team dependencies (as the 2nd option does), while keeping the schema DRY and lean (unlike the 1st option). Initially, it would seem this option is the least suitable one concerning the federation principle ("Each team should be responsible for maintaining the portion of the schema that exposes their data and services"); however, this issue can be solved through some clever architecture.

Following in this guide, we will deal with how GraphQL by PoP enables people belonging to different teams to contribute to the same schema without overriding each other's work and without setting up a bureaucratic barrier to contribution, while at the same time giving them ownership over their own portion of the schema.

## Exploring ways to decentralize the creation of the schema

When creating the GraphQL schema, teams must be allowed to have ownership of their implementations. However, as we've seen with the example earlier on, the part of the schema that requires ownership is not pre-defined in advance: it could comprise a set of types, a specific type (`Product`) or even a single field within a type (`discountedPrice`).

Moreover, different teams could have different requirements for the same field. For instance, concerning the `discountedPrice` field belonging to the `Product` type, while the tutorials team provides a 10% discount, the workshops team may provide a 20% discount. Hence, resolution of the field `discountedPrice` must be dynamic, dependent on the context.

Please notice that we do not want to rename field `discountedPrice` to both `discountedPriceForTutorials` and `discountedPriceForWorkshops` for the 2 different situations, because this makes the schema much more verbose, and there is no need to differentiate between discounts in the signature of the field itself; after all, the concept of the discount is the same for all products, so they should all be named as `discountedPrice` (the product is passed as an argument to the resolver; that will be the differentiating factor, on runtime).

For our first iteration, we will create a resolver function that, as demonstrated in the JavaScript code below, resolves differently for different types of products (we will use JavaScript to understand why the standard approach is not optimal, and then PHP to demonstrate the solution later on):

```javascript
const resolvers = {
  Product: {
    discountedPrice: function(product, args) {
      if (product.type == "tutorial") {
        return getTutorialDiscountedPrice(product, args);
      }
      if (product.type == "workshop") {
        return getWorkshopDiscountedPrice(product, args);
      }
      return getDefaultDiscountedPrice(product, args);
    }
  }
}
```

In this scenario, the tutorials team can own function `getTutorialDiscountedPrice`, the workshop team will own function `getWorkshopDiscountedPrice`, and the sales team will own function `getDefaultDiscountedPrice`. The line of code `if (product.type == "tutorial") {` should be owned by the tutorials team too, but it currently falls under ownership of the sales team. Let's fix that.

For our next iteration, we can create a `combineResolvers` function which combines resolvers from different teams. Then, each team provides its own resolver implementation for its product type, like this:

```javascript
// Provided by the tutorials team
const tutorialResolvers = {
  Product: {
    discountedPrice: getTutorialDiscountedPrice,
  }
}

// Provided by the workshop team
const workshopResolvers = {
  Product: {
    discountedPrice: getWorkshopDiscountedPrice,
  }
}

// Provided by the sales team
const defaultResolvers = {
  Product: {
    discountedPrice: getDefaultDiscountedPrice,
  }
}
```

And they are all combined into one:

```javascript
// Provided by the sales team
const combinedResolvers = combineResolvers(
  {
    tutorial: tutorialResolvers,
    workshop: workshopResolvers,
    default: defaultResolvers,
  }
)
const resolvers = {
  Product: {
    discountedPrice: function(product, args) {
      const productResolvers = combinedResolvers[product.type] || combinedResolvers["default"];
      return productResolvers.Product.discountedPrice(product, args);
    }
  }
}
```

This second iteration looks better than the first one, but it still has the same basic problem: the resolver delegator, which is the object combining the resolvers and finding the appropriate resolver for every product type, must have the knowledge that implementations for tutorials and workshops exist; since this piece of code is maintained by the sales team, it requires some level of bureaucracy and inter-team dependency that we would rather do away with.

A bit more work still needs to be done.

## Subscribing resolvers

The third (and final) iteration involves the combination of two design patterns:

- The [publish-subscribe design pattern](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern), to decouple the resolver delegator (the "publisher", owned by the sales team) from the actual resolvers (the "subscribers", owned by the tutorials and workshop teams).
- The [chain-of-responsibility design pattern](https://en.wikipedia.org/wiki/Chain-of-responsibility_pattern), to have the resolver delegator ask every product resolver if they can handle the product or not, one by one in the chain of resolvers until finding the appropriate one.

Each resolver must provide a priority number when being subscribed to the chain, which determines their position on the chain: the higher the priority, the sooner they will be asked if they can handle the product. Then, the `"default"` resolver must be placed with the lowest priority, and it must indicate that it handles products of all types.

GraphQL by PoP implements this solution, so now we switch to PHP to demonstrate examples of code.

## Implementing the strategy

The only field that is mandatory is the `id` field. Otherwise, types are initially created empty, without any field! The fields will all be provided through resolvers, which attach themselves to their intended type.

For our example, we define the `Product` type as a `TypeResolver` class, implementing only the name of the type (and some other information, omitted in the code below) and how it resolves its ID:

```php
class ProductTypeResolver extends AbstractTypeResolver
{
  public function getTypeName(): string
  {
    return 'Product';
  }

  public function getID(Product $product)
  {
    return $product->ID;
  }
}
```

We then implement instances of `FieldResolver` classes, which attach fields to a specific type. The sales team provides an initial resolver implementing all the basic fields, such as `name` and `price`, and the default implementation for `discountedPrice`, giving a discount of 5%:

```php
namespace MyCompany\Sales;

class ProductFieldResolver extends AbstractDBDataFieldResolver
{
  /**
   * Attach the fields to the Product type
   */
  public static function getClassesToAttachTo(): array
  {
    return [ProductTypeResolver::class];
  }

  /**
   * Fields to implement
   */
  public static function getFieldNamesToResolve(): array
  {
    return [
      'name',
      'price',
      'discountedPrice',
    ];
  }

  /**
   * Priority with which it is attached to the chain.
   * Priority 0 => added last
   */
  public static function getPriorityToAttachClasses(): ?int
  {
    return 0;
  }

  /**
   * Always process everything
   */
  public function resolveCanProcess(Product $product, string $fieldName, array $fieldArgs): bool
  {
    return true;
  }

  /**
   * Implementation of the fields
   */
  public function resolveValue(Product $product, string $fieldName, array $fieldArgs)
  {
    switch ($fieldName) {
      case 'name':
        return $product->name;
      case 'price':
        return $product->price;
      case 'discountedPrice':
        // By default, provide a discount of 5%
        return $product->price * 0.95;
    }

    return null;
  }
}
```

Now, the tutorials team (and, likewise, the workshops team) can implement their own resolver, which is used only whenever the product is of type `"tutorial"`:

```php
namespace MyCompany\Tutorials;

class ProductFieldResolver extends AbstractDBDataFieldResolver
{
  /**
   * Attach the fields to the Product type
   */
  public static function getClassesToAttachTo(): array
  {
    return [ProductTypeResolver::class];
  }

  /**
   * Fields to implement
   */
  public static function getFieldNamesToResolve(): array
  {
    return [
      'discountedPrice',
    ];
  }

  /**
   * Priority with which it is attached to the chain.
   * Priority 10 => it is placed in the chain before the default resolver
   */
  public static function getPriorityToAttachClasses(): ?int
  {
    return 10;
  }

  /**
   * Process products of type "tutorial"
   */
  public function resolveCanProcess(Product $product, string $fieldName, array $fieldArgs): bool
  {
    return $product->type == "tutorial";
  }

  /**
   * Implementation of the fields
   */
  public function resolveValue(Product $product, string $fieldName, array $fieldArgs)
  {
    switch ($fieldName) {
      case 'discountedPrice':
        // Provide a discount of 10%
        return $product->price * 0.90;
    }

    return null;
  }
}
```

## Rapid iteration

The beauty of this strategy is that the schema can be dynamic, changing its shape and attributes depending on the context. All it takes is to subscribe an extra resolver to handle a special situation, and pluck it out when it's not needed anymore. This allows for rapid iteration and bug fixing (such as implementing a special resolver just to handle requests from the client who is affected by the bug), without fearing side-effects somewhere else in the code.

For instance, following our earlier example, the tutorials team can override the implementation of the `discountedPrice` field to provide a bigger discount just for this weekend's flash deal, and avoid having to bother their colleagues from the sales team on a Saturday night:

```php
namespace MyCompany\Tutorials;

class FlashDealProductFieldResolver extends ProductFieldResolver
{
  /**
   * Priority with which it is attached to the chain.
   * Priority 20 => it is placed at the very beginning!
   */
  public static function getPriorityToAttachClasses(): ?int
  {
    return 20;
  }

  /**
   * Process tutorial products just for this weekend
   */
  public function resolveCanProcess(Product $product, string $fieldName, array $fieldArgs): bool
  {
    $now = new DateTime("now");
    $dealStart = new DateTime("2020-03-28");
    $dealEnd = new DateTime("2020-03-30");
    return $now >= $dealStart && $now <= $dealEnd && parent::resolveCanProcess($product, $fieldName, $fieldArgs);
  }

  /**
   * Implementation of the fields
   */
  public function resolveValue(Product $product, string $fieldName, array $fieldArgs)
  {
    switch ($fieldName) {
      case 'discountedPrice':
        // Provide a discount of 30%
        return $product->price * 0.70;
    }

    return null;
  }
}
```
