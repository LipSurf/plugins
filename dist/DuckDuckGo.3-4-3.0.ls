import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';var DuckDuckGo={...PluginBase,niceName:"DuckDuckGo",languages:{},description:"The duckduckgo search engine.",version:"3.4.3",match:/.*/,homophones:{search:"duck"},authors:"Aparajita Fishman",commands:[{name:"Search",description:"Do a duckduckgo search.",global:!0,match:"duck *",fn:async(transcript,searchQuery)=>{chrome.tabs.create({url:"https://duckduckgo.com/?q="+searchQuery,active:!0});}}]};

export default DuckDuckGo;LS-SPLITallPlugins.DuckDuckGo = (() => { var DuckDuckGo={...PluginBase,commands:{Search:{}}};

return DuckDuckGo;
 })()LS-SPLITallPlugins.DuckDuckGo = (() => { var DuckDuckGo={...PluginBase,commands:{Search:{}}};

return DuckDuckGo;
 })()