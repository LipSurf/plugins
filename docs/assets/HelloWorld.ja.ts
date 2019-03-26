// lipsurf-plugins/src/HelloWorld/HelloWorld.ja.ts
/// <reference types="lipsurf-plugin-types"/>
import { HelloWorldPlugin } from "./HelloWorld";

HelloWorldPlugin.Plugin.languages.ja = {
    niceName: "世界のご案内",
    description: "非常に単純のプラグイン",
    commands: {
        "Hello World": {
            name: "ハロー・ワールド",
            match: "はろーわーるど"
        }
    }
};
