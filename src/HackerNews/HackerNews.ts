/// <reference types="@lipsurf/types/extension"/>
declare const PluginBase: IPluginBase;

function getThingAtIndex(index: number): HTMLElement | undefined {
  return <HTMLElement>(
    document.evaluate(
      `//table[contains(@class, 'itemlist')]//tr//td//*[contains(@class, 'rank')][contains(text(), "${index}")]/ancestor-or-self::tr[contains(@class, 'athing')]`,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE
    ).singleNodeValue
  );
}

function isInComments(): boolean {
  return window.location.pathname === "/item";
}

function clickIfExists(el: HTMLElement | undefined | null) {
  if (el) el.click();
}

export default <IPluginBase & IPlugin>{
  ...PluginBase,
  ...{
    niceName: "Hacker News",
    description: "Basic controls for news.ycombinator.com.",
    version: "4.7.0-alpha.3",
    apiVersion: 2,
    match: /^https?:\/\/news\.ycombinator\.com/,
    homophones: {
      floor: "more",
      "4": "more",
    },
    authors: "Miko",

    commands: [
      {
        name: "Hacker News",
        description: "Go to news.ycombinator.com.",
        global: true,
        match: ["hacker news", "y combinator"],
        pageFn: () => {
          window.location.href = "https://news.ycombinator.com/";
        },
      },
      {
        name: "Upvote",
        description: "Upvote a post.",
        match: ["upvote[ #/]"],
        pageFn: (transcript, index: number) => {
          let parent: HTMLElement | Document | undefined = document;
          if (!isInComments()) {
            parent = getThingAtIndex(index);
          }
          if (parent)
            clickIfExists(
              parent.querySelector<HTMLElement>('.votearrow[title="upvote"]')
            );
        },
      },
      {
        name: "Visit Comments",
        description: "See the comments for a given post.",
        match: ["[comments/discuss] #"],
        pageFn: (transcript, index: number) => {
          let thing = getThingAtIndex(index);
          if (thing)
            clickIfExists(
              thing.nextElementSibling!.querySelector<HTMLElement>(
                '.subtext a[href^="item?id="]'
              )
            );
        },
      },
      {
        name: "Visit Post",
        description: "Visit a post.",
        match: ["visit[ #/]"],
        pageFn: (transcript, index: number) => {
          let parent: HTMLElement | Document | undefined = document;
          if (!isInComments()) {
            parent = getThingAtIndex(index);
          }
          if (parent)
            clickIfExists(parent.querySelector<HTMLElement>("a.storylink"));
        },
      },
      {
        name: "Next Page",
        description: "Show more Hacker News items.",
        match: ["next page", "[show /]more"],
        pageFn: (transcript, index: number) => {
          clickIfExists(document.querySelector<HTMLElement>("a.morelink"));
        },
      },
    ],
  },
};
