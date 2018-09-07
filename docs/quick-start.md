# 5 Minute Quick Start

## Hello World Plugin

Let's create a simple "Hello World" plugin that responds with a JavaScript alert "Hello, Developer!" when a user says <span class="voice-cmd">hello world</span> on a tab with a *.lipsurf.com domain.

 1. Clone the community plugins repository and `cd` into the directory.

 ```bash
 $ git clone https://github.com/LipSurf/plugins.git lipsurf-plugins && cd lipsurf-plugins
 ```

 2. Install the dependencies.

 ```bash
 $ npm install
 ```

 3. Create a folder named `HelloWorld` with a `HelloWorld.ts` file in it with the following contents:

 > NOTE: It's important to keep the capitalization consistent. The case-sensitive namespace must always end in `Plugin` (eg. `HelloWorldPlugin`) and
   the folder name and file name should have the same name and capitalization (without the `Plugin` suffix).

 > *Protip:* Rather than copy-pasting, it's better to type out the code to force yourself to grasp it's intuitive structure and contents better.

[HelloWorld.ts](/assets/HelloWorld.ts ':include')

  The meat of the plugin lives in the array of commands. Each [Command](/api-reference/command) object has properties for what the user needs to say to run it, and the code that's actually run (in addition to meta properties like name, description etc.)

 4. Since we're doing the example in TypeScript, we need to compile down to JavaScript.

    ```bash
    $ npm run watch
    ```

    > This will watch our *.ts files for changes and compile them to JavaScript whenever a change is detected :)

 5. Time to _load 'er up_. Open up Google Chrome and right click the LipSurf icon then "Options".

 6. Turn on "Developer mode" by checking it's box.

 ![Screenshot of developer mode setting](/assets/img/developer-mode.png)

 7. Click "Add a local plugin" under "Plugins" and navigate to the compiled `.js` file (eg. `plugins/build/HelloWorld.js`).

 ![Screenshot of the "Add a local plugin" button.](/assets/img/add-a-local-plugin.png)

<br>

 <h4 align=center>
 :checkered_flag: &nbsp;&nbsp;  **That's it!**  &nbsp;&nbsp; :checkered_flag:
 </h4>

<br>

## Verifying

  After a few seconds your plugin should appear in the plugins list if there were no installation problems.

  ![Screenshot of the HelloWorld plugin in the list of plugins](/assets/img/local-plugin-added.png)

  Now try saying <span class="voice-cmd">hello world</span> on this tab (since this tab has a lipsurf.com domain it will match our url pattern)
  If everything went smoothly, you should see the JavaScript alert:

  ![Screenshot of "Hello, Developer!" alert box](/assets/img/hello-world-alert.png)


---


  You can also say <span class="voice-cmd">help</span> to verify your new command is listed in the auto-generated help cheat-sheet.

  ![Screenshot of help cheat-sheet that now includes new "hello world" command](/assets/img/help-screen.png)

---

## What's Next
  If you think that's nifty, we've just scratched the surface! Here are some topics you might be interested in perusing next:


