# Adding Languages (i18n)

_LipSurf was designed from the ground-up with multi-language support in mind._


LipSurf uses the built-in HTML5 speech-recognizer, hence it supports all of the languages that
the Google speech recognizer does, in theory.

> For a list of supported languages see here: https://cloud.google.com/speech-to-text/docs/languages

The base language is English, but any plugin can have it's metadata and match phrases/functions adjusted to be compatible with other languages.

Let's localize the [hello world plugin](/quick-start) from the quick start. Here it is again for reference:

[HelloWorld.ts](/assets/HelloWorld.ts ':include')
