export default ({
    Vue, // the version of Vue being used in the VuePress app
    options, // the options for the root Vue instance
    router, // the router instance for the app
    siteData // site metadata
}) => {

    // Redirect to latest docs
    router.addRoutes([
        {
            path: '/docs/',
            redirect: `/docs/getting-started/installation.html`
        },
        {
            path: '/docs/extended/',
            redirect: `/docs/extended/intro.html`
        },
        {
            path: '/docs/schema-design/',
            redirect: `/docs/schema-design/schema-multiverse.html`
        },
        {
            path: '/tutorials/',
            redirect: `/tutorials/cms-agnostic-resolver.html`
        },
    ])
}
