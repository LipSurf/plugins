/*
 * LipSurf plugin for going to popular sites
 */
/// <reference types="@lipsurf/types/extension"/>
declare const PluginBase: IPluginBase;

export default <IPluginBase & IPlugin>{
  ...PluginBase,
  ...{
    niceName: "Top Sites",
    description: "Shortcuts for going to popular websites.",
    version: "4.2.3-alpha.0",
    apiVersion: 2,
    match: /.*/,
    authors: "Miko",

    commands: [
      {
        name: "YouTube",
        global: true,
        match: "youtube",
        nice: "YouTube",
        minConfidence: 0.5,
        pageFn: () => {
          window.location.href = "https://www.youtube.com/";
        },
      },
      {
        name: "Wikipedia",
        global: true,
        match: "wikipedia",
        pageFn: () => {
          window.location.href = "https://www.wikipedia.org/";
        },
      },
      {
        name: "Facebook",
        global: true,
        match: "facebook",
        pageFn: () => {
          window.location.href = "https://www.facebook.com/";
        },
      },
      {
        name: "Twitter",
        global: true,
        match: "twitter",
        pageFn: () => {
          window.location.href = "https://twitter.com/";
        },
      },
      {
        name: "Instagram",
        global: true,
        match: "instagram",
        pageFn: () => {
          window.location.href = "https://www.instagram.com/";
        },
      },
      {
        name: "Amazon",
        global: true,
        match: "amazon",
        pageFn: () => {
          window.location.href = "https://www.amazon.com/";
        },
      },
      {
        name: "Ebay",
        global: true,
        match: "ebay",
        pageFn: () => {
          window.location.href = "https://www.ebay.com/";
        },
      },
      {
        name: "VK",
        global: true,
        match: "vk",
        minConfidence: 0.5,
        pageFn: () => {
          window.location.href = "https://vk.com";
        },
      },
      {
        name: "Netflix",
        global: true,
        match: "netflix",
        minConfidence: 0.5,
        pageFn: () => {
          window.location.href = "https://www.netflix.com";
        },
      },
      {
        name: "Twitch",
        global: true,
        match: "twitch",
        pageFn: () => {
          window.location.href = "https://twitch.tv";
        },
      },
      {
        name: "New York Times",
        global: true,
        match: "new york times",
        pageFn: () => {
          window.location.href = "https://www.nytimes.com";
        },
      },
      {
        name: "Github",
        global: true,
        match: "github",
        onlyFinal: true,
        pageFn: () => {
          window.location.href = "https://github.com/";
        },
      },
      {
        name: "Product Hunt",
        global: true,
        match: "product hunt",
        pageFn: () => {
          window.location.href = "https://www.producthunt.com";
        },
      },
    ],
  },
};
