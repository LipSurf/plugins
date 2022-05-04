import { defineConfig } from 'vitepress'

export default defineConfig({
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
					{link: '/', text: 'Overview'},
					{link: '/quick-start', text: '5 Minute Quick Start'},
					{link: '/architecture', text: 'Architecture'},
					{link: '/dynamic-matching', text: 'Match Patterns'},
				],
			},
			{
				text: 'Advanced',
				children: [
					{link: '/contexts', text: 'Contexts'},
					{link: '/langs', text: 'Internationalization'},
					{link: '/plugin-level-settings', text: 'Plugin-level Settings'},
					{link: '/testing', text: 'Testing'},
					{link: '/recipes', text: 'Recipes'},
				],
			},
			{
				text: 'Help',
				children: [
					{link: '/help', text: 'Get Help'},
					{link: '/glossary', text: 'Glossary'},
				],
			},
			{
				text: 'API Reference',
				children: [
					{link: '/api-reference/plugin', text: 'Plugin'},
					{link: '/api-reference/command', text: 'Command'},
					{link: '/api-reference/pluginbase-util', text: 'PluginBase.util'},
					{link: '/api-reference/test', text: 'Test'},
				],
			},
			{
				text: 'Enterprise',
				children: [
					{link: '/api-reference/customstt', text: 'Custom STT API'},
					{link: '/api-reference/script', text: 'LipSurf.js'},
				],
			}
		],
		lastUpdated: false
	}
});
