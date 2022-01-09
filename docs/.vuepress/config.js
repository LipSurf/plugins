module.exports = {
	lang: 'en-US',
	title: 'LipSurf Plugin Developer Documentation',
	description: 'Documentation for developers looking to extend LipSurf using the official API. Create voice commands and shortcuts for the browser.',
	base: '/',
	theme: '@vuepress/theme-default',
	themeConfig: {
		logo: '/icon-128.png',
		repo: 'lipsurf/plugins',
		footer: '© 2019-Present LipSurf, Inc.',
		editLinks: true,
		editLinkText: 'Improve this page',
		docsDir: 'docs',
		searchPlaceholder: 'Search...',
		algolia: {
		    apiKey: '813bcf2a81a839cbea24b7899885d1b6',
		    indexName: 'lipsurf'
		},
		sidebar: [
			{
				text: 'Basics',
				children: [
					'/',
					'/quick-start.md',
					'/architecture.md',
					'/dynamic-matching.md',
				],
			},
			{
				text: 'Advanced',
				children: [
					'/contexts.md',
					'/langs.md',
					'/plugin-level-settings.md',
					'/testing.md',
					'/recipes.md',
				],
			},
			{
				text: 'Help',
				children: [
					'/help.md',
					'/glossary.md',
				],
			},
			{
				text: 'API Reference',
				children: [
					'/api-reference/plugin.md',
					'/api-reference/command.md',
					'/api-reference/pluginbase-util.md',
					'/api-reference/test.md',
				],
			},
			{
				text: 'Enterprise',
				children: [
					'/api-reference/customstt.md',
					'/api-reference/script.md',
				],
			}
		],
		lastUpdated: false
	}
}
