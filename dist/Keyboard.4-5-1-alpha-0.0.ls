import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';var e={languages:{ja:{niceName:"キーボード",description:"キーボードのキーを個別に声で押せます。",authors:"Hiroki Yamazaki, Miko",commands:{"Press Tab":{name:"Tabを押す",description:"Tabキーを押すのと同じ動作をします。",match:"たぶをおす"},"Press Enter":{name:"Enterを押す",description:"Enterキーを押すのと同じ動作をします。",match:"えんたーをおす"},"Press Down":{name:"↓を押す",description:"↓キーを押すのと同じ動作をします。",match:"したをおす"},"Press Up":{name:"↑を押す",description:"↑キーを押すのと同じ動作をします。",match:"うえをおす"},"Press Left":{name:"←を押す",description:"←キーを押すのと同じ動作をします。",match:"ひだりをおす"},"Press Right":{name:"→を押す",description:"→キーを押すのと同じ動作をします。",match:"みぎをおす"}}},ru:{niceName:"Клавиатура",authors:"Dmitri H., Miko",commands:{"Press Enter":{name:"нажмите ввод",match:["ввод","войти"]},"Press Left":{name:"нажмите влево",match:"нажмите влево"},"Press Right":{name:"нажмите вправо",match:"нажмите вправо"},"Press Up":{name:"нажмите вверх",match:"нажмите вверх"},"Press Down":{name:"нажмите вниз",match:"нажмите вниз"},"Press Tab":{name:"нажмите вкладку",match:"нажмите вкладку"}}}},niceName:"Keyboard",description:"For pressing individual keyboard buttons with your voice.",version:"4.5.1-alpha.0",apiVersion:2,match:/.*/,authors:"Miko",homophones:{pressed:"press",dress:"press","present tab":"press tab"},commands:[{name:"Press Key Combination",description:'Simulate pressing keyboard keys. Keys should separated by the "+" symbol (e.g. "press ctrl+p" or "press alt+shift+tab"). Examples of special keys: left arrow, enter, tab, home, end, page down, ctrl, alt, shift, f1, backspace, delete.',match:"press *"},{name:"Press Tab",description:"Equivalent of hitting the tab key.",match:"press tab"},{name:"Press Enter",description:"Equivalent of hitting the enter key.",match:"press enter"},{name:"Press Down",description:"Equivalent of hitting the down arrow key.",match:"press down"},{name:"Press Up",description:"Equivalent of hitting the up arrow key.",match:"press up"},{name:"Press Left",description:"Equivalent of hitting the left arrow key.",match:"press left"},{name:"Press Right",description:"Equivalent of hitting the right arrow key.",match:"press right"}]};export{e as default};
LS-SPLITallPlugins.Keyboard=(()=>{function c(...s){chrome.runtime.sendMessage({type:"pressKeys",payload:{codesWModifiers:s,nonChar:!0}})}function n(s,o){return c(o),!0}function p(s,o="+"){let e=[],a=-1;do{let r=a+1;a=s.indexOf(o,r+1);let t;a!==-1?t=s.substring(r,a):t=s.substring(r),e.push(t)}while(a!==-1);return e}var k=/f\d{1,2}/;function i(s){let o=p(s.toLowerCase()),e,a=0,r;for(let t of o)switch(r=t,t){case"shift":a+=8;break;case"cmd":a+=4;break;case"ctrl":a+=2;break;case"alt":a+=1;break;case"down arrow":r="arrowdown",e=40;break;case"up arrow":r="arrowup",e=38;break;case"left arrow":r="arrowleft",e=37;break;case"right arrow":r="arrowright",e=39;break;case"tab":e=9;break;case"pause":case"break":case"pause/break":r="pause/break",e=19;break;case"home":e=36;break;case"end":e=35;break;case"insert":e=45;break;case"caps lock":e=20;break;case"enter":e=13;break;case"page up":e=33;break;case"page down":e=34;break;case"delete":e=46;break;case"backspace":e=8;break;case"print screen":e=44;break;case"escape":e=27;break;default:k.test(t)?e=111+ +t.substring(1):e=t.toUpperCase().charCodeAt(0);break}return{key:r,code:e,modifiers:a}}async function f(s,o,e,a){await a.url("https://keycode.info/"),e(`press ${s}`);let r=(await(await a.$(".keycode-display")).getText()).trim().toLowerCase(),t=(await(await a.$(".card.item-key .main-description")).getText()).trim().toLowerCase(),d=i(s);o.is(d.key,t),o.is(d.code,r)}var b={...PluginBase,commands:{"Press Key Combination":{pageFn:(s,{preTs:o,normTs:e})=>{let a=i(o);c(a)}},"Press Tab":{pageFn:()=>{n("Tab",{code:9})||c({code:9})}},"Press Enter":{pageFn:()=>{n("Enter",{code:13})||c({code:13})}},"Press Down":{pageFn:()=>{n("ArrowDown",{code:40})||c({code:40})}},"Press Up":{pageFn:()=>{n("ArrowUp",{code:38})||c({code:38})}},"Press Left":{pageFn:()=>{n("ArrowLeft",{code:37})||c({code:37})}},"Press Right":{pageFn:()=>{n("ArrowRight",{code:39})||c({code:39})}}}};return b})();
LS-SPLIT