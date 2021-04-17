# Sending a Localized Newsletter, User by User

This guide will make use of the [PQL](../docs/extended/pql) to satisfy an extensive functionality in a single query.

Let's create an automated email-sending service to distribute blog posts. All the data comes from 3 separate sources:

1. A REST API endpoint returning the subscribers (pairs of `email` and `language` fields) to the newsletter, provided by Mailchimp.
2. A REST API endpoint with all your customer information, including their `email` and `name` fields, provided by company's CRM.
3. The blog posts published in your website.

The email needs to be customized for each person:

1. Greeting them personally by name
2. Translating the content of the email to their own language. Using Google Translate is acceptable.

## Steps to follow

Our service will follow the following steps:

1. Fetch the list of newsletter subscribers using the first API endpoint, getting their `email` and `language` fields
2. For every recipient in this list add the `name` field, fetching it from the second API endpoint by using the common `email` field as ID.

By then, we will have the all the user data consolidated in a single list, containing fields `name`, `email` and `language`. Let's continue.

3. Retrieve the data for the specified blog post: `content` and `date`
4. Calculate all the different languages that the post needs be translated to
5. Translate the post to each language

By then, in addition to the user data, we will also have the post data, translated to all required languages. Next, we need to craft the customized email content for each user.

6. Iterate the list of users, and for each add a new field `emailContent` containing:
  a. The greeting message "Hi {name}, this is our our blog post from {date}", translated to the user's language
  b. The blog post content that had been translated to the user's language

By then, we have all the data: Rows of `email` and `emailContent` fields. We will then be able to send the email.

7. Iterate the list, and send the email

## Final query

This query does the magic:

```less
post($postId)@post.
  content|
  date(d/m/Y)@date,
getJSON("https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions")@userList|
arrayUnique(
  extract(
    getSelfProp(%self%, userList),
    lang
  )
)@userLangs|
extract(
  getSelfProp(%self%, userList),
  email
)@userEmails|
arrayFill(
  getJSON(
    sprintf(
      "https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s",
      [arrayJoin(
        getSelfProp(%self%, userEmails),
        "%26emails[]="
      )]
    )
  ),
  getSelfProp(%self%, userList),
  email
)@userData;

post($postId)@post<
  copyRelationalResults(
    [content, date],
    [postContent, postDate]
  )
>;

getSelfProp(%self%, postContent)@postContent<
  translate(
    from: en,
    to: arrayDiff([
      getSelfProp(%self%, userLangs),
      [en]
    ])
  ),
  renameProperty(postContent-en)
>|
getSelfProp(%self%, userData)@userPostData<
  forEach<
    applyFunction(
      function: arrayAddItem(
        array: [],
        value: ""
      ),
      addArguments: [
        key: postContent,
        array: %value%,
        value: getSelfProp(
          %self%,
          sprintf(
            postContent-%s,
            [extract(%value%, lang)]
          )
        )
      ]
    ),
    applyFunction(
      function: arrayAddItem(
        array: [],
        value: ""
      ),
      addArguments: [
        key: header,
        array: %value%,
        value: sprintf(
          string: "<p>Hi %s, we published this post on %s, enjoy!</p>",
          values: [
            extract(%value%, name),
            getSelfProp(%self%, postDate)
          ]
        )
      ]
    )
  >
>;

getSelfProp(%self%, userPostData)@translatedUserPostProps<
  forEach(
    if: not(
      equals(
        extract(%value%, lang),
        en
      )
    )
  )<
    advancePointerInArray(
      path: header,
      appendExpressions: [
        toLang: extract(%value%, lang)
      ]
    )<
      translate(
        from: en,
        to: %toLang%,
        oneLanguagePerField: true,
        override: true
      )
    >
  >
>;

getSelfProp(%self%,translatedUserPostProps)@emails<
  forEach<
    applyFunction(
      function: arrayAddItem(
        array: [],
        value: []
      ),
      addArguments: [
        key: content,
        array: %value%,
        value: concat([
          extract(%value%, header),
          extract(%value%, postContent)
        ])
      ]
    ),
    applyFunction(
      function: arrayAddItem(
        array: [],
        value: []
      ),
      addArguments: [
        key: to,
        array: %value%,
        value: extract(%value%, email)
      ]
    ),
    applyFunction(
      function: arrayAddItem(
        array: [],
        value: []
      ),
      addArguments: [
        key: subject,
        array: %value%,
        value: "PoP API example :)"
      ]
    ),
    sendByEmail
  >
>
```

Click <a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,%20userList),lang))@userLangs|extract(getSelfProp(%self%,%20userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,%20userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,%20userList),email)@userData;post($postId)@post%3CcopyRelationalResults([content,%20date],[postContent,%20postDate])%3E;getSelfProp(%self%,%20postContent)@postContent%3Ctranslate(from:%20en,to:%20arrayDiff([getSelfProp(%self%,%20userLangs),[en]])),renameProperty(postContent-en)%3E|getSelfProp(%self%,%20userData)@userPostData%3CforEach%3CapplyFunction(function:%20arrayAddItem(array:%20[],value:%20%22%22),addArguments:%20[key:%20postContent,array:%20%value%,value:%20getSelfProp(%self%,sprintf(postContent-%s,[extract(%value%,%20lang)]))]),applyFunction(function:%20arrayAddItem(array:%20[],value:%20%22%22),addArguments:%20[key:%20header,array:%20%value%,value:%20sprintf(string:%20%22%3Cp%3EHi%20%s,%20we%20published%20this%20post%20on%20%s,%20enjoy!%3C/p%3E%22,values:%20[extract(%value%,%20name),getSelfProp(%self%,%20postDate)])])%3E%3E;getSelfProp(%self%,%20userPostData)@translatedUserPostProps%3CforEach(if:%20not(equals(extract(%value%,%20lang),en)))%3CadvancePointerInArray(path:%20header,appendExpressions:%20[toLang:%20extract(%value%,%20lang)])%3Ctranslate(from:%20en,to:%20%toLang%,oneLanguagePerField:%20true,override:%20true)%3E%3E%3E;getSelfProp(%self%,translatedUserPostProps)@emails%3CforEach%3CapplyFunction(function:%20arrayAddItem(array:%20[],value:%20[]),addArguments:%20[key:%20content,array:%20%value%,value:%20concat([extract(%value%,%20header),extract(%value%,%20postContent)])]),applyFunction(function:%20arrayAddItem(array:%20[],value:%20[]),addArguments:%20[key:%20to,array:%20%value%,value:%20extract(%value%,%20email)]),applyFunction(function:%20arrayAddItem(array:%20[],value:%20[]),addArguments:%20[key:%20subject,array:%20%value%,value:%20%22PoP%20API%20example%20:)%22]),sendByEmail%3E%3E">here to view the query results</a>.

In the rest of this guide, we will learn how this query came to be.

## Fetching the blog post

We can query field `posts` to find the latest published blog post:

```less
posts(
  limit:1,
  order:date|DESC
).
  id|
  title|
  url
```

[<a href="https://newapi.getpop.org/api/graphql/?query=posts(limit:1,order:date|DESC).id|title|url">View query results</a>]

::: tip
Use `,` to separate field arguments, each of them in `key:value` format

Use `.` to fetch nested properties from the object

Use `|` to fetch several fields from an object
:::

This query retrieves an array of posts. To operate with a single post, we can better use field `post`, which receives the ID by argument:

```less
post(
  id:1
).
  id|
  title|
  url
```

[<a href="https://newapi.getpop.org/api/graphql/?query=post(id:1).id|title|url">View query results</a>]

Fields argument names are optional. The query above is similar to the one below, which skips fieldArg name `"id"`:

```less
post(1).
  id|
  title|
  url
```

[<a href="https://newapi.getpop.org/api/graphql/?query=post(1).id|title|url">View query results</a>]

We can pass the ID through a variable, which is resolved through a URL parameter under the variable name. For the query below, we add param `postId=1` to the URL:

```less
post($postId).
  id|
  title|
  url
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId).id|title|url">View query results</a>]

::: tip
Use `$` to define a variable
:::

Finally, we add an alias to make the response more compact:

```less
post($postId)@post.
  id|
  title|
  url
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.id|title|url">View query results</a>]

::: tip
Use `@` to define an alias
:::

## Fetching the blog post (again)

The previous queries were demonstrating how to fetch data for the post. Now that we know, let's fetch the data needed for our use case: the `content` and `date` fields:

```less
post($postId)@post.
  content|
  date(d/m/Y)@date
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date">View query results</a>]

::: tip
Use `[...]` to define an array and `,` to separate its items. The format for each item is either `key:value` or `value` (making the key numeric)
:::

## Fetching the list of newsletter subscribers

To fetch the list of newsletter subscribers from a REST endpoint, we can use field `getJSON` and specify the URL:

```less
getJSON("https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions")@userList
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList">View query results</a>]

::: tip
At any time, you can review the documentation for the fields/directives employed in this guide, by querying the [fullSchema](https://newapi.getpop.org/api/graphql/?query=fullSchema).
:::

## Calculating the list of unique languages

The previous list contains pairs of `email` and `lang` fields. Next, we calculate the list of unique languages, as to translate the blog post to all those languages. This task will be composed of two steps.

First, we extract the field `lang` from the array through field `extract` (which takes an array and a path):

```less
getJSON("https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions")@userList|
extract(
  getSelfProp(%self%, userList),
  lang
)
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|extract(getSelfProp(%self%,userList),lang)">View query results</a>]

::: tip
Expression `%self%` contains an object which has a pointer to all data retrieved for the current object. Accessed through function `getSelfProp`, it enables to access this data, under the property name or alias under which it was stored.
:::

Then, we apply operator `arrayUnique`, and assign the results under alias `userLangs`:

```less
getJSON("https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions")@userList|
arrayUnique(
  extract(
    getSelfProp(%self%, userList),
    lang
  )
)@userLangs
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,userList),lang))@userLangs">View query results</a>]

## Retrieving the rest of the user information

So far, we have a list of pairs of `email` and `lang` fields stored under property `userList`. Next, using `email` as the common identifier for the data, we query the REST endpoint from the CRM to fetch the remaining user information: the `name` field. This task is composed of several steps.

First, we extract the list of all emails from `userList`, and place them under `userEmails`:

```less
extract(
  getSelfProp(%self%, userList),
  email
)@userEmails
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,userList),lang))@userLangs|extract(getSelfProp(%self%,userList),email)@userEmails">View query results</a>]

Our CRM exposes a REST endpoint which allows to filter users by email, like this:

```less
/users/api/rest/?emails[]=email1&emails[]=email2&...
```

Then, we must generate the endpoint URL by converting the array of emails into a string with the right format, and then executing `getJSON` on this URL. Let's do that.

To generate the URL, we use a combination of `sprintf` and `arrayJoin`:

```less
sprintf(
  "https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s",
  [arrayJoin(
    getSelfProp(%self%, userEmails),
    "%26emails[]="
  )]
)
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,userList),lang))@userLangs|extract(getSelfProp(%self%,userList),email)@userEmails|sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,userEmails),%22%26emails[]=%22)])">View query results</a>]

::: tip
The string can't have character `"&"` in it, or it will create trouble when appending it in the URL param. Instead, we must use its code `"%26"`
:::

::: tip
The PoP API (over which GraphQL by PoP is based) can also satisfy REST, through the [REST API package](https://github.com/leoloso/PoP/tree/master/layers/API/packages/api-rest). That's the case with the [REST endpoint used in this guide](https://newapi.getpop.org/users/api/rest/).
:::

Having generated the URL, we execute `getJSON` on it:

```less
getJSON(
  sprintf(
    "https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s",
    [arrayJoin(
      getSelfProp(%self%,userEmails),
      "%26emails[]="
    )]
  )
)
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,userList),lang))@userLangs|extract(getSelfProp(%self%,userList),email)@userEmails|getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,userEmails),%22%26emails[]=%22)]))">View query results</a>]

Finally, we must combine the 2 lists into one, generating a new list containing all user fields: `name`, `email` and `lang`. To achieve this, we use function `arrayFill`, which, given 2 arrays, returns an array containing the entries from each of them where the index (in this case, property `email`) is the same, and we save the results under property `userData`:

```less
arrayFill(
  getJSON(
    sprintf(
      "https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s",
      [arrayJoin(
        getSelfProp(%self%, userEmails),
        "%26emails[]="
      )]
    )
  ),
  getSelfProp(%self%, userList),
  email
)@userData
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,userList),lang))@userLangs|extract(getSelfProp(%self%,userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,userList),email)@userData">View query results</a>]

## Translating the post content to all different languages

By now we have collected the post data, saved under properties `content` and `date`, and all the user data, saved under property `userData`. It is time to mix these pieces of data together, for which we need to have all data at the same level. However, if we pay attention to the <a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,userList),lang))@userLangs|extract(getSelfProp(%self%,userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,userList),email)@userData">latest query</a>, we can notice that they are under 2 different paths:

- `userData` is under `/` (root)
- `content` and `date` are under `/post/`

Hence, we must either move `userData` down to the `post` level, or move `content` and `date` up to the root level. Due to GraphQL by PoP's [dataloading engine architecture](../docs/architecture/dataloading-engine), only the latter option is feasible. Let's see why.

## Understanding how GraphQL by PoP loads data

When resolving the query to load data, the dataloader processes all elements from a same entity all at the same time, as to load all their data in a single query and completely avoiding the N+1 problem. Then, let's imagine that we have the following query:

```less
posts.
  title|
  author.
    name
```

Let's say this query returns 10 posts and, for each post, it retrieves its author, and some authors have 2 or more posts, so that the query retrieves 10 posts but only 4 unique authors. The dataloading mechanism will first process all 10 posts, fetching all their required data (properties `title` and `author`), and then it will fetch all data for all 4 authors (property `name`).

If posts with IDs `1` and `2` both have author with ID `5`, and we copy a property downwards in the graph, post `1` will first copy its properties down to author `5`, then immediately post `2` will copy its own properties down to author `5`, overriding the properties set by post `1`. By the time the dataloading mechanism reaches the users level, author `5` will only have the data from posts `2`. This situation could be avoided by copying the properties the post ID in the user object, as to not override previous values. However, while the post entity knows that it is loading data for its author, the author entity doesn't know who loaded it (the graph direction is only top-to-bottom). Hence, the post entiy can fetch properties from the author entity and store them under theauthor ID (which the post knows about), but the other way around doesn't work.

That's why we can only copy properties upwards. In this case, the post's `content` and `date` properties must be copied upwards, to the root.

We can now go back to the query.

## Translating the post content to all different languages (again)

To copy the `content` and `date` properties upwards to the root level, we use directive `<copyRelationalResults>`. This directive is applied on the `root` entity, and it receives these inputs:

1. The name of the relational property, in this case `post($postId)@post`
2. The name of the properties to copy, in this case `content` and `date`
3. (Optional) The name under which to copy the properties, in this case `postContent` and `postDate`

```less
self.
  post($postId)@post<
    copyRelationalResults(
      [content, date],
      [postContent, postDate]
    )
  >
```

[View query results: <a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,userList),lang))@userLangs|extract(getSelfProp(%self%,userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,userList),email)@userData,self.post($postId)@post%3CcopyRelationalResults([content,%20date],[postContent,%20postDate])%3E">GraphQL output</a>, <a href="https://newapi.getpop.org/api/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,userList),lang))@userLangs|extract(getSelfProp(%self%,userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,userList),email)@userData,self.post($postId)@post%3CcopyRelationalResults([content,%20date],[postContent,%20postDate])%3E">PoP native output</a>]

That this works is not evident at all. Moreover, you need to click on link <a href="https://newapi.getpop.org/api/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,userList),lang))@userLangs|extract(getSelfProp(%self%,userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,userList),email)@userData,self.post($postId)@post%3CcopyRelationalResults([content,%20date],[postContent,%20postDate])%3E">PoP native output</a> to see the results, and appreciate that the data was indeed copied one level up. The other link, <a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,userList),lang))@userLangs|extract(getSelfProp(%self%,userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,userList),email)@userData,self.post($postId)@post%3CcopyRelationalResults([content,%20date],[postContent,%20postDate])%3E">GraphQL output</a>, would seem to not work... it also does, but the results are not being output!

I'll explain why this is so: how data is loaded (once again) and how directives work.

## What are directives and how do they work

Directives are sheer power: They can affect execution of the query in any desired way. They are as close to the bare metal of the dataloading engine as possible. They have access to all previously loaded data and can modify it, remove it, etc.

Directives help regulate the lifecycle of loading data in the API, by validating and resolving the fields on the objects and adding these results on a directory with all results from all objects, from which the graph is drawn.

The dataloading engine relies on the following special directives to implement core functionality:

1. `<setSelfAsExpression>`, which defines the "expression" `%self%` which allows to retrieve previously loaded data
2. `<validate>`, which validates that the provided data matches against its definition on the schema and, if it doesn't, removes it and shows a error message
3. `<resolveValueAndMerge>`: it resolves all the fields in the query and merges their response into the final database object

These 3 directives are executed at the beginning of their own slots:

1. Front: `<setSelfAsExpression>`
2. Middle: `<validate>`
3. Back: `<resolveValueAndMerge>`

Every directive we create must indicate in which from these 3 slots it must be placed and executed. For instance, directives `<skip>` and `<include>` (mandatory ones in GraphQL) must be placed in the `"Middle"` slot, that is after fields are validated but before resolved; directive `<copyRelationalProperties>` must be placed in the `"Back"` slot, since it requires the data to be resolved before it can copy it somewhere else.

## Revisiting how GraphQL by PoP loads data

Let's examine the query above together with the previous query bit that loads properties `content` and `date`:

```less
post($postId)@post.
  content|
  date(d/m/Y)@date,
self.
  post($postId)@post<
    copyRelationalResults(
      [content, date],
      [postContent, postDate]
    )
  >
```

[View query results: <a href="https://newapi.getpop.org/api/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,self.post($postId)@post%3CcopyRelationalResults([content,%20date],[postContent,%20postDate])%3E">PoP native output</a>]

We can see that these 2 queries are separated using `,` instead of `|`, and that there is an entity `self` after which we repeat the same field `post($postId)@post`, and only then we apply directive `<copyRelationalResults>`. Why is this so?

Field `self` is an identity field: It returns the same object currently being operated on. In this case, it returns once again the entity `root`. (Doing `self` returns the `root` object, doing `post.self` returns the same `post` object, doing `post.author.self` returns the `user` object, and so on.)

As mentioned before, the dataloader loads data in stages, in which all data for a same type of entity (all posts, all users, etc) is fetched all together. Using `,` to separate a query makes it start iterating from the root all over again. Then, when processing this query...

```less
post,
self.post
```

...the entites being handled by the dataloader are these ones, in this exact order: `root` (the first one, always), `posts` (loaded by query `posts`, before the `,`), `root` (the first one again, after `,`), `root` again (loaded by doing `self` on the `root` object) and then `posts` again (by doing `self.post`).

As can be seen, the `self` field then enables to go back to an already loaded object, and keep loading properties on it. As such, it allows to delay loading certain data until a later iteration of the dataloader, to make sure a certain condition is satisfied.

That is exactly why we need it: Directive `<copyRelationalResults>` copies a property one level up, but it is applied on the `root` object and, by the time it is executed, the properties to copy must exist on the `post` object. Hence the iteration: `root` loads the `post`, the `post` loads its properties, then back to `root` copies the properties from the `post` to itself.

## Concerning the native data structure used in PoP (hint: it's not a graph!)

We saw in the query above...

```less
self.
  post($postId)@post<
    copyRelationalResults(
      [content, date],
      [postContent, postDate]
    )
  >
```

... that we need to view the query results in <a href="https://newapi.getpop.org/api/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,userList),lang))@userLangs|extract(getSelfProp(%self%,userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,userList),email)@userData,self.post($postId)@post%3CcopyRelationalResults([content,%20date],[postContent,%20postDate])%3E">PoP native output</a> to see that the directive `<copyRelationalResults>` worked, and that the <a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,userList),lang))@userLangs|extract(getSelfProp(%self%,userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,userList),email)@userData,self.post($postId)@post%3CcopyRelationalResults([content,%20date],[postContent,%20postDate])%3E">GraphQL output</a> doesn't mirror the changes. What is going on?

First of all: the PoP API does NOT use a graph to represent the data model. Instead, it uses components.

However (and this is the fact that makes the magic happen) a graph does naturally arise from the relationships among the database entities defined through components. Hence, the graph can be easily generated from the component-based architecture of the API, and the GraphQL implementation is simply an application among many. For instance, if replacing the `/graphql` bit in the URL with `/rest`, we obtain the equivalent REST endpoint (as demonstrated for the REST API endpoint to fetch the user data); if we replace it with `/xml`, we access the data in XML format (<a href="https://newapi.getpop.org/api/xml/?postId=1&query=getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|extract(getSelfProp(%self%,userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,userList),email)@userData">example</a>).

The real, underlying data structure in PoP is simply a set of relationships across database objects, which matches directly with how an SQL database works: Tables containing rows of data entries, and relationships among entities defined through IDs. That is exactly what you see when you remove the `/graphql` bit from the URL, from any URL (<a href="https://newapi.getpop.org/api/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,self.post($postId)@post%3CcopyRelationalResults([content,%20date],[postContent,%20postDate])%3E">example</a>). That's the PoP native format. Looking at is like looking at the code in the matrix.

Finally, we can provide an explanation of why the query results in <a href="https://newapi.getpop.org/api/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,userList),lang))@userLangs|extract(getSelfProp(%self%,userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,userList),email)@userData,self.post($postId)@post%3CcopyRelationalResults([content,%20date],[postContent,%20postDate])%3E">PoP native output</a> for directive `<copyRelationalResults>` are shown, but not in the <a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,userList),lang))@userLangs|extract(getSelfProp(%self%,userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,userList),email)@userData,self.post($postId)@post%3CcopyRelationalResults([content,%20date],[postContent,%20postDate])%3E">GraphQL output</a>: The PoP native format displays all the data it has accumulated, thereby there it is. The GraphQL format, though, doesn't show it because the properties under which the data are copied to, `postContent` and `postDate`, are not being queried. If we do (adding 2 levels of `self` to make sure we query the data after it has been copied), the data then does appear in the response:

```less
self.
  post($postId)@post<
    copyRelationalResults(
      [content, date],
      [postContent, postDate]
    )
  >,
self.
  self.
    getSelfProp(%self%, postContent)|
    getSelfProp(%self%, postDate)
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,userList),lang))@userLangs|extract(getSelfProp(%self%,userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,userList),email)@userData,self.post($postId)@post%3CcopyRelationalResults([content,%20date],[postContent,%20postDate])%3E,self.self.getSelfProp(%self%,%20postContent)|getSelfProp(%self%,%20postDate)">View query results</a>]

::: tip
In the <a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,userList),lang))@userLangs|extract(getSelfProp(%self%,userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,userList),email)@userData,self.post($postId)@post%3CcopyRelationalResults([content,%20date],[postContent,%20postDate])%3E,self.self.getSelfProp(%self%,%20postContent)|getSelfProp(%self%,%20postDate)">response for the GraphQL query above</a>, properties appear under path `/self.self`, and not directly under `/`. However, they are the same entity `root` (`self` returns itself, on whichever object it is applied to). This is, once again, easier to visualize in the <a href="https://newapi.getpop.org/api/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,userList),lang))@userLangs|extract(getSelfProp(%self%,userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,userList),email)@userData,self.post($postId)@post%3CcopyRelationalResults([content,%20date],[postContent,%20postDate])%3E,self.self.getSelfProp(%self%,%20postContent)|getSelfProp(%self%,%20postDate)">PoP native format</a>, removing the `/graphql` bit from the URL
:::

## Translating the post content to all different languages (again x2)

We have by now properties `postContent`, `postDate` and `userData` all loaded at the root level, which is all the information we need to work with. From now on, being at the root level we can execute all the operators and directives necessary to accomplish our goals.

Next, we apply directive `<translate>` on `postContent`, which will call the Google Translate API to translate the text. Why is it a directive, instead of an operator?

## Differences between directives and operators

When coding a query, it may be sometimes unclear what is better, if to use an operator or use a directive. After all, the two of them can both execute functionality (such as sending an email, or translating a piece of text). For instance, we could do either `posts.translate(title)` (operator) or `posts.title<translate>` (directive). So, when to use one or the other?

When executing functionality, the main difference between these 2 is the following:

An operator is a field. A field computes a value from a single object; every field is executed independently of each other field, and it is executed once per object. For instance, for the following query...

```less
post.
  title
```

... the field `title` is executed once on each post object. If there are 10 posts, then `title` is executed 10 times, once in each. And they see no history: given a set of inputs, they just return their output. They don't have really a lot of logic, or complexity.

Since operators are fields, we have the same situation: For the following query...

```less
post.
  sprintf(
    "Post title is",
    [title()]
  )
```

... the `sprintf` operator is executed once in each `title` property, which is executed 10 times, once per post, all independently from each other, and oblivious of each other.

Directives work in a different way: They are executed just once on the set of affected objects, and on the set of affected properties for each object, and they can modify the value of these properties for each of the objects. For instance, for the following query:

```less
posts.
  title<
    applyFunction(...)
  >|
  content<
    applyFunction(...)
  >
```

... the directive `<applyFunction>` will be executed only once (even if it appears twice in the query, once for each field), receiving a set of posts and properties `title` and `content` for each post.

Hence, we must use directives when:

- It is more efficient to batch execute operations. For instance, a `<sendByEmail>` directive sending 10 emails at once is more effective than a `sendByEmail()` operator sending 10 emails independently, and making 10 SMTP connections; a `<translate>` directive can make a single call to the translation API to translate all strings at once, which is more efficient than calling `translate()` on 10 strings which will make 10 calls to the translation API.
- We need low-level functionality, such as: modifying or deleting previous data, copying data to another object, iterating through a series of properties to apply a function to each of them, etc.

## Translating the post content to all different languages (again x3)

Now we know why we are doing `content<translate>` instead of `translate(content)`. Let's continue.

The following query takes care of translating the post content to all the different unique languages gathered earlier on from the user data:

```less
self.
  self.
    getSelfProp(%self%, postContent)@postContent<
      translate(
        from:en,
        to:arrayDiff([
          getSelfProp(%self%, userLangs),
          [en]
        ])
      )
    >
```

[View query results: <a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,%20userList),lang))@userLangs|extract(getSelfProp(%self%,%20userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,%20userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,%20userList),email)@userData,self.post($postId)@post%3CcopyRelationalResults([content,%20date],[postContent,%20postDate])%3E|self.getSelfProp(%self%,%20postContent)@postContent%3Ctranslate(from:%20en,to:%20arrayDiff([getSelfProp(%self%,%20userLangs),[en]]))%3E">GraphQL output</a> (changes not yet visible), <a href="https://newapi.getpop.org/api/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,%20userList),lang))@userLangs|extract(getSelfProp(%self%,%20userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,%20userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,%20userList),email)@userData,self.post($postId)@post%3CcopyRelationalResults([content,%20date],[postContent,%20postDate])%3E|self.getSelfProp(%self%,%20postContent)@postContent%3Ctranslate(from:%20en,to:%20arrayDiff([getSelfProp(%self%,%20userLangs),[en]]))%3E">PoP native output</a> (changes already there)]

We can see that the `<translate>` directive takes 2 inputs through directive arguments: the `from` language (English) and the `to` language or array of languages. Since we want to translate to many languages, we provide this list, but first removing English from the list (through operator `arrayDiff`). Otherwise, the Google Translate API throws an error when attempting to translate from English to English.

The `<translate>` directive did not override the original property on the object, but instead created additional ones which append the language code. Hence, by now, we have the following entries with the post content: `postContent` (original in English), `postContent-es` (Spanish), `postContent-fr` (French) and `postContent-de` (German). To homogenize it, we rename property `postContent` to `postContent-en` through directive `<renameProperty>`:

```less
self.
  self.
    getSelfProp(%self%,postContent)@postContent<
      translate(
        from:en,
        to:arrayDiff([
          getSelfProp(%self%, userLangs),
          [en]
        ])
      ),
      renameProperty(postContent-en)
    >
```

[View query results: <a href="https://newapi.getpop.org/api/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,%20userList),lang))@userLangs|extract(getSelfProp(%self%,%20userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,%20userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,%20userList),email)@userData,self.post($postId)@post%3CcopyRelationalResults([content,%20date],[postContent,%20postDate])%3E|self.getSelfProp(%self%,%20postContent)@postContent%3Ctranslate(from:%20en,to:%20arrayDiff([getSelfProp(%self%,%20userLangs),[en]])),renameProperty(postContent-en)%3E">GraphQL output</a> (changes not yet visible), <a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,%20userList),lang))@userLangs|extract(getSelfProp(%self%,%20userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,%20userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,%20userList),email)@userData,self.post($postId)@post%3CcopyRelationalResults([content,%20date],[postContent,%20postDate])%3E|self.getSelfProp(%self%,%20postContent)@postContent%3Ctranslate(from:%20en,to:%20arrayDiff([getSelfProp(%self%,%20userLangs),[en]])),renameProperty(postContent-en)%3E">PoP native output</a> (changes already there)]

::: tip
When applying more than 1 directive to the same affected objects and fields, we can simply concatenate them with `,` in the order in which they will be executed, as in `<translate(...), renameProperty(...)>`.

However, because a directive is executed on its selected slot from among `"Front"`, `"Middle"` and `"Back"`, only the order within the slot will always be respected. It may be that defining `<directive1, directive2>` will have `<directive2>` execute before than `<directive1>` if its slot is executed earlier.
:::

## Selecting the corresponding translation for each user

By now, we have translated the post content to all different unique languages. Next, let's add the corresponding translation for each user, creating a new property `userPostData`.

To achieve this, we will make use of directive `<forEach>` which iterates over an array, and passes each array item to its composed directive `<applyFunction>` through expression `%value%`. This directive then executes function `arrayAddItem` on each item, which adds an element (the translated post content) to an array (the user data). In order to deduce the selected language, it uses functions `extract` to get the `lang` property from the user data array, then injects it into `sprintf` to generate the corresponding `postContent-languagecode` property, which is then retrieved from the current object (the root) and placed under property `postContent` on the array. All field arguments needed by function `arrayAddItem` are injected by the directive `<applyFunction>` on runtime through the array defined in argument `addArguments`.

```less
self.
  self.
    getSelfProp(%self%, userData)@userPostData<
      forEach<
        applyFunction(
          function: arrayAddItem(
            array: [],
            value: ""
          ),
          addArguments: [
            key: postContent,
            array: %value%,
            value: getSelfProp(
              %self%,
              sprintf(
                postContent-%s,
                [extract(%value%,lang)]
              )
            )
          ]
        )
      >
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,%20userList),lang))@userLangs|extract(getSelfProp(%self%,%20userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,%20userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,%20userList),email)@userData,self.post($postId)@post%3CcopyRelationalResults([content,%20date],[postContent,%20postDate])%3E|self.getSelfProp(%self%,%20postContent)@postContent%3Ctranslate(from:%20en,to:%20arrayDiff([getSelfProp(%self%,%20userLangs),[en]])),renameProperty(postContent-en)%3E|getSelfProp(%self%,%20userData)@userPostData%3CforEach%3CapplyFunction(function:%20arrayAddItem(array:%20[],value:%20%22%22),addArguments:%20[key:%20postContent,array:%20%value%,value:%20getSelfProp(%self%,sprintf(postContent-%s,[extract(%value%,%20lang)]))])%3E%3E">View query results</a>]

::: tip
Function `arrayAddItem` must initially define field arguments `array` and `value`, even if initialized with empty values. This must be done because these arguments are set as mandatory in the schema definition, so if they are not present, it is considered a schema validation error and this section of the query is ignored.
:::

## Adding a greeting message, and translating it to the user's language

Let's next deal with the greeting message, which must be translated to the user's language. Initially the message is a placeholder, and we customize it through the user `name` field and the post `date` field. Only then we can do the translation, as to help Google Translate do a better job at it (translating "Hi Leo!" should produce better results than translating "Hi %s!")

We first add the message into the array containing all other user data under property `header`, and already customizing it with the user data. The logic is similar as in the previous query, for which we also use directive `<applyFunction>`, which can be executed within the same iteration of the previous `<forEach>` directive:

```less
self.
  self.
    getSelfProp(%self%, userData)@userPostData<
      forEach<
        applyFunction(
          function: arrayAddItem(
            array: [],
            value: ""
          ),
          addArguments: [
            key: header,
            array: %value%,
            value: sprintf(
              string: "<p>Hi %s, we published this post on %s, enjoy!</p>",
              values: [
                extract(%value%, name),
                getSelfProp(%self%, postDate)
              ]
            )
          ]
        )
      >
    >
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,%20userList),lang))@userLangs|extract(getSelfProp(%self%,%20userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,%20userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,%20userList),email)@userData,self.post($postId)@post%3CcopyRelationalResults([content,%20date],[postContent,%20postDate])%3E|self.getSelfProp(%self%,%20postContent)@postContent%3Ctranslate(from:%20en,to:%20arrayDiff([getSelfProp(%self%,%20userLangs),[en]])),renameProperty(postContent-en)%3E|getSelfProp(%self%,%20userData)@userPostData%3CforEach%3CapplyFunction(function:%20arrayAddItem(array:%20[],value:%20%22%22),addArguments:%20[key:%20postContent,array:%20%value%,value:%20getSelfProp(%self%,sprintf(postContent-%s,[extract(%value%,%20lang)]))]),applyFunction(function:%20arrayAddItem(array:%20[],value:%20%22%22),addArguments:%20[key:%20header,array:%20%value%,value:%20sprintf(string:%20%22%3Cp%3EHi%20%s,%20we%20published%20this%20post%20on%20%s,%20enjoy!%3C/p%3E%22,values:%20[extract(%value%,%20name),getSelfProp(%self%,%20postDate)])])%3E%3E">View query results</a>]

Finally, we translate the message to the user's language. To do this, we use directive `<forEach>` to iterate on all array items whose `lang` field is `"en"` (for English), since we don't want to translate those. This is accomplished through the filter condition passed through argument `if`. Then, each array item is passed to the composed directive `<advancePointerInArray>`, which can navigate the inner structure of the array and position itself on the property that needs be translated: `header`. 

Finally the element is passed to the next composed directive, `<translate>`, which receives a string of arrays to translate as its affected fields, and an array of languages to translate to passed through expression `toLang` (which we create on-the-fly just for this purpose of communicating data across directives), and by setting argument `oneLanguagePerField` to `true` and `override` to `true` the directive knows to match each element on these 2 arrays to do the translation and place the result back on the original property.

```less
self.
  self.
    self.
      getSelfProp(%self%, userPostData)@translatedUserPostProps<
        forEach(
          if:not(equals(extract(%value%,lang),en))
        )<
          advancePointerInArray(
            path: header,
            appendExpressions: [
              toLang:extract(%value%,lang)
            ]
          )<
            translate(
              from: en,
              to: %toLang%,
              oneLanguagePerField: true,
              override: true
            )
          >
        >
      >
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,%20userList),lang))@userLangs|extract(getSelfProp(%self%,%20userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,%20userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,%20userList),email)@userData,self.post($postId)@post%3CcopyRelationalResults([content,%20date],[postContent,%20postDate])%3E|self.getSelfProp(%self%,%20postContent)@postContent%3Ctranslate(from:%20en,to:%20arrayDiff([getSelfProp(%self%,%20userLangs),[en]])),renameProperty(postContent-en)%3E|getSelfProp(%self%,%20userData)@userPostData%3CforEach%3CapplyFunction(function:%20arrayAddItem(array:%20[],value:%20%22%22),addArguments:%20[key:%20postContent,array:%20%value%,value:%20getSelfProp(%self%,sprintf(postContent-%s,[extract(%value%,%20lang)]))]),applyFunction(function:%20arrayAddItem(array:%20[],value:%20%22%22),addArguments:%20[key:%20header,array:%20%value%,value:%20sprintf(string:%20%22%3Cp%3EHi%20%s,%20we%20published%20this%20post%20on%20%s,%20enjoy!%3C/p%3E%22,values:%20[extract(%value%,%20name),getSelfProp(%self%,%20postDate)])])%3E%3E|self.getSelfProp(%self%,%20userPostData)@translatedUserPostProps%3CforEach(if:%20not(equals(extract(%value%,%20lang),en)))%3CadvancePointerInArray(path:%20header,appendExpressions:%20[toLang:%20extract(%value%,%20lang)])%3Ctranslate(from:%20en,to:%20%toLang%,oneLanguagePerField:%20true,override:%20true)%3E%3E%3E">View query results</a>]

## Generating and sending the email

We are almost there! All that there is left to do is to generate the content for all the emails to send: arrays containing properties `content`, `to` and `subject`, and then this array is passed to directive `<sendByEmail>` which, voilà, does what it must do! (Or actually not: Since we don't want spam, the email sending is actually disabled... We just print the email data instead for this guide)

```less
self.
  self.
    self.
      self.
        getSelfProp(%self%,translatedUserPostProps)@emails<
          forEach<
            applyFunction(
              function: arrayAddItem(
                array: [],
                value: []
              ),
              addArguments: [
                key: content,
                array: %value%,
                value: concat([
                  extract(%value%,header),
                  extract(%value%,postContent)
                ])
              ]
            ),
            applyFunction(
              function: arrayAddItem(
                array: [],
                value: []
              ),
              addArguments: [
                key: to,
                array: %value%,
                value: extract(%value%,email)
              ]
            ),
            applyFunction(
              function: arrayAddItem(
                array: [],
                value: []
              ),
              addArguments: [
                key: subject,
                array: %value%,
                value: "PoP API example :)"
              ]
            ),
            sendByEmail
          >
        >
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,%20userList),lang))@userLangs|extract(getSelfProp(%self%,%20userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,%20userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,%20userList),email)@userData,self.post($postId)@post%3CcopyRelationalResults([content,%20date],[postContent,%20postDate])%3E|self.getSelfProp(%self%,%20postContent)@postContent%3Ctranslate(from:%20en,to:%20arrayDiff([getSelfProp(%self%,%20userLangs),[en]])),renameProperty(postContent-en)%3E|getSelfProp(%self%,%20userData)@userPostData%3CforEach%3CapplyFunction(function:%20arrayAddItem(array:%20[],value:%20%22%22),addArguments:%20[key:%20postContent,array:%20%value%,value:%20getSelfProp(%self%,sprintf(postContent-%s,[extract(%value%,%20lang)]))]),applyFunction(function:%20arrayAddItem(array:%20[],value:%20%22%22),addArguments:%20[key:%20header,array:%20%value%,value:%20sprintf(string:%20%22%3Cp%3EHi%20%s,%20we%20published%20this%20post%20on%20%s,%20enjoy!%3C/p%3E%22,values:%20[extract(%value%,%20name),getSelfProp(%self%,%20postDate)])])%3E%3E|self.getSelfProp(%self%,%20userPostData)@translatedUserPostProps%3CforEach(if:%20not(equals(extract(%value%,%20lang),en)))%3CadvancePointerInArray(path:%20header,appendExpressions:%20[toLang:%20extract(%value%,%20lang)])%3Ctranslate(from:%20en,to:%20%toLang%,oneLanguagePerField:%20true,override:%20true)%3E%3E%3E|self.getSelfProp(%self%,translatedUserPostProps)@emails%3CforEach%3CapplyFunction(function:%20arrayAddItem(array:%20[],value:%20[]),addArguments:%20[key:%20content,array:%20%value%,value:%20concat([extract(%value%,%20header),extract(%value%,%20postContent)])]),applyFunction(function:%20arrayAddItem(array:%20[],value:%20[]),addArguments:%20[key:%20to,array:%20%value%,value:%20extract(%value%,%20email)]),applyFunction(function:%20arrayAddItem(array:%20[],value:%20[]),addArguments:%20[key:%20subject,array:%20%value%,value:%20%22PoP%20API%20example%20:)%22]),sendByEmail%3E%3E">View query results</a>]

## The final query!

We have everything we need! Let's get it all together into the one, final, complete query:

```less
post($postId)@post.
  content|
  date(d/m/Y)@date,
getJSON("https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions")@userList|
arrayUnique(
  extract(
    getSelfProp(%self%, userList),
    lang
  )
)@userLangs|
extract(
  getSelfProp(%self%, userList),
  email
)@userEmails|
arrayFill(
  getJSON(
    sprintf(
      "https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s",
      [arrayJoin(
        getSelfProp(%self%, userEmails),
        "%26emails[]="
      )]
    )
  ),
  getSelfProp(%self%, userList),
  email
)@userData,
self.
  post($postId)@post<
    copyRelationalResults(
      [content, date],
      [postContent, postDate]
    )
  >|
  self.
    getSelfProp(%self%, postContent)@postContent<
      translate(
        from: en,
        to: arrayDiff([
          getSelfProp(%self%, userLangs),
          [en]
        ])
      ),
      renameProperty(postContent-en)
    >|
    getSelfProp(%self%, userData)@userPostData<
      forEach<
        applyFunction(
          function: arrayAddItem(
            array: [],
            value: ""
          ),
          addArguments: [
            key: postContent,
            array: %value%,
            value: getSelfProp(
              %self%,
              sprintf(
                postContent-%s,
                [extract(%value%, lang)]
              )
            )
          ]
        ),
        applyFunction(
          function: arrayAddItem(
            array: [],
            value: ""
          ),
          addArguments: [
            key: header,
            array: %value%,
            value: sprintf(
              string: "<p>Hi %s, we published this post on %s, enjoy!</p>",
              values: [
                extract(%value%, name),
                getSelfProp(%self%, postDate)
              ]
            )
          ]
        )
      >
    >|
    self.
      getSelfProp(%self%, userPostData)@translatedUserPostProps<
        forEach(
          if: not(
            equals(
              extract(%value%, lang),
              en
            )
          )
        )<
          advancePointerInArray(
            path: header,
            appendExpressions: [
              toLang: extract(%value%, lang)
            ]
          )<
            translate(
              from: en,
              to: %toLang%,
              oneLanguagePerField: true,
              override: true
            )
          >
        >
      >|
      self.
        getSelfProp(%self%,translatedUserPostProps)@emails<
          forEach<
            applyFunction(
              function: arrayAddItem(
                array: [],
                value: []
              ),
              addArguments: [
                key: content,
                array: %value%,
                value: concat([
                  extract(%value%, header),
                  extract(%value%, postContent)
                ])
              ]
            ),
            applyFunction(
              function: arrayAddItem(
                array: [],
                value: []
              ),
              addArguments: [
                key: to,
                array: %value%,
                value: extract(%value%, email)
              ]
            ),
            applyFunction(
              function: arrayAddItem(
                array: [],
                value: []
              ),
              addArguments: [
                key: subject,
                array: %value%,
                value: "PoP API example :)"
              ]
            ),
            sendByEmail
          >
        >
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,%20userList),lang))@userLangs|extract(getSelfProp(%self%,%20userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,%20userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,%20userList),email)@userData,self.post($postId)@post%3CcopyRelationalResults([content,%20date],[postContent,%20postDate])%3E|self.getSelfProp(%self%,%20postContent)@postContent%3Ctranslate(from:%20en,to:%20arrayDiff([getSelfProp(%self%,%20userLangs),[en]])),renameProperty(postContent-en)%3E|getSelfProp(%self%,%20userData)@userPostData%3CforEach%3CapplyFunction(function:%20arrayAddItem(array:%20[],value:%20%22%22),addArguments:%20[key:%20postContent,array:%20%value%,value:%20getSelfProp(%self%,sprintf(postContent-%s,[extract(%value%,%20lang)]))]),applyFunction(function:%20arrayAddItem(array:%20[],value:%20%22%22),addArguments:%20[key:%20header,array:%20%value%,value:%20sprintf(string:%20%22%3Cp%3EHi%20%s,%20we%20published%20this%20post%20on%20%s,%20enjoy!%3C/p%3E%22,values:%20[extract(%value%,%20name),getSelfProp(%self%,%20postDate)])])%3E%3E|self.getSelfProp(%self%,%20userPostData)@translatedUserPostProps%3CforEach(if:%20not(equals(extract(%value%,%20lang),en)))%3CadvancePointerInArray(path:%20header,appendExpressions:%20[toLang:%20extract(%value%,%20lang)])%3Ctranslate(from:%20en,to:%20%toLang%,oneLanguagePerField:%20true,override:%20true)%3E%3E%3E|self.getSelfProp(%self%,translatedUserPostProps)@emails%3CforEach%3CapplyFunction(function:%20arrayAddItem(array:%20[],value:%20[]),addArguments:%20[key:%20content,array:%20%value%,value:%20concat([extract(%value%,%20header),extract(%value%,%20postContent)])]),applyFunction(function:%20arrayAddItem(array:%20[],value:%20[]),addArguments:%20[key:%20to,array:%20%value%,value:%20extract(%value%,%20email)]),applyFunction(function:%20arrayAddItem(array:%20[],value:%20[]),addArguments:%20[key:%20subject,array:%20%value%,value:%20%22PoP%20API%20example%20:)%22]),sendByEmail%3E%3E">View query results</a>]

We are done now! Use case accomplished!

## Simplified query

If using `;` to split the fields instead of `,`, the server already takes care of placing all the `self` fields on the executable query.

When doing `field1,field2,field3` we do not know in which order these fields will be resolved. But doing `field1;field2;field3`, the order is guaranteed to be `field1 => field2 => field3`, so we don't need to manually add all the `self` fields anymore.

The query above is equivalent to this simplified query:

```less
post($postId)@post.
  content|
  date(d/m/Y)@date,
getJSON("https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions")@userList|
arrayUnique(
  extract(
    getSelfProp(%self%, userList),
    lang
  )
)@userLangs|
extract(
  getSelfProp(%self%, userList),
  email
)@userEmails|
arrayFill(
  getJSON(
    sprintf(
      "https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s",
      [arrayJoin(
        getSelfProp(%self%, userEmails),
        "%26emails[]="
      )]
    )
  ),
  getSelfProp(%self%, userList),
  email
)@userData;

post($postId)@post<
  copyRelationalResults(
    [content, date],
    [postContent, postDate]
  )
>;

getSelfProp(%self%, postContent)@postContent<
  translate(
    from: en,
    to: arrayDiff([
      getSelfProp(%self%, userLangs),
      [en]
    ])
  ),
  renameProperty(postContent-en)
>|
getSelfProp(%self%, userData)@userPostData<
  forEach<
    applyFunction(
      function: arrayAddItem(
        array: [],
        value: ""
      ),
      addArguments: [
        key: postContent,
        array: %value%,
        value: getSelfProp(
          %self%,
          sprintf(
            postContent-%s,
            [extract(%value%, lang)]
          )
        )
      ]
    ),
    applyFunction(
      function: arrayAddItem(
        array: [],
        value: ""
      ),
      addArguments: [
        key: header,
        array: %value%,
        value: sprintf(
          string: "<p>Hi %s, we published this post on %s, enjoy!</p>",
          values: [
            extract(%value%, name),
            getSelfProp(%self%, postDate)
          ]
        )
      ]
    )
  >
>;

getSelfProp(%self%, userPostData)@translatedUserPostProps<
  forEach(
    if: not(
      equals(
        extract(%value%, lang),
        en
      )
    )
  )<
    advancePointerInArray(
      path: header,
      appendExpressions: [
        toLang: extract(%value%, lang)
      ]
    )<
      translate(
        from: en,
        to: %toLang%,
        oneLanguagePerField: true,
        override: true
      )
    >
  >
>;

getSelfProp(%self%,translatedUserPostProps)@emails<
  forEach<
    applyFunction(
      function: arrayAddItem(
        array: [],
        value: []
      ),
      addArguments: [
        key: content,
        array: %value%,
        value: concat([
          extract(%value%, header),
          extract(%value%, postContent)
        ])
      ]
    ),
    applyFunction(
      function: arrayAddItem(
        array: [],
        value: []
      ),
      addArguments: [
        key: to,
        array: %value%,
        value: extract(%value%, email)
      ]
    ),
    applyFunction(
      function: arrayAddItem(
        array: [],
        value: []
      ),
      addArguments: [
        key: subject,
        array: %value%,
        value: "PoP API example :)"
      ]
    ),
    sendByEmail
  >
>
```

[<a href="https://newapi.getpop.org/api/graphql/?postId=1&query=post($postId)@post.content|date(d/m/Y)@date,getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userList|arrayUnique(extract(getSelfProp(%self%,%20userList),lang))@userLangs|extract(getSelfProp(%self%,%20userList),email)@userEmails|arrayFill(getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s%22,[arrayJoin(getSelfProp(%self%,%20userEmails),%22%26emails[]=%22)])),getSelfProp(%self%,%20userList),email)@userData;post($postId)@post%3CcopyRelationalResults([content,%20date],[postContent,%20postDate])%3E;getSelfProp(%self%,%20postContent)@postContent%3Ctranslate(from:%20en,to:%20arrayDiff([getSelfProp(%self%,%20userLangs),[en]])),renameProperty(postContent-en)%3E|getSelfProp(%self%,%20userData)@userPostData%3CforEach%3CapplyFunction(function:%20arrayAddItem(array:%20[],value:%20%22%22),addArguments:%20[key:%20postContent,array:%20%value%,value:%20getSelfProp(%self%,sprintf(postContent-%s,[extract(%value%,%20lang)]))]),applyFunction(function:%20arrayAddItem(array:%20[],value:%20%22%22),addArguments:%20[key:%20header,array:%20%value%,value:%20sprintf(string:%20%22%3Cp%3EHi%20%s,%20we%20published%20this%20post%20on%20%s,%20enjoy!%3C/p%3E%22,values:%20[extract(%value%,%20name),getSelfProp(%self%,%20postDate)])])%3E%3E;getSelfProp(%self%,%20userPostData)@translatedUserPostProps%3CforEach(if:%20not(equals(extract(%value%,%20lang),en)))%3CadvancePointerInArray(path:%20header,appendExpressions:%20[toLang:%20extract(%value%,%20lang)])%3Ctranslate(from:%20en,to:%20%toLang%,oneLanguagePerField:%20true,override:%20true)%3E%3E%3E;getSelfProp(%self%,translatedUserPostProps)@emails%3CforEach%3CapplyFunction(function:%20arrayAddItem(array:%20[],value:%20[]),addArguments:%20[key:%20content,array:%20%value%,value:%20concat([extract(%value%,%20header),extract(%value%,%20postContent)])]),applyFunction(function:%20arrayAddItem(array:%20[],value:%20[]),addArguments:%20[key:%20to,array:%20%value%,value:%20extract(%value%,%20email)]),applyFunction(function:%20arrayAddItem(array:%20[],value:%20[]),addArguments:%20[key:%20subject,array:%20%value%,value:%20%22PoP%20API%20example%20:)%22]),sendByEmail%3E%3E">View query results</a>]