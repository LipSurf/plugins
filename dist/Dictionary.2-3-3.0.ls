import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';var Dictionary={...PluginBase,niceName:"Dictionary",languages:{},description:"Quickly lookup words in an English dictionary. Switch to another language to lookup words in the language's respective dictionary.",version:"2.3.3",match:[/https?:\/\/www\.merriam-webster\.com/,/https?:\/\/www\.weblio\.jp/],authors:"Miko",commands:[{name:"Lookup Word",description:"Lookup a word in the dictionary.",global:!0,match:"dictionary *",pageFn:async(transcript,query)=>{PluginBase.util.getLanguage().startsWith("en")?window.location.href=`https://www.merriam-webster.com/dictionary/${query}`:window.location.href=`https://www.weblio.jp/content/${query}`;}}]};Dictionary.languages.ja={niceName:"辞書",description:"辞書で言葉をひいてごらん",authors:"Miko",homophones:{},commands:{"Lookup Word":{name:"言葉を検索します",description:"「言葉」をひいて",match:"*をひく"}}};

export default Dictionary;LS-SPLITallPlugins.Dictionary = (() => { var Dictionary_233_0_matching_cs_resolved = {...PluginBase,commands:{"Lookup Word":{pageFn:async(transcript,query)=>{PluginBase.util.getLanguage().startsWith("en")?window.location.href=`https://www.merriam-webster.com/dictionary/${query}`:window.location.href=`https://www.weblio.jp/content/${query}`;}}}};

return Dictionary_233_0_matching_cs_resolved;
 })()LS-SPLITallPlugins.Dictionary = (() => { var Dictionary_233_0_nonmatching_cs_resolved = {...PluginBase,commands:{"Lookup Word":{pageFn:async(transcript,query)=>{PluginBase.util.getLanguage().startsWith("en")?window.location.href=`https://www.merriam-webster.com/dictionary/${query}`:window.location.href=`https://www.weblio.jp/content/${query}`;}}}};

return Dictionary_233_0_nonmatching_cs_resolved;
 })()