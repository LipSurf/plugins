import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';var EnglishJapaneseDictionary={...PluginBase,niceName:"Dictionary for Japanese Language Learners",languages:{},description:"Quickly lookup words in a English ⬌ Japanese dictionary.",version:"3.4.3",match:/https?:\/\/\.jisho\.org/,authors:"Miko",commands:[{name:"Japanese Word Lookup",description:"Lookup an English word in an English ⬌ Japanese dictionary.",global:!0,match:"japanese dictionary *",pageFn:async(transcript,query)=>{window.location.href="https://jisho.org/search/"+query;}}]};EnglishJapaneseDictionary.languages.ja={niceName:"英語＜ー＞日本語の辞書",description:"英語と日本語の言葉を辞書でひいてごらん。",authors:"Miko",commands:{"Japanese Word Lookup":{name:"日本語の言葉を検索する",match:"じしょ*"}}};

export default EnglishJapaneseDictionary;LS-SPLITallPlugins.EnglishJapaneseDictionary = (() => { var EnglishJapaneseDictionary={...PluginBase,commands:{"Japanese Word Lookup":{pageFn:async(transcript,query)=>{window.location.href="https://jisho.org/search/"+query;}}}};

return EnglishJapaneseDictionary;
 })()LS-SPLITallPlugins.EnglishJapaneseDictionary = (() => { var EnglishJapaneseDictionary={...PluginBase,commands:{"Japanese Word Lookup":{pageFn:async(transcript,query)=>{window.location.href="https://jisho.org/search/"+query;}}}};

return EnglishJapaneseDictionary;
 })()