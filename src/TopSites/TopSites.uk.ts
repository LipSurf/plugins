/// <reference types="@lipsurf/types/extension"/>
import TopSitesPlugin from "./TopSites";

TopSitesPlugin.languages!.uk = {
  niceName: "Top Sites",
  description: "",
  homophones: {},
  authors: "Miko",

  commands: {
    YouTube: {
      name: "Youtube",
      match: ["youtube"],
    },

    Wikipedia: {
      name: "Wikipedia",
      match: ["wikipedia"],
    },

    Facebook: {
      name: "Facebook",
      match: ["facebook"],
    },

    Twitter: {
      name: "Twitter",
      match: ["twitter"],
    },

    Instagram: {
      name: "Instagram",
      match: ["instagram"],
    },
    Amazon: {
      name: "Amazon",
      match: ["amazon"],
    },
    Ebay: {
      name: "Ebay",
      match: ["ebay"],
    },
    VK: {
      name: "Вконтакте",
      match: ["вконтакте", "вк"],
    },
    Netflix: {
      name: "Netflix",
      match: ["netflix"],
    },
    Twitch: {
      name: "Twitch",
      match: ["twitch"],
    },
    "New York Times": {
      name: "New York Times",
      match: ["new york times"],
    },
    Github: {
      name: "Github",
      match: ["github"],
    },
    "Hacker News": {
      name: "Hacker News",
      match: ["hacker news", "y combinator"],
    },
    "Product Hunt": {
      name: "Product Hunt",
      match: ["product hunt"],
    },
  },
};
