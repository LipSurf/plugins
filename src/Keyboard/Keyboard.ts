/// <reference types="lipsurf-plugin-types"/>
declare const PluginBase: IPluginBase;

export function backendPressKey(codes: number|number[]) {
    // force into array
    const codesArr = (<number[]>[]).concat(codes);
    chrome.runtime.sendMessage({ type: 'pressKeys', payload: { codes: codesArr, nonChar: true } });
}

function pressKey(key: string): boolean {
    const activeEle = document.activeElement;
    if (activeEle) {
        activeEle.dispatchEvent(new KeyboardEvent("keydown", {bubbles : true, cancelable : true, key}));
        activeEle.dispatchEvent(new KeyboardEvent("keyup", {bubbles : true, cancelable : true, key}));
        return true;
    }
    return false;
}

export default <IPlugin & IPluginBase> {...PluginBase, ...{
    niceName: 'Keyboard',
    description: 'For pressing individual keyboard buttons with your voice.',
    version: '2.4.0',
    match: /.*/,
    authors: "Miko",
    homophones: {
        'preston': 'press down',
        'pressed': 'press',
    },
    commands: [
        {
            name: 'Press Tab',
            description: 'Equivalent of hitting the tab key.',
            match: 'press tab',
            pageFn: () => {
                if (!pressKey("Tab"))
                    backendPressKey(9);
            }
        },
        {
            name: 'Press Enter',
            description: 'Equivalent of hitting the enter key.',
            match: 'press enter',
            pageFn: () => {
                if (!pressKey("Enter"))
                    backendPressKey(13);
            }
        },
        {
            name: 'Press Down',
            description: 'Equivalent of hitting the down arrow key.',
            match: 'press down',
            pageFn: () => {
                // gmail down arrow needs forcus when selecting recipient
                if (!pressKey("ArrowDown"))
                    // not sure of the use case for this
                    backendPressKey(40);
            }
        },
        {
            name: 'Press Up',
            description: 'Equivalent of hitting the up arrow key.',
            match: 'press up',
            pageFn: () => {
                if (!pressKey("ArrowUp"))
                    backendPressKey(38);
            }
        },
        {
            name: 'Press Left',
            description: 'Equivalent of hitting the left arrow key.',
            match: 'press left',
            pageFn: () => {
                if (!pressKey("ArrowLeft"))
                    backendPressKey(37);
            }
        },
        {
            name: 'Press Right',
            description: 'Equivalent of hitting the right arrow key.',
            match: 'press right',
            pageFn: () => {
                if (!pressKey("ArrowRight"))
                    backendPressKey(39);
            }
        },
    ]
}};
