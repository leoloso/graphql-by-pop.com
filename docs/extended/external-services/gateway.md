# (*) Gateway

The last query from the examples below accesses, extracts and manipulates data from an external API, and then uses this result to access yet another external API:

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
