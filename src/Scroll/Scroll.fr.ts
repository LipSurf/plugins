/// <reference types="@lipsurf/types/extension"/>
import ScrollPlugin from "./Scroll";

ScrollPlugin.languages!.fr = {
  niceName: "Défilement",
  authors: "Byron Kearns, Miko",
  homophones: {
    "des fils vers le bas": "défile vers le bas",
    "des fils vers le haut": "défile vers le haut",
    ralenti: "ralentis",
    "défilé en haut": "défiler en haut",
    "des fils en haut": "défile en haut",
    "des fils un peu vers le bas": "défile un peu en bas",
    "des fils un peu vers le haut": "défile un peu vers le haut",
  },
  commands: {
    "Scroll Down": {
      name: "Défilement vers le Bas",
      match: ["[/faire défiler /défiler ]vers le bas"],
    },
    "Scroll Up": {
      name: "Défilement vers le Haut",
      match: ["[/faire défiler /défiler ]vers le haut"],
    },
    "Auto Scroll": {
      name: "Défilement Automatique",
      match: ["défilement [automatique/auto]"],
    },
    "Slow Down": {
      name: "Ralentir",
      match: ["plus lentement", "ralentir"],
    },
    "Speed Up": {
      name: "Accélérer",
      match: ["plus vite", "accélérer"],
    },
    "Stop Scrolling": {
      name: "Arrêter",
      match: ["arrêter", "pause"],
    },
    "Scroll Bottom": {
      name: "Défilement en Bas",
      match: [
        "en bas",
        "bas de page",
        "[faire défiler/défiler] en bas",
        "aller en bas de la page",
      ],
    },
    "Scroll Top": {
      name: "Défilement en Haut",
      match: [
        "en haut",
        "haut de page",
        "[faire défiler/défiler] en haut",
        "aller en haut de la page",
      ],
    },
    "Scroll Down a Little": {
      name: "Défilement Léger vers le Bas",
      match: ["[/faire défiler /défiler ]un peu vers le bas"],
    },
    "Scroll Up a Little": {
      name: "Défilement Léger vers le Haut",
      match: ["[/faire défiler /défiler ]un peu vers le haut"],
    },
    "Scroll Left": {
      name: "Défilement à Gauche",
      match: ["[faire /]défiler à gauche", "[/faire ]défiler vers la gauche"],
    },
    "Scroll Right": {
      name: "Défilement à Droite",
      match: ["[faire /]défiler à droite", "[/faire ]défiler vers la droite"],
    },
    "Scroll Help Down": {
      name: "Faire Défiler l’Aide vers le Bas",
      match: ["[faire /]défiler l'aide vers le bas"],
    },
    "Scroll Help Up": {
      name: "Faire Défiler l’Aide vers le Haut",
      match: ["[faire /]défiler l'aide vers le haut"],
    },
  },
};
