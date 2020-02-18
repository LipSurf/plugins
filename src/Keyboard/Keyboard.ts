/**
 * TODO: add arrows, tab, enter tests for Google Sheets
 * 
 */
/// <reference types="lipsurf-plugin-types"/>
declare const PluginBase: IPluginBase;

export function backendPressKey(codes: number|number[]) {
    // force into array
    const codesArr = (<number[]>[]).concat(codes);
    chrome.runtime.sendMessage({ type: 'pressKeys', payload: { codes: codesArr, nonChar: true } });
}

function pressKey(key: string, code: number = 0): boolean {
    backendPressKey(code);
    return true;
    // const activeEle = document.activeElement;
    // console.log(activeEle);
    // if (activeEle) {
    //     const code = key.charCodeAt(0);
    //     const evtDeets = {
    //         bubbles: true,
    //         cancelable: true,
    //         key,
    //         code: key,
    //         location: 0,
    //         // @ts-ignore
    //         keyCode: code,
    //         // deprecated, but we include it
    //         which: code,
    //     }
    //     activeEle.dispatchEvent(new KeyboardEvent("keydown", evtDeets));
    //     activeEle.dispatchEvent(new KeyboardEvent("keyup", evtDeets));
    //     activeEle.dispatchEvent(new KeyboardEvent("keypress", evtDeets));
    //     return true;
    // }
    // return false;
}

export default <IPlugin & IPluginBase> {...PluginBase, ...{
    niceName: 'Keyboard',
    description: 'For pressing individual keyboard buttons with your voice.',
    version: '2.13.0',
    match: /.*/,
    authors: "Miko",
    homophones: {
        // causes issues with "press tab"
        // 'preston': 'press down',
        'pressed': 'press',
    },
    commands: [
        {
            name: 'Press Tab',
            description: 'Equivalent of hitting the tab key.',
            match: 'press tab',
            pageFn: () => {
                if (!pressKey("Tab", 9))
                    backendPressKey(9);
            }
        },
        {
            name: 'Press Enter',
            description: 'Equivalent of hitting the enter key.',
            match: 'press enter',
            pageFn: () => {
                if (!pressKey("Enter", 13))
                    backendPressKey(13);
            }
        },
        {
            name: 'Press Down',
            description: 'Equivalent of hitting the down arrow key.',
            match: 'press down',
            pageFn: () => {
                // gmail down arrow needs forcus when selecting recipient
                if (!pressKey("ArrowDown", 40))
                    // not sure of the use case for this
                    backendPressKey(40);
            }
        },
        {
            name: 'Press Up',
            description: 'Equivalent of hitting the up arrow key.',
            match: 'press up',
            pageFn: () => {
                if (!pressKey("ArrowUp", 38))
                    backendPressKey(38);
            }
        },
        {
            name: 'Press Left',
            description: 'Equivalent of hitting the left arrow key.',
            match: 'press left',
            pageFn: () => {
                if (!pressKey("ArrowLeft", 37))
                    backendPressKey(37);
            }
        },
        {
            name: 'Press Right',
            description: 'Equivalent of hitting the right arrow key.',
            match: 'press right',
            pageFn: () => {
                if (!pressKey("ArrowRight", 39))
                    backendPressKey(39);
            }
        },
    ]
}};
