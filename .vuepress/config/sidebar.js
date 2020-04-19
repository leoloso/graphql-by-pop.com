const docsSidebar = [
    {
        title: 'Getting Started',
        children: [
            'getting-started/intro',
            'getting-started/installation/wordpress',
            'getting-started/repositories',
            'getting-started/configuration',
            'getting-started/directory-structure',
        ]
    },
    {
        title: 'Dynamic Schema',
        children: [
            'dynamic-schema/intro',
            'dynamic-schema/multiple-resolvers',
            'dynamic-schema/field-directive-based-versioning',
            'dynamic-schema/access-control',
            'dynamic-schema/public-private-schema-mode',
            'dynamic-schema/backend-for-frontends',
            'dynamic-schema/automatic-namespacing',
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
            ['caching/http-caching', 'HTTP Caching'],
            'caching/internal-caching',
            'caching/schema-caching',
        ]
    },
    {
        title: 'Operational',
        children: [
            'operational/errors-deprecations-warnings-logs',
            'operational/persisted-fragments-and-queries',
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
            'extended/intro',
            'extended/full-schema',
            'extended/pql',
            'extended/pql-language-features',
            'extended/pql-syntax',
        ]
    },
    {
        title: 'Going Further',
        children: [
            'going-further/multiple-endpoints',
            'going-further/rest-integration',
            ['going-further/response-formats', 'Response Formats (TBW)'],
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
            'architecture/avoiding-n-plus-one-problem',
            'architecture/directive-pipeline',
            'architecture/directives-as-elemental-block',
            'architecture/extensibility',
            'architecture/code-first',
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
            ['roadmap/decoupling-requested-executed-queries', 'Decoupling Queries (TBW)'],
            'roadmap/serverless-wordpress',
            ['roadmap/laravel-symfony', 'Laravel/Symfony (TBW)'],
        ]
    },
];
const tutorialsSidebar = [
    'localized-newsletter',
    'cms-agnostic-resolver',
    'filling-void-with-directive',
    'creating-access-control-rule',
];
module.exports = {
    '/docs/': docsSidebar,
    '/tutorials/': tutorialsSidebar,
}
