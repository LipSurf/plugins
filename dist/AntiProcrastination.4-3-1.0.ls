import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';var c=/\bopen (.*) for (\d+) (seconds|minutes?|hours?)\b/,x=/\bopen\b/,r={...PluginBase,languages:{},niceName:"Anti-procrastination",description:"Tools for curbing procrastination.",match:/.*/,version:"4.3.1",apiVersion:2,authors:"Miko",commands:[{name:"Self Destructing Tab",description:"Open a new tab with x website for y time. Useful for limiting the time-sucking power of sites like facebook, reddit, twitter etc.",global:!0,match:{description:"open [website name] for [n] [seconds/minutes/hours]",fn:({preTs:i,normTs:e})=>{let u=e.match(c);if(u){let t=u.index+u[0].length;return[u.index,t,u]}else if(x.test(e))return!1}},delay:600,fn:async(i,e,u,t,n)=>{let a=Number(t);n.startsWith("minute")?a*=60:n.startsWith("hour")&&(a*=3600),~u.indexOf("hacker news")?u="news.ycombinator":(u==="reddit"||u==="ready")&&(u="old.reddit.com");let s=`https://${u.replace(/\s+/g,"").replace("'","").replace(".com","").replace("dot com","")}.com`,d=chrome.tabs.create({url:s,active:!0},o=>{setTimeout(()=>{chrome.tabs.remove(o.id)},a*1e3)})}}]};r.languages.ru={niceName:"Анти-прокрастинатор",authors:"Hanna",commands:{"Self Destructing Tab":{name:"Самозакрывающаяся вкладка",description:"Открывает новую вкладку только на заданное время. Удобно для ограничения пользования сайтами-времяубийцами вроде facebook, reddit, twitter etc.",match:{description:'Скажите "открыть [название сайта] на x секунд/минут/часов"',fn:({preTs:i,normTs:e})=>{let u=e.match(/\b\xBE\x82\xBA\x80\x8B\x82\x8C (.*) \xBD\xB0 (\d+) (\x81\xB5\xBA\x83\xBD\xB4(?:\x83|\x8B)?|\xBC\xB8\xBD\x83\x82(?:\x83|\x8B)?|\x87\xB0\x81(?:\xB0|\xBE\xB2)?)\b/);if(u){let t=u.index+u[0].length;return u[3]=u[3].startsWith("минут")?"minute":u[3].startsWith("час")?"hour":"second",[u.index,t,u]}else if(/\b\xBE\x82\xBA\x80\x8B\x82\x8C\b/.test(e))return!1}},delay:600}}};var l=r;export{l as default};
LS-SPLITallPlugins.AntiProcrastination=(()=>{var n=/\bopen (.*) for (\d+) (seconds|minutes?|hours?)\b/,s=/\bopen\b/,r={...PluginBase,commands:{"Self Destructing Tab":{match:{en:({preTs:u,normTs:t})=>{let x=t.match(n);if(x){let e=x.index+x[0].length;return[x.index,e,x]}else if(s.test(t))return!1},ru:({preTs:u,normTs:t})=>{let x=t.match(/\b\xBE\x82\xBA\x80\x8B\x82\x8C (.*) \xBD\xB0 (\d+) (\x81\xB5\xBA\x83\xBD\xB4(?:\x83|\x8B)?|\xBC\xB8\xBD\x83\x82(?:\x83|\x8B)?|\x87\xB0\x81(?:\xB0|\xBE\xB2)?)\b/);if(x){let e=x.index+x[0].length;return x[3]=x[3].startsWith("минут")?"minute":x[3].startsWith("час")?"hour":"second",[x.index,e,x]}else if(/\b\xBE\x82\xBA\x80\x8B\x82\x8C\b/.test(t))return!1}}}}};return r})();
LS-SPLITallPlugins.AntiProcrastination=(()=>{var n=/\bopen (.*) for (\d+) (seconds|minutes?|hours?)\b/,s=/\bopen\b/,r={...PluginBase,commands:{"Self Destructing Tab":{match:{en:({preTs:u,normTs:t})=>{let x=t.match(n);if(x){let e=x.index+x[0].length;return[x.index,e,x]}else if(s.test(t))return!1},ru:({preTs:u,normTs:t})=>{let x=t.match(/\b\xBE\x82\xBA\x80\x8B\x82\x8C (.*) \xBD\xB0 (\d+) (\x81\xB5\xBA\x83\xBD\xB4(?:\x83|\x8B)?|\xBC\xB8\xBD\x83\x82(?:\x83|\x8B)?|\x87\xB0\x81(?:\xB0|\xBE\xB2)?)\b/);if(x){let e=x.index+x[0].length;return x[3]=x[3].startsWith("минут")?"minute":x[3].startsWith("час")?"hour":"second",[x.index,e,x]}else if(/\b\xBE\x82\xBA\x80\x8B\x82\x8C\b/.test(t))return!1}}}}};return r})();
