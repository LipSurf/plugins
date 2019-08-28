import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';var NewTab_260_backend_resolved = {...PluginBase,niceName:"New tab",languages:{},description:"Create a new empty tab.",version:"2.6.0",match:/.*/,homophones:{"open tab":"new tab"},authors:"Aparajita Fishman",commands:[{name:"New tab",description:"Create a new empty tab.",global:!0,match:"new tab",fn:async()=>{chrome.tabs.create({active:!0});}}]};

export default NewTab_260_backend_resolved;LS-SPLITallPlugins.NewTab = (() => { var NewTab_260_0_matching_cs_resolved = {...PluginBase,commands:{"New tab":{}}};

return NewTab_260_0_matching_cs_resolved;
 })()LS-SPLITallPlugins.NewTab = (() => { var NewTab_260_0_nonmatching_cs_resolved = {...PluginBase,commands:{"New tab":{}}};

return NewTab_260_0_nonmatching_cs_resolved;
 })()