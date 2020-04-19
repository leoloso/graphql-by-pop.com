# (*) Interacting with APIs

TODO

## Interact with APIs from the back-end

Example calling the Google Translate API from the back-end, as coded within directive `<translate>`:

```less
//1. <translate> calls the Google Translate API
/?query=
  posts(limit:5).
    title|
    title@spanish<
      translate(en,es)
    >

//2. Translate to Spanish and back to English
/?query=
  posts(limit:5).
    title|
    title@translateAndBack<
      translate(en,es),
      translate(es,en)
    >

//3. Change the provider through arguments
// (link gives error: Azure is not implemented)
/?query=
  posts(limit:5).
    title|
    title@spanish<
      translate(en,es,provider:azure)
    >
```

<a href="https://newapi.getpop.org/api/graphql/?query=posts(limit:5).title%7Ctitle@spanish%3Ctranslate(en,es)%3E">View query results #1</a>

<a href="https://newapi.getpop.org/api/graphql/?query=posts(limit:5).title%7Ctitle@translateAndBack%3Ctranslate(en,es),translate(es,en)%3E">View query results #2</a>

<a href="https://newapi.getpop.org/api/graphql/?query=posts(limit:5).title%7Ctitle@spanish%3Ctranslate(en,es,provider:azure)%3E">View query results #3</a>

## Interact with APIs from the client-side

Example accessing an external API from the query itself:

```less
/?query=
echo([
  usd: [
    bitcoin: extract(
      getJSON("https://api.cryptonator.com/api/ticker/btc-usd"), 
      ticker.price
    ),
    ethereum: extract(
      getJSON("https://api.cryptonator.com/api/ticker/eth-usd"), 
      ticker.price
    )
  ],
  euro: [
    bitcoin: extract(
      getJSON("https://api.cryptonator.com/api/ticker/btc-eur"), 
      ticker.price
    ),
    ethereum: extract(
      getJSON("https://api.cryptonator.com/api/ticker/eth-eur"), 
      ticker.price
    )
  ]
])@cryptoPrices
```

<a href="https://newapi.getpop.org/api/graphql/?query=echo(%5Busd:%5Bbitcoin:extract(getJSON(%22https://api.cryptonator.com/api/ticker/btc-usd%22),ticker.price),ethereum:extract(getJSON(%22https://api.cryptonator.com/api/ticker/eth-usd%22),ticker.price)%5D,euro:%5Bbitcoin:extract(getJSON(%22https://api.cryptonator.com/api/ticker/btc-eur%22),ticker.price),ethereum:extract(getJSON(%22https://api.cryptonator.com/api/ticker/eth-eur%22),ticker.price)%5D%5D)@cryptoPrices">View query results</a>

## Interact with APIs, performing all required logic in a single query

The last query from the examples below accesses, extracts and manipulates data from an external API, and then uses this result to accesse yet another external API:

```less
//1. Get data from a REST endpoint
/?query=
  getJSON("https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions")@userEmailLangList

//2. Access and manipulate the data
/?query=
  extract(
    getJSON("https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions"),
    email
  )@userEmailList
  
//3. Convert the data into an input to another system
/?query=
  getJSON(
    sprintf(
      "https://newapi.getpop.org/users/api/rest/?query=name|email%26emails[]=%s",
      [arrayJoin(
        extract(
          getJSON("https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions"),
          email
        ),
        "%26emails[]="
      )]
    )
  )@userNameEmailList
```

<a href="https://newapi.getpop.org/api/graphql/?query=getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22)@userEmailLangList">View query results #1</a>

<a href="https://newapi.getpop.org/api/graphql/?query=extract(getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22),email)@userEmailList">View query results #2</a>

<a href="https://newapi.getpop.org/api/graphql/?query=getJSON(sprintf(%22https://newapi.getpop.org/users/api/rest/?query=name%7Cemail%26emails%5B%5D=%s%22,%5BarrayJoin(extract(getJSON(%22https://newapi.getpop.org/wp-json/newsletter/v1/subscriptions%22),email),%22%26emails%5B%5D=%22)%5D))@userEmailNameList">View query results #3</a>
