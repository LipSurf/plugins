/*
 * LipSurf plugin for Google search
 */
/// <reference types="lipsurf-plugin-types"/>
declare const PluginBase: IPluginBase;

export default <IPluginBase & IPlugin> {...PluginBase, ...{
    niceName: 'Google',
    description: 'The google search engine.',
    version: '2.13.0',
    match: /.*\.google\.com/,
    homophones: {
        'search': 'google',
    },
    authors: "Miko",

    commands: [{
        name: 'Search',
        description: "Do a google search.",
        global: true,
        match: 'google *',
        pageFn: async (transcript: string, searchQuery: string) => {
            window.location.href = `https://www.google.com/search?q=${searchQuery}`;
        }
    },
    {
        name: "I'm Feeling Lucky",
        description: 'Equivalent to hitting the "I\'m feeling lucky" button for a Google search. Goes to the first result of the search query if Google feels confident with the results.',
        global: true,
        match: 'feeling lucky *',
        pageFn: async (transcript: string, searchQuery: string) => {
            window.location.href = `https://www.google.com/search?btnI=I%27m+Feeling+Lucky&q=${searchQuery}`
        }
    },
    {
        name: 'Google Calendar',
        global: true,
        match: 'google calendar',
        pageFn: async () => {
            window.location.href = `https://calendar.google.com/calendar/r`;
        }
    },
    {
        name: 'Add Event to Google Calendar',
        global: true,
        match: ['add event to google calendar', 'add to google calendar'],
        pageFn: async () => {
            window.location.href = `https://calendar.google.com/calendar/r/eventedit`;
        }
    },
    // {
    //     name: 'Back to Google Search Results',
    //     global: true,
    //     match: ['back to results', 'back to google', 'back to search'],
        // fn: async () => {
        //     chrome.permissions.request({
        //         permissions: ['webNavigation'],
        //     }, function (granted) {
        //         // The callback argument will be true if the user granted the permissions.
        //         if (granted) {
        //             // chrome.webNavigation.getFrame({})
        //             chrome.tabs.query({
        //                 active: true
        //             }, (tabs) => {
        //                 let tab = tabs[0];
        //                 chrome.webNavigation.getAllFrames({
        //                     tabId: tab.id
        //                 }, (frameDetails) => {
        //                     console.log(frameDetails);
        //                     debugger;
        //                 })
        //             })
        //         }
        //     });
        // }
    // },
    ],
}};
