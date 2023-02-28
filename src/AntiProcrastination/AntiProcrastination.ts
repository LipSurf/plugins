/// <reference types="@lipsurf/types/extension"/>
declare const PluginBase: IPluginBase;

const OPEN_X_FOR_Y_TIME_REGX =
  /\bopen (.*) for (\d+) (seconds|minutes?|hours?)\b/;
const OPEN_REGX = /\bopen\b/;

export default <IPluginBase & IPlugin>{
  ...PluginBase,
  ...{
    niceName: "Anti-procrastination",
    description: "Tools for curbing procrastination.",
    match: /.*/,
    version: "4.9.0",
    apiVersion: 2,
    authors: "Miko",
    commands: [
      {
        name: "Self Destructing Tab",
        description:
          "Open a new tab with x website for y time. Useful for limiting the time-sucking power of sites like facebook, reddit, twitter etc.",
        global: true,
        match: {
          description: "open [website name] for [n] [seconds/minutes/hours]",
          fn: ({ preTs, normTs }) => {
            const match = normTs.match(OPEN_X_FOR_Y_TIME_REGX);
            if (match) {
              const endPos = match.index! + match[0].length;
              return [match.index!, endPos, match];
            } else if (OPEN_REGX.test(normTs)) {
              // ideally it would be smarter than just testing (open) but that functionality
              // should be built into the recognizer
              return false;
            }
          },
        },
        // delay is needed to get more accurate site name
        delay: 600,
        fn: async (
          transcript,
          fullMatch: string,
          siteStr: string,
          secondsStr: string,
          unit: string
        ) => {
          let seconds = Number(secondsStr);
          if (unit.startsWith("minute")) seconds *= 60;
          else if (unit.startsWith("hour")) seconds *= 3600;
          if (~siteStr.indexOf("hacker news")) siteStr = "news.ycombinator";
          else if (siteStr === "reddit" || siteStr === "ready")
            // faster than the redirect
            siteStr = "old.reddit.com";
          let site = `https://${siteStr
            .replace(/\s+/g, "")
            .replace("'", "")
            .replace(".com", "")
            .replace("dot com", "")}.com`;
          let id = chrome.tabs.create(
            {
              url: site,
              active: true,
            },
            (tab) => {
              setTimeout(() => {
                chrome.tabs.remove(tab.id!);
              }, seconds * 1000);
            }
          );
        },
      },
    ],
  },
};
