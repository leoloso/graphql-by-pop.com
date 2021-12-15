# (*) Content Mesh

The example below defines and accesses a list of all services required by the application:

```less
/?query=
  echo([
    github: "https://api.github.com/repos/leoloso/PoP",
    weather: "https://api.weather.gov/zones/forecast/MOZ028/forecast",
    photos: "https://picsum.photos/v2/list"
  ])@meshServices|
  getAsyncJSON(getSelfProp(%{self}%, meshServices))@meshServiceData|
  echo([
    weatherForecast: extract(
      getSelfProp(%{self}%, meshServiceData),
      weather.periods
    ),
    photoGalleryURLs: extract(
      getSelfProp(%{self}%, meshServiceData),
      photos.url
    ),
    githubMeta: echo([
      description: extract(
        getSelfProp(%{self}%, meshServiceData),
        github.description
      ),
      starCount: extract(
        getSelfProp(%{self}%, meshServiceData),
        github.stargazers_count
      )
    ])
  ])@contentMesh
```

<a href="https://newapi.getpop.org/api/graphql/?query=echo(%5Bgithub:%22https://api.github.com/repos/leoloso/PoP%22,weather:%22https://api.weather.gov/zones/forecast/MOZ028/forecast%22,photos:%22https://picsum.photos/v2/list%22%5D)@meshServices%7CgetAsyncJSON(getSelfProp(%{self}%,meshServices))@meshServiceData%7Cecho(%5BweatherForecast:extract(getSelfProp(%{self}%,meshServiceData),weather.periods),photoGalleryURLs:extract(getSelfProp(%{self}%,meshServiceData),photos.url),githubMeta:echo(%5Bdescription:extract(getSelfProp(%{self}%,meshServiceData),github.description),starCount:extract(getSelfProp(%{self}%,meshServiceData),github.stargazers_count)%5D)%5D)@contentMesh">View query results</a>
