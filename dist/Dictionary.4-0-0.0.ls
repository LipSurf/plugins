import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';var u={...PluginBase,languages:{},niceName:"Dictionary",description:"Quickly lookup words in an English dictionary. Switch to another language to lookup words in the language's respective dictionary.",version:"4.0.0",apiVersion:2,match:[/https?:\/\/www\.merriam-webster\.com/,/https?:\/\/www\.weblio\.jp/],authors:"Miko",commands:[{name:"Lookup Word",description:"Lookup a word in the dictionary.",global:!0,match:"dictionary *",pageFn:async(a,{preTs:o,normTs:e})=>{PluginBase.util.getLanguage().startsWith("en")?window.location.href=`https://www.merriam-webster.com/dictionary/${e}`:window.location.href=`https://www.weblio.jp/content/${e}`}}]};u.languages.ja={niceName:"辞書",description:"辞書で言葉をひいてごらん",authors:"Miko",homophones:{},commands:{"Lookup Word":{name:"言葉を検索します",description:"「言葉」をひいて",match:"*をひく"}}};var i=u;export{i as default};
LS-SPLITallPlugins.Dictionary=(()=>({...PluginBase,commands:{"Lookup Word":{pageFn:async(t,{preTs:n,normTs:e})=>{PluginBase.util.getLanguage().startsWith("en")?window.location.href=`https://www.merriam-webster.com/dictionary/${e}`:window.location.href=`https://www.weblio.jp/content/${e}`}}}}))();
LS-SPLITallPlugins.Dictionary=(()=>({...PluginBase,commands:{"Lookup Word":{pageFn:async(t,{preTs:n,normTs:e})=>{PluginBase.util.getLanguage().startsWith("en")?window.location.href=`https://www.merriam-webster.com/dictionary/${e}`:window.location.href=`https://www.weblio.jp/content/${e}`}}}}))();
