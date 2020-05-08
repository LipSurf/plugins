/// <reference types="lipsurf-types/extension"/>
import ScrollPlugin from "./Scroll";

ScrollPlugin.languages!.es = {
    niceName: "Desplazarse",
    authors: "Miko",
    commands: {
        "Scroll Bottom": {
            name: "Desplazarse Hasta Abajo",
            match: ["desplazarse hasta abajo", "parte inferior", "final"],
        },
        "Scroll Top": {
            name: "Desplazarse Hasta Arriba",
            match: ["desplazarse hasta arriba", "parte arriba", "cima"],
        },
        "Scroll Down": {
            name: "Desplazarse Hacia Abajo",
            match: ["abajo", "desplazarse hacia abajo"],
        },
        "Scroll Up": {
            name: "Desplazarse Hacia Arriba",
            match: ["arriba", "desplazarse hacia arriba"],
        },
        "Scroll Right": {
            name: "Desplazarse a la Derecha",
            match: ["desplazarse a la derecha"],
        },
        "Scroll Left": {
            name: "Desplazarse a la Izquierda",
            match: ["desplazarse a la izquierda"],
        },
        "Scroll Down a Little": {
            name: "Un Poco Abajo",
            match: ["un poco abajo"],
        },
        "Scroll Up a Little": {
            name: "Un Poco Arriba",
            match: ["un poco arriba"],
        },
        "Auto Scroll": {
            name: "Desplazamiento Automático",
            match: "desplazamiento automático",
        },
        "Slower": {
            name: "Más Lento",
            match: "lento"
        },
        "Faster": {
            name: "Más Rápido",
            match: "rápido"
        },
        "Scroll Help Down": {
            name: "Desplazar la Ayuda Abajo",
            match: "ayuda abajo",
        },
        "Scroll Help Up": {
            name: "Desplazar la Ayuda Arriba",
            match: "ayuda arriba",
        },
    },
};
