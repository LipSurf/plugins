// TODO: this doesn't need to be defined for some reason
/*
 * js loaded iframes will not have frame-beacon?
 */
import * as CT from  "../common/constants";
import { isInView } from "../common/util";

interface IIFrameParcel {
    name: string,
    id: string,
    frameId: string,
    data: {
        id: string,
        selector: string,
        fnNames: string[],
        tagName: string,
        attrs: string[]
    },
}

console.log(`beacon 1 ${window.location}`);
const UNIQUE_ATTR_NAME = `data-${CT.NO_COLLISION_UNIQUE_ATTR}-id`;
const MAX_IFRAME_RESPONSE_TIME = 1000;
const BEACON_ID = `${CT.NO_COLLISION_UNIQUE_ATTR}-beacon`;
// TODO: periodically clean-up?
// [id]: [thissubframeid]
let waitingSubFrames = {};
let processedPosts = {};

function makeId() {
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz";

    for (var i = 0; i < 15; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

let beacon = document.createElement('div');
beacon.id = BEACON_ID;
document.body.appendChild(beacon);

// we put a div with a special id in each iframe so 
// that we can check which iframes have had the frame-beacon attached
function hasRegisteredBeacon(ele: HTMLIFrameElement) {
    try {
        return ele.contentWindow.document.getElementById(BEACON_ID);
    } catch (e) {
        // cross-origin frame blocked
        return true;
    }
}

// We use window events (window.postMessage) because the plugin
// runs in the context of the *window* not the add-on and it's
// simpler than the chrome message passing.
window.addEventListener("message", function(evt) {
    let {
        data,
        // source, origin
    } = evt;
    let msg:IIFrameParcel = data;
    let msgParts = (msg.name && typeof(msg.name) === 'string') ? msg.name.split('_') : [null];
    let msgType = msgParts[msgParts.length - 1];
    if (msgType === 'recv') {
        console.log(`received from ${waitingSubFrames[msg.id].sender}`);
        if (msgParts[0] === 'get') {
            let tracker = waitingSubFrames[msg.id];
            let index = tracker.pending.indexOf(msg.frameId);
            if (~index) {
                tracker.pending.splice(index, 1);
                tracker.res.push(msg.data);
                if (tracker.pending.length == 0) {
                    let isTop = top === window;
                    parent.postMessage({
                        isTop: isTop,
                        id: msg.id,
                        name: msg.name,
                        frameId: waitingSubFrames[msg.id].sender,
                        data: isTop ? tracker.res : [].concat.apply([], tracker.res)
                    }, '*');
                    // TODO: clear waitingSubFrames
                }
            }
        }
    } else {
        if (msgType && msg.id) {
            if (msgParts[0] === 'post') {
                // a post to all iframes msg
                if (!processedPosts[msg.id]) {
                    processedPosts[msg.id] = 1;
                    let selStr, selEle, frames;
                    if (msg.data.id) {
                        selStr = `[${UNIQUE_ATTR_NAME}="${msg.data.id}"]`;
                    } else {
                        selStr = msg.data.selector;
                    }
                    selEle = document.querySelector(selStr);
                    frames = document.getElementsByTagName('iframe');
                    if (selEle) {
                        for (let fnName of msg.data.fnNames) {
                            selEle[fnName]();
                        }
                    }
                    for (let i = 0; i < frames.length; i++) {
                        try {
                            if (!frames[i].src.startsWith('http://') && !frames[i].src.startsWith('https://')) {
                                continue;
                            }
                        } catch (e) {}
                        frames[i].contentWindow.postMessage(msg, frames[i].src);
                    }
                }
            } else {
                // get_send
                // don't respond until all the frames respond - or - MAX_IFRAME_RESPONSE_TIME elapses -- a backup in case 
                // of iframes that don't respond (dyn. generated iframes)

                // the following block should only execute once per frame per message
                let selEles = document.getElementsByTagName(msg.data.tagName);
                let tracker = waitingSubFrames[msg.id] = {
                    res: [],
                    sender: msg.frameId,
                    pending: [],    // ids of frames we're still waiting on
                };
                let frames = document.getElementsByTagName('iframe');

                // @ts-ignore: of works for htmlelements
                for (let selEle of selEles) {
                    // if it already has an id, re-use it (in case another query is using it)
                    let id = selEle.getAttribute(UNIQUE_ATTR_NAME);
                    if (!id) {
                        id = makeId();
                        selEle.setAttribute(UNIQUE_ATTR_NAME, id);
                    }
                    tracker.res.push([id]);
                    for (let attr of msg.data.attrs) {
                        let selAttr = selEle;
                        for (let nestedAttr of attr.split('.')) {
                            try {
                                if (nestedAttr.endsWith('()')) {
                                    selAttr = selAttr[nestedAttr.replace('()', '')]();
                                } else {
                                    selAttr = selAttr[nestedAttr];
                                }
                            } catch (e) { }
                        }

                        tracker.res[tracker.res.length - 1].push(selAttr);
                    }
                }

                for (let i = 0; i < frames.length; i++) {
                    let frameId = makeId();
                    try {
                        if (!frames[i].src.startsWith('http://') && !frames[i].src.startsWith('https://')) {
                            continue;
                        }
                    } catch (e) {
                        // might not have permission to access src
                        continue;
                    }

                    // only post to registered beacons 
                    // might need to inject beacon into dynamically created iframes if we find a site that needs this usecase
                    if (isInView($(frames[i])) && hasRegisteredBeacon(frames[i])) {
                        frames[i].contentWindow.postMessage({...msg, frameId}, frames[i].src);
                        console.log(`posted to ${frameId} id:${frames[i].id} name:${frames[i].name} class:${frames[i].classList} ${frames[i].src}`);
                        tracker.pending.push(frameId);
                    }
                }

                // response back up the chain
                // short circuits if there are no frames to work with
                setTimeout(() => {
                    let isTop = top === window;
                    parent.postMessage({
                        isTop: isTop,
                        id: msg.id,
                        name: `${msg.name}_recv`,
                        frameId: msg.frameId,
                        data: isTop ? tracker.res : [].concat.apply([], tracker.res)
                    }, '*');
                }, tracker.pending.length == 0 ? 0 : MAX_IFRAME_RESPONSE_TIME);
            }
        }
    }
}, false);