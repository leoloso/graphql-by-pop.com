const nav = require(`./config/nav.js`)
const sidebar = require(`./config/sidebar.js`)

module.exports = {
    title: 'GraphQL by PoP',
    description: 'CMS-agnostic GraphQL server in PHP',
    head: [
        ['link', {
            rel: 'icon',
            href: '/favicon.png'
        }],
        ['link', {
            rel: 'stylesheet',
            type: 'text/css',
            href: 'https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,800,800i,900,900i'
        },],
        ['link', {
            rel: 'stylesheet',
            type: 'text/css',
            href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap'
        },],
    ],
    theme: 'default-prefers-color-scheme',
    themeConfig: {
        defaultTheme: 'light',
        logo: '/graphql-by-pop-logo.svg',
        editLinks: true,
        lastUpdated: 'Last Updated',
        repo: 'getpop/graphql-by-pop.com',
        nav: nav,
        sidebar: sidebar
    },
    plugins: [
        ['@vuepress/back-to-top', true],
        ['@vuepress/medium-zoom', true],
        ['@vuepress/search', {
            searchMaxSuggestions: 10,
        }]
    ]
}
