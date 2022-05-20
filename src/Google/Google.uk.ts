/// <reference types="@lipsurf/types/extension"/>
import Google from "./Google";

Google.languages!.uk = {
  niceName: "Google",
  description: "пошук у гугле",
  authors: "Tanya Kunica",
  homophones: {
    google: "гугл",
  },
  commands: {
    Search: {
      name: "пошук у гугле",
      description: "google [текст]",
      match: ["google *", "пошук *"],
    },
  },
};
