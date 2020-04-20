# (*) Interact with APIs from within the Query

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
