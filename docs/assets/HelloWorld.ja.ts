// lipsurf-plugins/src/HelloWorld/HelloWorld.ja.ts
/// <reference types="lipsurf-types/extension"/>
import HelloWorld from "./HelloWorld";

HelloWorld.languages!.ja = {
  niceName: "世界のご案内",
  description: "非常に単純のプラグイン",
  commands: {
    "Hello World": {
      name: "ハロー・ワールド",
      match: "はろーわーるど",
    },
  },
};
