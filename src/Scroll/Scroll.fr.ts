/// <reference types="lipsurf-types/extension"/>
import ScrollPlugin from "./Scroll";

ScrollPlugin.languages!.fr = {
    niceName: "Défilement",
    authors: "Miko",
    homophones: {
        "des fils vers le bas": "défile vers le bas",
        "des fils vers le haut": "défile vers le haut",
        "ralenti": "ralentis",
        "défilé en haut": "défiler en haut",
        "des fils en haut": "défile en haut",
        "des fils un peu vers le bas": "défile un peu en bas",
        "des fils un peu vers le haut": "défile un peu vers le haut",
    },
    commands: {
        "Scroll Down": {
            name: "Défilement vers le Bas",
            match: ["en bas", "faire défiler vers le bas", "fais défiler vers le bas", "défilement vers le bas", "défiler vers le bas", "défile vers le bas"],
        },
        "Scroll Up": {
            name: "Défilement vers le Haut",
            match: ["en haut", "faire défiler vers le haut", "fais défiler vers le haut", "défiler vers le haut", "défilement vers le haut", "défile vers le haut"],
        },
        "Auto Scroll": {
            name: "Défilement Automatique",
            match: ["défilement automatique", "défilement auto", "fais défiler automatiquement", "faire défiler automatiquement", "défiler automatiquement", "défile automatiquement"],
        },
        "Slow Down": {
            name: "Ralentir",
            match: ["plus lentement", "ralentir", "ralentis"],
        },
        "Speed Up": {
            name: "Accélérer",
            match: ["plus vite", "accélérer", "accélère"],
        },
        "Stop": {
            name: "Arrêter",
            match: ["arrêter", "stop", "pause", "arrête"],
        },
        "Scroll Bottom": {
            name: "Défilement en Bas",
            match: ["en bas", "en bas de page", "bas de page", "le bas de la page", "faire défiler en bas", "fais défiler en bas", "défiler en bas", "défile en bas", "défilement en bas"],
        },
        "Scroll Top": {
            name: "Défilement en Haut",
            match: ["en haut", "le haut de la page", "faire défiler en haut", "fais défiler en haut", "défiler en haut", "défile en haut", "défilement en haut"],
        },
        "Scroll Down a Little": {
            name: "Défilement Léger vers le Bas",
            match: ["un peu en bas", "un peu vers le bas faire défiler un peu vers le bas", "fais défiler un peu vers le bas", "défiler un peu vers le bas", "défile un peu vers le bas"],
        },
        "Scroll Up a Little": {
            name: "Défilement Léger vers le Haut",
            match: ["un peu en haut", "défiler un peu vers le haut", "défile un peu vers le haut", "faire défiler un peu vers le haut", "fais défiler un peu vers le haut"],
        },
        "Scroll Left": {
            name: "Défilement à Gauche",
            match: ["faire défiler à gauche", "fais défiler à gauche", "défiler à gauche", "défile à gauche"],
        },
        "Scroll Right": {
            name: "Défilement à Droite",
            match: ["faire défiler à droite", "fais défiler à droite", "défiler à droite", "défile à droite"],
        },
        "Scroll Help Down": {
            name: "Faire Défiler l’Aide vers le Bas",
            match: ["faire défiler l’aide vers le bas", "fais défiler l’aide vers bas"],
        },
        "Scroll Help Up": {
            name: "Faire Défiler l’Aide vers le Haut",
            match: ["faire défiler l’aide vers le haut", "fais défiler l’aide vers haut"],
        },
    },
};
