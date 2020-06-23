import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';var NewTab={...PluginBase,niceName:"New tab",languages:{},description:"Create a new empty tab.",version:"3.4.3",match:/.*/,homophones:{"open tab":"new tab"},authors:"Aparajita Fishman",commands:[{name:"New tab",description:"Create a new empty tab.",global:!0,match:"new tab",fn:async()=>{chrome.tabs.create({active:!0});}}]};

export default NewTab;LS-SPLITallPlugins.NewTab = (() => { var NewTab={...PluginBase,commands:{"New tab":{}}};

return NewTab;
 })()LS-SPLITallPlugins.NewTab = (() => { var NewTab={...PluginBase,commands:{"New tab":{}}};

return NewTab;
 })()