import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';var p,E=[240,120,90,60,36,24,12,6],A=400,g="autoscroll-index",i=[],D=0;function h(){window.clearInterval(p),PluginBase.util.removeContext("Auto Scroll")}function f(u=0){let e,t=window.outerWidth/window.document.documentElement.clientWidth,l=Math.round(1/t*10)/10+.1,o=PluginBase.getPluginOption("Scroll",g),a=(typeof o=="number"?o:3)+u;a>=E.length?a=E.length-1:a<0&&(a=0),console.log("scroll speed",a),PluginBase.setPluginOption("Scroll",g,a),window.clearInterval(p);let r=w();r&&(p=window.setInterval(()=>{let n=r.scrollY||r.scrollTop;r.scrollBy(0,l),e&&(n-e<=0||n-e>l*1.5)&&(console.log("stopping due to detected scroll activity"),h()),e=n},E[a]))}function F(u,e,t){let l=e==="y"?["scrollTop","height"]:["scrollLeft","width"],o=u[l[0]];if(o<t){let a=u[l[0]];u[l[0]]=u.getBoundingClientRect()[l[1]],o=u[l[0]],u[l[0]]=a}return o>=t}function B(u){let e=u.currentTarget,t=u.target;if(!e.contains(t))return;let l=i.lastIndexOf(t);if(l===-1){for(var o=i.length-1;o>=0;o--)if(i[o].contains(t)){l=o;break}l===-1&&console.warn("cannot find scrollable",u.target)}D=l}function v(){console.time("getScrollableEls");let u=S(document.body,NodeFilter.SHOW_ELEMENT,function(e){return F(e,"y",16)&&e.scrollHeight-e.offsetHeight>60||F(e,"x",16)&&e.scrollWidth-e.scrollWidth>60});return u.sort(function(e,t){return t.contains(e)?1:e.contains(t)?-1:t.scrollHeight*t.scrollWidth-e.scrollHeight*e.scrollWidth}),(document.scrollingElement.scrollHeight>window.innerHeight||document.scrollingElement.scrollWidth>window.innerWidth)&&u.unshift(document.scrollingElement),u.forEach(function(e){e.removeEventListener("mousedown",B),e.addEventListener("mousedown",B)}),console.timeEnd("getScrollableEls"),u}function S(u,e,t){let l=[],o,a=document.createNodeIterator(u,e,null);for(;o=a.nextNode();)t(o)&&l.push(o),o.shadowRoot&&l.push(...S(o.shadowRoot,e,t));return l}function w(){let u=window,e=document.getElementById(`${PluginBase.util.getNoCollisionUniqueAttr()}-helpBox`);return e&&e.scrollHeight>e.clientHeight?u=e:document.location.host==="docs.google.com"?u=document.querySelector(".kix-appview-editor"):document.scrollingElement.scrollHeight>window.innerHeight||document.scrollingElement.scrollWidth>window.innerWidth?u=document.scrollingElement:(i=v(),u=i[D]),u}async function d({top:u,left:e},t=!0,l=w()){if(l){let o={top:u,left:e,behavior:"smooth"};t?l.scrollBy(o):l.scrollTo(o)}return h(),await PluginBase.util.sleep(A)}function c(u,e=!1){let t=/\.pdf$/.test(document.location.pathname),l,o;switch(u){case"u":case"hu":l=-.85,o=38;break;case"d":case"hd":l=.85,o=40;break;case"l":l=-.7,o=37;break;case"r":l=.7,o=39;break;case"t":l=0,o=36;break;case"b":l=1e4,o=35;break}let a=e?.5:1;if(u==="hd"||u==="hu"){let n=PluginBase.util.getHUDEl()[0].querySelector("#help .cmds");return d({top:n.offsetHeight*l},!0,n)}else if(t){let r;return u==="t"||u==="b"?r=[o]:r=new Array(14*a).fill(o),chrome.runtime.sendMessage({type:"pressKeys",payload:{codes:r,nonChar:!0}}),PluginBase.util.sleep(100)}else{if(u==="l"||u==="r")return d({left:window.innerWidth*l*a});{let n=u!=="t";return u==="b"&&document.body.scrollHeight!=0?d({top:document.documentElement.scrollHeight}):d({top:window.innerHeight*l*a},n)}}}function x(u){return u?document.querySelector(u).scrollTop:window.scrollY}async function s(u,e,t,l,o,a={greater:!0}){await t.url(l),u.is(await t.getUrl(),l),(a.zero||a.lessThan)&&await e("bottom");let r=await t.execute(x,o);await e();let n=await t.execute(x,o);a.greater?u.true(n>r,`scrollStart: ${r} scrollEnd: ${n} for ${l}`):a.lessThan?u.true(n<r,`scrollStart: ${r} scrollEnd: ${n} for ${l}`):a.zero&&u.is(n,0,`scrollStart: ${r} scrollEnd: ${n} for ${l}`)}var m={...PluginBase,languages:{},niceName:"Scroll",description:"Commands for scrolling the page.",icon:`<svg xmlns="http://www.w3.org/2000/svg" version="1" viewBox="0 0 128 128"><g class="iconic-move-sm iconic-container iconic-sm" transform="scale(8)">
        <path stroke="#000" stroke-width="2" stroke-linecap="square" d="M8 3v11" fill="none"></path>
        <path stroke="#000" stroke-width="2" stroke-linecap="square" d="M13 8h-10" fill="none"></path>
        <path d="M8 0l-3 3h6z"></path>
        <path d="M16 8l-3-3v6z"></path>
        <path d="M0 8l3 3v-6z"></path>
        <path d="M8 16l3-3h-6z"></path>
    </g></svg>`,version:"4.0.0",match:/.*/,authors:"Miko",homophones:{autoscroll:"auto scroll",horoscrope:"auto scroll",app:"up",upwards:"up",upward:"up",dumb:"down",gout:"down",downwards:"down",town:"down",don:"down",downward:"down",boreham:"bottom",volume:"bottom",barton:"bottom",barn:"bottom",born:"bottom",littledown:"little down","put it down":"little down","will down":"little down",middletown:"little down","little rock":"little up","lidl up":"little up","school little rock":"scroll little up","time of the page":"top of the page",scrolltop:"scroll top","scrub top":"scroll top",talk:"top",chop:"top",school:"scroll",screw:"scroll",small:"little",flower:"slower",lower:"slower",pastor:"faster",master:"faster","auto spa":"auto scroll",scallop:"scroll up","school health":"scroll help",prohealth:"scroll help"},contexts:{"Auto Scroll":{commands:["Speed Up","Slow Down","Stop"]}},destroy(){h()},commands:[{name:"Scroll Down",match:["[/scroll ]down"],activeDocument:!0,pageFn:()=>c("d"),test:{google:async(u,e,t)=>{await s(u,e,t,"https://www.google.com/search?q=lipsurf")},gdocs:async(u,e,t)=>{await s(u,e,t,"https://docs.google.com/document/d/1Tdfk2UvIXxwZOoluLh6o1kN1CrKHWbXcmUIsDKRHTEI/edit",".kix-appview-editor")},gmail:async(u,e,t)=>{await s(u,e,t,`${u.context.localPageDomain}/gmail-long-message.html`,"#\\:3")},whatsapp:async(u,e,t)=>{await s(u,e,t,`${u.context.localPageDomain}/whatsapp.html`,"._1_keJ")},quip:async(u,e,t)=>{await s(u,e,t,`${u.context.localPageDomain}/quip.html`,".parts-screen-body.scrollable")},iframe:async(u,e,t)=>{let l=()=>{var r;return(r=document.querySelector("iframe").contentDocument)==null?void 0:r.querySelector("._1_keJ").scrollTop};await t.url(`${u.context.localPageDomain}/scroll-iframe.html`),await(await t.$("iframe")).click();let o=await t.execute(l);await e();let a=await t.execute(l);u.true(a>o,`scrollStart: ${o} scrollEnd: ${a}`)},"wip pdf":async(u,e,t)=>{let l=()=>t.execute(()=>document.scrollingElement.scrollTop),o=await l();await t.url(`${u.context.localPageDomain}/sample.pdf`),await e();let a=await l();u.fail()}}},{name:"Scroll Up",match:["[/scroll ]up"],activeDocument:!0,pageFn:()=>c("u")},{name:"Auto Scroll",match:["[auto/automatic] scroll"],description:"Continuously scroll down the page slowly, at a reading pace.",activeDocument:!0,pageFn:()=>{PluginBase.util.addContext("Auto Scroll"),f()}},{name:"Slow Down",match:["slower","slow down"],description:"Slow down the auto scroll",activeDocument:!0,normal:!1,pageFn:()=>{f(-1)}},{name:"Speed Up",match:["faster","speed up"],activeDocument:!0,normal:!1,description:"Speed up the auto scroll",pageFn:()=>{f(1)}},{name:"Stop",match:["stop","pause"],activeDocument:!0,normal:!1,description:"Stop the auto scrolling.",pageFn:()=>{h()}},{name:"Scroll Bottom",match:["bottom[/ of page/of the page]","scroll [bottom/to bottom/to the bottom/to bottom of page/to the bottom of the page]"],activeDocument:!0,pageFn:()=>c("b"),test:async(u,e,t)=>{await s(u,e,t,"http://motherfuckingwebsite.com/")}},{name:"Scroll Top",match:["top[/ of page/ of the page]","scroll [top/to top/to the top/to the top of the page]"],activeDocument:!0,pageFn:()=>c("t"),test:async(u,e,t)=>{await s(u,e,t,"http://motherfuckingwebsite.com/",void 0,{zero:!0})}},{name:"Scroll Help Down",match:"scroll help down",pageFn:()=>c("hd",!0)},{name:"Scroll Help Up",match:"scroll help up",pageFn:()=>c("hu",!0)},{name:"Scroll Down a Little",match:["little [scroll /]down"],activeDocument:!0,pageFn:()=>c("d",!0)},{name:"Scroll Up a Little",match:["little [scroll/ ]up"],activeDocument:!0,pageFn:()=>c("u",!0)},{name:"Scroll Left",match:"scroll left",activeDocument:!0,pageFn:()=>c("l")},{name:"Scroll Right",match:"scroll right",activeDocument:!0,pageFn:()=>c("r")}]};m.languages.es={niceName:"Desplazarse",authors:"Miko",commands:{"Scroll Bottom":{name:"Desplazarse Hasta Abajo",match:["desplazarse hasta abajo","parte inferior","final"]},"Scroll Top":{name:"Desplazarse Hasta Arriba",match:["[desplazarse hasta] [/parte ]arriba","cima","parte arriba"]},"Scroll Down":{name:"Desplazarse Hacia Abajo",match:["[/desplazarse hacia ]abajo"]},"Scroll Up":{name:"Desplazarse Hacia Arriba",match:["[/desplazarse hacia ]arriba"]},"Scroll Right":{name:"Desplazarse a la Derecha",match:["desplazarse a la derecha"]},"Scroll Left":{name:"Desplazarse a la Izquierda",match:["desplazarse a la izquierda"]},"Scroll Down a Little":{name:"Un Poco Abajo",match:["un poco abajo"]},"Scroll Up a Little":{name:"Un Poco Arriba",match:["un poco arriba"]},"Auto Scroll":{name:"Desplazamiento Automático",match:"desplazamiento automático"},Slower:{name:"Más Lento",match:"lento"},Faster:{name:"Más Rápido",match:"rápido"},"Scroll Help Down":{name:"Desplazar la Ayuda Abajo",match:"ayuda abajo"},"Scroll Help Up":{name:"Desplazar la Ayuda Arriba",match:"ayuda arriba"}}};m.languages.fr={niceName:"Défilement",authors:"Byron Kearns, Miko",homophones:{"des fils vers le bas":"défile vers le bas","des fils vers le haut":"défile vers le haut",ralenti:"ralentis","défilé en haut":"défiler en haut","des fils en haut":"défile en haut","des fils un peu vers le bas":"défile un peu en bas","des fils un peu vers le haut":"défile un peu vers le haut"},commands:{"Scroll Down":{name:"Défilement vers le Bas",match:["[/faire défiler /défiler ]vers le bas"]},"Scroll Up":{name:"Défilement vers le Haut",match:["[/faire défiler /défiler ]vers le haut"]},"Auto Scroll":{name:"Défilement Automatique",match:["défilement [automatique/auto]"]},"Slow Down":{name:"Ralentir",match:["plus lentement","ralentir"]},"Speed Up":{name:"Accélérer",match:["plus vite","accélérer"]},Stop:{name:"Arrêter",match:["arrêter","pause"]},"Scroll Bottom":{name:"Défilement en Bas",match:["en bas","bas de page","[faire défiler/défiler] en bas","aller en bas de la page"]},"Scroll Top":{name:"Défilement en Haut",match:["en haut","haut de page","[faire défiler/défiler] en haut","aller en haut de la page"]},"Scroll Down a Little":{name:"Défilement Léger vers le Bas",match:["[/faire défiler /défiler ]un peu vers le bas"]},"Scroll Up a Little":{name:"Défilement Léger vers le Haut",match:["[/faire défiler /défiler ]un peu vers le haut"]},"Scroll Left":{name:"Défilement à Gauche",match:["[faire /]défiler à gauche","[/faire ]défiler vers la gauche"]},"Scroll Right":{name:"Défilement à Droite",match:["[faire /]défiler à droite","[/faire ]défiler vers la droite"]},"Scroll Help Down":{name:"Faire Défiler l’Aide vers le Bas",match:["[faire /]défiler l'aide vers le bas"]},"Scroll Help Up":{name:"Faire Défiler l’Aide vers le Haut",match:["[faire /]défiler l'aide vers le haut"]}}};m.languages.ja={niceName:"スクロール",description:"ページのスクロールを管理できます。",homophones:{しーた:"した",ちーたー:"した"},authors:"Miko, Hiroki Yamazaki",commands:{"Scroll Bottom":{name:"ページの一番下に移動",match:["いちばんした"]},"Scroll Top":{name:"ページの一番上に移動",match:["いちばんうえ"]},"Scroll Down":{name:"下にスクロール",match:["した[/にすくろーる/へすくろーる]","だうん"]},"Scroll Up":{name:"上にスクロール",match:["うえ[/にすくろーる/へすくろーる]","あっぷ"]},"Scroll Right":{name:"右にスクロール",match:["みぎ[/にすくろーる/へすくろーる]"]},"Scroll Left":{name:"左にスクロール",match:["ひだり[/にすくろーる/へすくろーる]"]},"Scroll Up a Little":{name:"少し上にスクロール",match:["すこしうえ[/にすくろーる/へすくろーる]"]},"Scroll Down a Little":{name:"少し下にスクロール",match:["すこしした[/にすくろーる/へすくろーる]"]},"Auto Scroll":{name:"自動スクロール",match:"じどうすくろーる"},Faster:{name:"もっと早くスクロール",match:"はやく"},Slower:{name:"もっとゆっくりスクロール",match:"ゆっくり"},Stop:{name:"スクロールを止める",match:["すとっぷ","ていし","とめる"]},"Scroll Help Down":{name:"ヘルプ下",match:"へるぷした"},"Scroll Help Up":{name:"ヘルプ上",match:"へるぷうえ"}}};m.languages.ru={niceName:"Браузер",description:"Контроль действий в браузере, как-то: создание новой вкладки, навигация по странице (назад, вперед, вниз), вызов справки и т.д.",homophones:{тунис:"вниз",обнинск:"вниз",знаешь:"вниз",вниис:"вниз",beer:"вверх",вир:"вверх",вера:"вверх"},commands:{"Scroll Bottom":{name:"Прокрутить в конец страницы",match:["в конец","конец страницы"]},"Scroll Down a Little":{name:"Прокрутить немного вниз",match:["[немного/чутьчуть] вниз"]},"Scroll Down":{name:"Прокрутить вниз",match:["вниз"]},"Scroll Top":{name:"Вернуться на верх страницы",match:["на верх страницы"]},"Scroll Up a Little":{name:"Прокрутить немного вверх",match:["[немного/чутьчуть] вверх"]},"Scroll Up":{name:"Прокрутить вверх",match:["вверх"]},"Scroll Left":{name:"Прокрутить влево",match:["влево"]},"Scroll Right":{name:"Прокрутить вправо",match:["вправо"]},"Auto Scroll":{name:"Автопрокрутка",match:"автопрокрутка"}}};var C=m;export{C as default};
LS-SPLITallPlugins.Scroll=(()=>{var g,f=[240,120,90,60,36,24,12,6],F=400,p="autoscroll-index",a=[],m=0;function u(){window.clearInterval(g),PluginBase.util.removeContext("Auto Scroll")}function h(e=0){let l,n=window.outerWidth/window.document.documentElement.clientWidth,t=Math.round(1/n*10)/10+.1,o=PluginBase.getPluginOption("Scroll",p),r=(typeof o=="number"?o:3)+e;r>=f.length?r=f.length-1:r<0&&(r=0),console.log("scroll speed",r),PluginBase.setPluginOption("Scroll",p,r),window.clearInterval(g);let s=v();s&&(g=window.setInterval(()=>{let c=s.scrollY||s.scrollTop;s.scrollBy(0,t),l&&(c-l<=0||c-l>t*1.5)&&(console.log("stopping due to detected scroll activity"),u()),l=c},f[r]))}function w(e,l,n){let t=l==="y"?["scrollTop","height"]:["scrollLeft","width"],o=e[t[0]];if(o<n){let r=e[t[0]];e[t[0]]=e.getBoundingClientRect()[t[1]],o=e[t[0]],e[t[0]]=r}return o>=n}function S(e){let l=e.currentTarget,n=e.target;if(!l.contains(n))return;let t=a.lastIndexOf(n);if(t===-1){for(var o=a.length-1;o>=0;o--)if(a[o].contains(n)){t=o;break}t===-1&&console.warn("cannot find scrollable",e.target)}m=t}function H(){console.time("getScrollableEls");let e=E(document.body,NodeFilter.SHOW_ELEMENT,function(l){return w(l,"y",16)&&l.scrollHeight-l.offsetHeight>60||w(l,"x",16)&&l.scrollWidth-l.scrollWidth>60});return e.sort(function(l,n){return n.contains(l)?1:l.contains(n)?-1:n.scrollHeight*n.scrollWidth-l.scrollHeight*l.scrollWidth}),(document.scrollingElement.scrollHeight>window.innerHeight||document.scrollingElement.scrollWidth>window.innerWidth)&&e.unshift(document.scrollingElement),e.forEach(function(l){l.removeEventListener("mousedown",S),l.addEventListener("mousedown",S)}),console.timeEnd("getScrollableEls"),e}function E(e,l,n){let t=[],o,r=document.createNodeIterator(e,l,null);for(;o=r.nextNode();)n(o)&&t.push(o),o.shadowRoot&&t.push(...E(o.shadowRoot,l,n));return t}function v(){let e=window,l=document.getElementById(`${PluginBase.util.getNoCollisionUniqueAttr()}-helpBox`);return l&&l.scrollHeight>l.clientHeight?e=l:document.location.host==="docs.google.com"?e=document.querySelector(".kix-appview-editor"):document.scrollingElement.scrollHeight>window.innerHeight||document.scrollingElement.scrollWidth>window.innerWidth?e=document.scrollingElement:(a=H(),e=a[m]),e}async function d({top:e,left:l},n=!0,t=v()){if(t){let o={top:e,left:l,behavior:"smooth"};n?t.scrollBy(o):t.scrollTo(o)}return u(),await PluginBase.util.sleep(F)}function i(e,l=!1){let n=/\.pdf$/.test(document.location.pathname),t,o;switch(e){case"u":case"hu":t=-.85,o=38;break;case"d":case"hd":t=.85,o=40;break;case"l":t=-.7,o=37;break;case"r":t=.7,o=39;break;case"t":t=0,o=36;break;case"b":t=1e4,o=35;break}let r=l?.5:1;if(e==="hd"||e==="hu"){let c=PluginBase.util.getHUDEl()[0].querySelector("#help .cmds");return d({top:c.offsetHeight*t},!0,c)}else if(n){let s;return e==="t"||e==="b"?s=[o]:s=new Array(14*r).fill(o),chrome.runtime.sendMessage({type:"pressKeys",payload:{codes:s,nonChar:!0}}),PluginBase.util.sleep(100)}else{if(e==="l"||e==="r")return d({left:window.innerWidth*t*r});{let c=e!=="t";return e==="b"&&document.body.scrollHeight!=0?d({top:document.documentElement.scrollHeight}):d({top:window.innerHeight*t*r},c)}}}function y(e){return e?document.querySelector(e).scrollTop:window.scrollY}async function P(e,l,n,t,o,r={greater:!0}){await n.url(t),e.is(await n.getUrl(),t),(r.zero||r.lessThan)&&await l("bottom");let s=await n.execute(y,o);await l();let c=await n.execute(y,o);r.greater?e.true(c>s,`scrollStart: ${s} scrollEnd: ${c} for ${t}`):r.lessThan?e.true(c<s,`scrollStart: ${s} scrollEnd: ${c} for ${t}`):r.zero&&e.is(c,0,`scrollStart: ${s} scrollEnd: ${c} for ${t}`)}return{...PluginBase,destroy:function(){u()},commands:{"Scroll Down":{pageFn:()=>i("d")},"Scroll Up":{pageFn:()=>i("u")},"Auto Scroll":{pageFn:()=>{PluginBase.util.addContext("Auto Scroll"),h()}},"Slow Down":{pageFn:()=>{h(-1)}},"Speed Up":{pageFn:()=>{h(1)}},Stop:{pageFn:()=>{u()}},"Scroll Bottom":{pageFn:()=>i("b")},"Scroll Top":{pageFn:()=>i("t")},"Scroll Help Down":{pageFn:()=>i("hd",!0)},"Scroll Help Up":{pageFn:()=>i("hu",!0)},"Scroll Down a Little":{pageFn:()=>i("d",!0)},"Scroll Up a Little":{pageFn:()=>i("u",!0)},"Scroll Left":{pageFn:()=>i("l")},"Scroll Right":{pageFn:()=>i("r")}}}})();
LS-SPLITallPlugins.Scroll=(()=>{var u,d=[240,120,90,60,36,24,12,6],v=400,g="autoscroll-index",i=[],h=0;function f(){window.clearInterval(u),PluginBase.util.removeContext("Auto Scroll")}function P(e=0){let t,n=window.outerWidth/window.document.documentElement.clientWidth,o=Math.round(1/n*10)/10+.1,l=PluginBase.getPluginOption("Scroll",g),r=(typeof l=="number"?l:3)+e;r>=d.length?r=d.length-1:r<0&&(r=0),console.log("scroll speed",r),PluginBase.setPluginOption("Scroll",g,r),window.clearInterval(u);let s=p();s&&(u=window.setInterval(()=>{let c=s.scrollY||s.scrollTop;s.scrollBy(0,o),t&&(c-t<=0||c-t>o*1.5)&&(console.log("stopping due to detected scroll activity"),f()),t=c},d[r]))}function m(e,t,n){let o=t==="y"?["scrollTop","height"]:["scrollLeft","width"],l=e[o[0]];if(l<n){let r=e[o[0]];e[o[0]]=e.getBoundingClientRect()[o[1]],l=e[o[0]],e[o[0]]=r}return l>=n}function w(e){let t=e.currentTarget,n=e.target;if(!t.contains(n))return;let o=i.lastIndexOf(n);if(o===-1){for(var l=i.length-1;l>=0;l--)if(i[l].contains(n)){o=l;break}o===-1&&console.warn("cannot find scrollable",e.target)}h=o}function y(){console.time("getScrollableEls");let e=E(document.body,NodeFilter.SHOW_ELEMENT,function(t){return m(t,"y",16)&&t.scrollHeight-t.offsetHeight>60||m(t,"x",16)&&t.scrollWidth-t.scrollWidth>60});return e.sort(function(t,n){return n.contains(t)?1:t.contains(n)?-1:n.scrollHeight*n.scrollWidth-t.scrollHeight*t.scrollWidth}),(document.scrollingElement.scrollHeight>window.innerHeight||document.scrollingElement.scrollWidth>window.innerWidth)&&e.unshift(document.scrollingElement),e.forEach(function(t){t.removeEventListener("mousedown",w),t.addEventListener("mousedown",w)}),console.timeEnd("getScrollableEls"),e}function E(e,t,n){let o=[],l,r=document.createNodeIterator(e,t,null);for(;l=r.nextNode();)n(l)&&o.push(l),l.shadowRoot&&o.push(...E(l.shadowRoot,t,n));return o}function p(){let e=window,t=document.getElementById(`${PluginBase.util.getNoCollisionUniqueAttr()}-helpBox`);return t&&t.scrollHeight>t.clientHeight?e=t:document.location.host==="docs.google.com"?e=document.querySelector(".kix-appview-editor"):document.scrollingElement.scrollHeight>window.innerHeight||document.scrollingElement.scrollWidth>window.innerWidth?e=document.scrollingElement:(i=y(),e=i[h]),e}async function a({top:e,left:t},n=!0,o=p()){if(o){let l={top:e,left:t,behavior:"smooth"};n?o.scrollBy(l):o.scrollTo(l)}return f(),await PluginBase.util.sleep(v)}function b(e,t=!1){let n=/\.pdf$/.test(document.location.pathname),o,l;switch(e){case"u":case"hu":o=-.85,l=38;break;case"d":case"hd":o=.85,l=40;break;case"l":o=-.7,l=37;break;case"r":o=.7,l=39;break;case"t":o=0,l=36;break;case"b":o=1e4,l=35;break}let r=t?.5:1;if(e==="hd"||e==="hu"){let c=PluginBase.util.getHUDEl()[0].querySelector("#help .cmds");return a({top:c.offsetHeight*o},!0,c)}else if(n){let s;return e==="t"||e==="b"?s=[l]:s=new Array(14*r).fill(l),chrome.runtime.sendMessage({type:"pressKeys",payload:{codes:s,nonChar:!0}}),PluginBase.util.sleep(100)}else{if(e==="l"||e==="r")return a({left:window.innerWidth*o*r});{let c=e!=="t";return e==="b"&&document.body.scrollHeight!=0?a({top:document.documentElement.scrollHeight}):a({top:window.innerHeight*o*r},c)}}}function S(e){return e?document.querySelector(e).scrollTop:window.scrollY}async function H(e,t,n,o,l,r={greater:!0}){await n.url(o),e.is(await n.getUrl(),o),(r.zero||r.lessThan)&&await t("bottom");let s=await n.execute(S,l);await t();let c=await n.execute(S,l);r.greater?e.true(c>s,`scrollStart: ${s} scrollEnd: ${c} for ${o}`):r.lessThan?e.true(c<s,`scrollStart: ${s} scrollEnd: ${c} for ${o}`):r.zero&&e.is(c,0,`scrollStart: ${s} scrollEnd: ${c} for ${o}`)}return{...PluginBase,destroy:function(){f()},commands:{}}})();
