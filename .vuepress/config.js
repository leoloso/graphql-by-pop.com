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
        ['link', { rel: 'icon', href: '/logo.png' }],
        ['link', { rel: 'manifest', href: '/manifest.json' }],
        ['meta', { name: 'theme-color', content: '#b9d9ed' }],
        ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
        ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
        ['link', { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon-152x152.png' }],
        ['link', { rel: 'mask-icon', href: '/icons/safari-pinned-tab.svg', color: '#ffffff' }],
        ['meta', { name: 'msapplication-TileImage', content: '/icons/msapplication-icon-144x144.png' }],
        ['meta', { name: 'msapplication-TileColor', content: '#ffffff' }],
        ['meta', { property: 'og:image', content: 'https://graphql-by-pop.com/assets/graphql-by-pop-logo.jpg' }],
        ['meta', { name: 'twitter:image', content: 'https://graphql-by-pop.com/assets/graphql-by-pop-logo.jpg' }],
        ['meta', { property: 'og:image:alt', content: 'GraphQL by PoP logo' }],
        ['meta', { name: 'twitter:image:alt', content: 'GraphQL by PoP logo' }],
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
        }],
        // ['@vuepress/google-analytics', {
        //     'ga': 'UA-163297507-1'
        // }],
        require('./plugins/plausible/index.js')
        // Enable PWA after documentation is ready
        // ['@vuepress/pwa', {
        //     serviceWorker: true,
        //     updatePopup: true
        // }],
    ]
}
