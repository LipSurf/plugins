/*
 * LipSurf plugin for Google search
 */
/// <reference types="@lipsurf/types/extension"/>
declare const PluginBase: IPluginBase;

export default <IPluginBase & IPlugin>{
  ...PluginBase,
  ...{
    niceName: "Google",
    description: "Google Search, Calendar and other tools.",
    version: "4.5.0-alpha.0",
    apiVersion: 2,
    match: /.*\.google\.com/,
    homophones: {
      search: "google",
    },
    authors: "Miko",

    commands: [
      {
        name: "Search",
        description: "Do a google search.",
        global: true,
        match: "google *",
        pageFn: (transcript, { preTs, normTs }: TsData) => {
          window.location.href = `https://www.google.com/search?q=${preTs}`;
        },
      },
      {
        name: "I'm Feeling Lucky",
        description:
          'Equivalent to hitting the "I\'m feeling lucky" button for a Google search. Goes to the first result of the search query if Google feels confident with the results.',
        global: true,
        match: "feeling lucky *",
        pageFn: (transcript, { preTs, normTs }: TsData) => {
          window.location.href = `https://www.google.com/search?btnI=I%27m+Feeling+Lucky&q=${preTs}`;
        },
      },
      {
        name: "Google Calendar",
        global: true,
        match: "google calendar",
        pageFn: () => {
          window.location.href = `https://calendar.google.com/calendar/r`;
        },
      },
      {
        name: "Add Event to Google Calendar",
        global: true,
        match: ["add [event /]to google calendar"],
        pageFn: () => {
          window.location.href = `https://calendar.google.com/calendar/r/eventedit`;
        },
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
  },
};
