module.exports = {
	title: 'LipSurf Plugin Developer Documentation',
	description: 'Documentation for developers looking to extend LipSurf using the official API. Create extensions to control your browser via voice or create voice shortcuts for the browser.',
	base: '/',
	themeConfig: {
		logo: '/icon-128.png',
		repo: 'lipsurf/plugins',
		footer: '© 2020 LipSurf',
		editLinks: true,
		editLinkText: 'Improve this page',
		docsDir: 'docs',
		algolia: {
		    apiKey: '813bcf2a81a839cbea24b7899885d1b6',
		    indexName: 'lipsurf'
		},
		sidebar: [
			{
				title: 'Basics',
				collapsable: false,
				children: [
					'/',
					'/quick-start.md',
					'/architecture.md',
					'/glossary.md',
				],
			},
			{
				title: 'Advanced',
				collapsable: false,
				children: [
					'/dynamic-matching.md',
					'/contexts.md',
					'/langs.md',
					'/plugin-level-settings.md',
					'/testing.md',
					'/recipes.md',
				],
			},
			{
				title: 'Support',
				collapsable: false,
				children: [
					'help.md',
				],
			},
			{
				title: 'API Reference',
				collapsable: false,
				children: [
					'api-reference/pluginbase.md',
					'api-reference/command.md',
					'api-reference/test.md',
				],
			},
			{
				title: 'Enterprise',
				collapsable: false,
				children: [
					'api-reference/customstt.md',
					'api-reference/script.md',
				],
			}
		],
		lastUpdated: 'Last updated',
	}
}
