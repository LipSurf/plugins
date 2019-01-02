# Sharing Vars. & State

You can share variables across commands in the same [Plugin](api-reference/pluginbase.md).

Create an interface that extends `IPlugin` with the extra shared variables you need. Now your `Plugin` object should return a type of the new interface you have defined.

Here's an (incomplete) example:

<<< @/docs/assets/ShareState.ts

