/// <reference path="./@types/store.d.ts" />
/// <reference path="./background/store.ts" />
/*
 * Included in the options.html script
 */
import riot from 'riot';
import { pick, omit }  from "lodash";
import { instanceOfDynamicMatch } from "./common/util";
import { Store, StoreSynced, } from "./background/store";
import { LANG_CODE_TO_NICE } from "./common/constants";
require('./tags/options-page.tag');

// what's shown on the options page
interface IPluginOptionsPageStore extends IGeneralOptions {
    cmdGroups: IPluginPref[]
}

interface IPluginPref {
    expanded: boolean,
    enabled: boolean,
    showMore: boolean,
    readonly id: string,
    readonly niceName: string,
    readonly version: string,
    readonly description?: string,
    readonly languages: LanguageCode[],
    commands: ICommandPref[]
    homophones?: IHomophonePref[]
}

interface ICommandPref {
    enabled: boolean,
    name: string,
    match: string | string[],
    // special description for dynamic match functions
    dynamicMatch: boolean,
    description?: string,
}

interface IHomophonePref {
    enabled: boolean,
    source: string,
    destination: string,
}


class OptionsPage extends StoreSynced {
    private pluginSelectedLanguage: LanguageCode;

    constructor(store: Store, private options: IPluginOptionsPageStore = <IPluginOptionsPageStore>{}) {
        super(store);
        riot.observable(this.options);
        riot.mount('options-page', {store: this.options, LANG_CODE_TO_NICE});
    }

    storeUpdated(newOptions: IOptions) {
        Object.assign(this.options,  {
            ... omit(newOptions, 'plugins'),
            cmdGroups: newOptions.plugins.map(plugin => {
                // default to en if the plugin doesn't support a language
                let localized: ILocalizedPluginData & { homophones?: IToggleableHomophone[]; };
                for (let lang of [newOptions.language, <LanguageCode>newOptions.language.substr(0, 2), <LanguageCode>"en"]) {
                    localized = plugin.localized[lang];
                    if (localized) {
                        this.pluginSelectedLanguage = lang;
                        break;
                    }
                }
                return {
                    commands: Object.keys(plugin.commands).map(cmdName => {
                        let matcher = localized.matchers[cmdName];
                        return {
                            dynamicMatch: instanceOfDynamicMatch(matcher.match),
                            match: instanceOfDynamicMatch(matcher.match) ? matcher.match.description : matcher.match,
                            enabled: plugin.commands[cmdName].enabled,
                            ... pick(matcher, 'name', 'description'),
                        }
                    }),
                    languages: Object.keys(plugin.localized),
                    ... pick(localized, 'niceName', 'description', 'homophones', ),
                    ... pick(plugin, 'version', 'expanded', 'enabled', 'showMore', 'id', ),
                };
            }),
        });
        // trigger exists once we call riot.observable
        (this.options as any).trigger('update', this.options);
    }

    save() {
        // whitelist properties to send up
        // TODO: don't understand why exactly ts-ignore is needed here
        // @ts-ignore
        this.store.save({
            ...omit(this.options, 'cmdGroups'),
            plugins: this.options.cmdGroups.map(cmdGroup => ({
                ...pick(cmdGroup, 'id', 'expanded', 'enabled', 'showMore'),
                localized: {[this.pluginSelectedLanguage]: {homophones: cmdGroup.homophones}},
                commands: cmdGroup.commands.reduce((memo, cmd) => 
                    Object.assign(memo, {[cmd.name]: pick(cmd, 'enabled')})
                , {}),
            }))
        });
    }

    reset() {
        this.store.resetPreferences();
    }
}


let store = new Store();
let options = new OptionsPage(store);


// so riot can access the options as well
window['options'] = options;
