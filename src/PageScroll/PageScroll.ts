/*
 * LipSurf plugin for scrolling a page at a time
 */
/// <reference path="../@types/plugin-interface.d.ts"/>

namespace PageScrollPlugin {
  declare const PluginBase: IPlugin;

  interface IPageScrollPlugin extends IPlugin {

  }

  export let Plugin = Object.assign({}, PluginBase, {
    niceName: 'Page scroll',
    description: 'Scrolls up or down by 90% of the page height.',
    version: '1.0.0',
    apiVersion: '1',
    match: /.*/,
    homophones: {
      'go up': 'page up',
      'go down': 'page down',
    },
    authors: 'Aparajita Fishman',

    commands: [{
      name: 'Scroll by page',
      description: "Scroll up or down by 90% of the page height.",
      match: ['page up', 'page down'],
      pageFn: async (transcript: string) => {
        const match = transcript.match(/(?:page|go) (\w+)/);

        if (match) {
          let scrollAmount = Math.round(window.innerHeight * 0.9);

          if (match[1] === 'up') {
            scrollAmount = -scrollAmount;
          }

          window.scrollBy({
            top: scrollAmount,
            left: 0,
            behavior: 'smooth',
          });
        }
      }
    }
    ],
  });
}
