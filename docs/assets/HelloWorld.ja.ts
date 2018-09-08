// lipsurf-plugins/src/HelloWorld/HelloWorld.ja.ts
/// <reference path="../@types/plugin-interface.d.ts"/>
/// <reference path="HelloWorld.ts"/>

namespace HelloWorldPlugin {
    plugin.languages.ja = {
        niceName: "世界こんにちは",
        description: "何の役にも立たない",
        commands: {
            "Hello World": {
                name: "世界こんにちは",
                match: "せかいこんにちは"
            }
        }
    };
}
