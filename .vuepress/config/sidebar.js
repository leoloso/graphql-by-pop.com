const docsSidebar = [
    {
        title: 'Getting Started',
        children: [
            'getting-started/intro',
            'getting-started/installation/wordpress',
            'getting-started/repositories',
            'getting-started/configuration',
            'getting-started/versioning',
            'getting-started/directory-structure',
            'getting-started/clients-for-demos',
        ]
    },
    {
        title: 'Schema Objects',
        children: [
            'schema-objects/schema',
            'schema-objects/types/intro',
            'schema-objects/types/objects',
            'schema-objects/types/interfaces',
            'schema-objects/types/unions',
            'schema-objects/types/enums',
            'schema-objects/types/scalars',
            'schema-objects/fields',
            'schema-objects/directives',
        ]
    },
    {
        title: 'Schema Design',
        children: [
            'schema-design/schema-multiverse',
            'schema-design/automatic-namespacing',
            'schema-design/versioning',
            'schema-design/errors-deprecations-warnings-logs',
            'schema-design/persisted-fragments-and-queries',
            'schema-design/type-casting-and-validation',
            'schema-design/filtering',
            'schema-design/pagination',
        ]
    },
    {
        title: 'Security',
        children: [
            'security/authentication',
            'security/authorization',
            'security/validation',
            'security/sanitization',
        ]
    },
    {
        title: 'Caching',
        children: [
            'caching/http-caching',
            'caching/internal-caching',
            'caching/schema-caching',
        ]
    },
    {
        title: 'Advanced',
        children: [
            'advanced/interact-apis',
            'advanced/gateway',
            'advanced/content-mesh',
            'advanced/normalized-data',
        ]
    },
    {
        title: 'Extended GraphQL',
        children: [
            ['extended/intro', 'Intro'],
            'extended/full-schema',
            'extended/pql',
            'extended/pql-syntax',
            'extended/pql-advanced',
        ]
    },
    {
        title: 'Going Further',
        children: [
            'going-further/multiple-endpoints',
            'going-further/rest-integration',
            ['going-further/response-formats', 'Response formats'],
        ]
    },
    {
        title: 'Architecture',
        children: [
            'architecture/symfony-components',
            'architecture/server-side-components',
            'architecture/graphql-superset',
            'architecture/package-hierarchy',
            'architecture/dataloading-engine',
            'architecture/time-complexity',
            'architecture/avoiding-n-plus-one-problem',
            'architecture/the-directive-pipeline',
            'architecture/directives-as-elemental-block',
            'architecture/extensibility',
            'architecture/code-first',
            'architecture/dynamic-schema',
            'architecture/public-private-schema',
            'architecture/rapid-iteration',
            'architecture/cms-agnosticism',
            'architecture/converting-from-pql-to-gql',
        ]
    },
    {
        title: 'Troubleshooting',
        children: [
            'troubleshooting/common-errors',
            'troubleshooting/known-issues',
        ]
    },
    {
        title: 'API Reference',
        children: [
            'api-reference/package-directory',
            'api-reference/types',
            'api-reference/directives',
        ]
    },
    {
        title: 'Roadmap',
        children: [
            'roadmap/convention-over-configuration',
            'roadmap/scaffolding-commands',
            'roadmap/mutations',
            'roadmap/federation',
            'roadmap/tracing',
            ['roadmap/decoupling-requested-executed-queries', 'Decoupling queries'],
            'roadmap/serverless-wordpress',
            ['roadmap/laravel-symfony', 'Laravel/Symfony'],
        ]
    },
];
const tutorialsSidebar = [
    'cms-agnostic-resolver',
    'localized-newsletter',
    'filling-void-with-directive',
    'creating-access-control-rule',
];
module.exports = {
    '/docs/': docsSidebar,
    '/tutorials/': tutorialsSidebar,
}
