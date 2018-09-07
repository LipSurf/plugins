module.exports = {
	title: 'LipSurf Plugin Authoring Manual',
	description: 'Documentation for developers looking to extend LipSurf using the official API.',
	themeConfig: {
		sidebar: [
			{
				title: 'Basics',
				collapsable: false,
				children: [
					'/',
					'/quick-start.md',
					'/architecture.md',
				],
			},
			{
				title: 'Advanced',
				collapsable: false,
				children: [
					'/dynamic-matching.md',
					'/langs.md',
					'/testing.md',
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
					'api-reference/plugin-base.md',
					'api-reference/command.md',
				]
			},
		],
		lastUpdated: 'Last updated',
	}
}
