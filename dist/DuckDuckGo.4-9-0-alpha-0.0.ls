import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';var o={languages:{},niceName:"DuckDuckGo",description:"The duckduckgo search engine.",version:"4.9.0-alpha.0",apiVersion:2,match:/.*/,homophones:{search:"duck"},authors:"Aparajita Fishman",commands:[{name:"Search",description:"Do a duckduckgo search.",global:!0,match:"duck *",fn:(c,{preTs:a,normTs:e})=>{chrome.tabs.create({url:`https://duckduckgo.com/?q=${a}`,active:!0})}}]};export{o as default};
LS-SPLITLS-SPLIT