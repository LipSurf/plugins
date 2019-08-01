import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';function getThingAtIndex(index){return $(`table.itemlist tr td .rank:contains("${index}")`).closest("tr.athing")}var HackerNewsPlugin={...PluginBase,niceName:"Hacker News",languages:{},description:"Basic controls for news.ycombinator.com.",version:"2.3.3",match:/^https?:\/\/news\.ycombinator\.com/,homophones:{floor:"more",4:"more"},authors:"Miko",commands:[{name:"Hacker News",global:!0,match:["hacker news","y combinator"],pageFn:async()=>{window.location.href="https://news.ycombinator.com/";}},{name:"Upvote",description:"Upvote a post",match:"upvote #",pageFn:async(transcript,index)=>{getThingAtIndex(index).find('.votearrow[title="upvote"]').get(0).click();}},{name:"Visit Comments",description:"See the comments for a given post",match:["comments #","discuss #"],pageFn:async(transcript,index)=>{getThingAtIndex(index).find('+tr .subtext a[href^="item?id="]').get(0).click();}},{name:"Visit Post",description:"Click a post",match:["click #","visit #"],pageFn:async(transcript,index)=>{getThingAtIndex(index).find("a.storylink").get(0).click();}},{name:"Next Page",description:"Show more hacker news items",match:["next page","show more","more"],pageFn:async(transcript,index)=>{$("a.morelink").get(0).click();}}]};HackerNewsPlugin.languages.ru={niceName:"Хакер Ньюс",description:"Плагин для сайта news.ycombinator.com.",authors:"Hanna",homophones:{"hacker news":"хакер ньюс"},commands:{Upvote:{name:"Голосовать за",description:"Голосует за пост названного номера",match:["голосовать за #"]},"Visit Comments":{name:"Открыть комментарии",description:"Открывает комментарии к выбранному посту",match:["комментарии #"]},"Visit Post":{name:"Открыть пост",description:"Кликает на пост названного номера",match:["кликнуть #","открыть #"]},"Next Page":{name:"Следующая страница",description:"Делает видимыми следующие посты",match:["следующая страница","больше"]}}};

export default HackerNewsPlugin;LS-SPLITallPlugins.HackerNews = (() => { function getThingAtIndex(index){return $(`table.itemlist tr td .rank:contains("${index}")`).closest("tr.athing")}var HackerNews_233_0_matching_cs_resolved = {...PluginBase,commands:{"Hacker News":{pageFn:async()=>{window.location.href="https://news.ycombinator.com/";}},Upvote:{pageFn:async(transcript,index)=>{getThingAtIndex(index).find('.votearrow[title="upvote"]').get(0).click();}},"Visit Comments":{pageFn:async(transcript,index)=>{getThingAtIndex(index).find('+tr .subtext a[href^="item?id="]').get(0).click();}},"Visit Post":{pageFn:async(transcript,index)=>{getThingAtIndex(index).find("a.storylink").get(0).click();}},"Next Page":{pageFn:async(transcript,index)=>{$("a.morelink").get(0).click();}}}};

return HackerNews_233_0_matching_cs_resolved;
 })()LS-SPLITallPlugins.HackerNews = (() => { var HackerNews_233_0_nonmatching_cs_resolved = {...PluginBase,commands:{"Hacker News":{pageFn:async()=>{window.location.href="https://news.ycombinator.com/";}}}};

return HackerNews_233_0_nonmatching_cs_resolved;
 })()