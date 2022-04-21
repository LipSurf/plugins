/// <reference types="@lipsurf/types/extension"/>
import CopyCutPaste from "./CopyCutPaste";

CopyCutPaste.languages!.uk = {
  niceName: "копіювати вирізати та вставляти",
  description: "",
  authors: "Tanya Kunica",
  commands: {
    Copy: {
      name: "копіювати",
      match: ["копіювати"],
      description: "Копіювання виділений тексту до буфера обміну.",
    },
    Cut: {
      name: "вирізати",
      match: ["вирізати"],
      description: "Вирізання виділений тексту до буфера обміну.",
    },
    Paste: {
      name: "вставити",
      match: ["вставити"],
      description: "Вставлення елементу з буфера обміну.",
    },
  },
};
