import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';var WikipediaPlugin={...PluginBase,niceName:"Wikipedia",languages:{},description:"The Wikipedia search engine.",version:"3.4.3",match:/.*/,homophones:{wiki:"wikipedia"},authors:"Aparajita Fishman",commands:[{name:"Wikipedia",description:"Do a wikipedia search.",global:!0,match:"wikipedia *",fn:async(transcript,searchQuery)=>{chrome.tabs.create({url:"https://wikipedia.org/w/index.php?search="+encodeURIComponent(searchQuery).replace(/%20/g,"+"),active:!0});}}]};WikipediaPlugin.languages.ru={niceName:"Wikipedia",description:"Поиск по Википедии.",authors:"Hanna",homophones:{"википедия":"wikipedia"},commands:{Wikipedia:{name:"Википедия",description:"Выполняет поиск по википедии. Скажите википедия [запрос].",match:["википедия *"]}}};

export default WikipediaPlugin;LS-SPLITallPlugins.Wikipedia = (() => { var WikipediaPlugin={...PluginBase,commands:{Wikipedia:{}}};

return WikipediaPlugin;
 })()LS-SPLITallPlugins.Wikipedia = (() => { var WikipediaPlugin={...PluginBase,commands:{Wikipedia:{}}};

return WikipediaPlugin;
 })()