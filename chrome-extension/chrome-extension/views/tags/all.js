riot.tag2('cmd-group', '<tr>{name}</tr>', '', '', function(opts) {
});
riot.tag2('cmd', '<td class="enable"> <input type="checkbox" ref="input" onchange="{save}" checked="{enabled}"> </td> <td class="name">{name}</td> <td class="desc">{description}</td> <td if="{typeof match==\'object\'}"><span class="tag" each="{name, i in match}">{name}</span></td> <td if="{typeof match==\'string\'}"><span class="tag">{match}</span></td>', '', 'class="cmd"', function(opts) {

    this.save = function(e) {

    	e.item.enabled = this.refs.input.checked;
	    this.parent.save(e);
    }.bind(this)

});
riot.tag2('homophone', '<label class="tag"> <input type="checkbox" ref="input" checked="{enabled}" onchange="{save}"> {source} ➪ {destination}</label>', '', '', function(opts) {
    	this.save = function(e) {
	    	e.item.enabled = this.refs.input.checked;
    		this.parent.save(e);
    	}.bind(this)
});
riot.tag2('options-page', '<div class="container"> <div style="text-align: left"> <h1>No Hand Man</h1> <h2>Permissions</h2> <p>We need permission to use the microphone. Please click "allow" and No Hand Man will work in any window. </p> <p>Privacy: the speech recognizer is only activated for the active window when you click the No Hand Man icon in your extensions toolbar.</p> <div class="perms" ref="perms"> <span rel="mic-perm" class="notice {success: hasMicPerm, failure: hasMicPerm === false}"> <i class="material-icons">{hasMicPerm ? \'check_circle\' : \'error\'}</i>&nbsp; <span>{hasMicPerm ? \'Has microphone permission.\' : \'Needs microphone permission.\'}</span> </span> </div> </div> </div> <h4 id="done" style="visibility: hidden">You may now close this window.</h4> <div class="container"> <h2>Options</h2> <div style="height: 1.2rem"> <div class="right-controls"> <button onclick="{reset}">Reset to Factory Defaults</button> </div> </div> <div each="{cmdGroups}" class="cmd-group"> <div class="collapser-shell {collapsed: collapsed, enabled: enabled}"> <div class="collapser" title="Click to {collapsed ? \'expand\' : \'collapse\'}" onclick="{toggleCollapsed}" href="#"> <div class="label">{name} <span class="version">v{version}</span> <span class="right-controls"><label><input type="checkbox" onchange="{toggleGroupEnabled}" checked="{enabled}"> Enabled</label></span> <div class="desc">{description}</div> </div> </div> <div class="collapsable"> <div class="collapsable-inner"> <div class="homophones"> <div class="label"> <strong>Homophones/synonyms: </strong> </div> <div class="tag-list"> <homophone each="{homophones}"></homophone> </div> </div> <table> <thead> <th>Enabled</th> <th>Name</th> <th>Description</th> <th>Command Words</th> </thead> <tbody> <tr data-is="cmd" each="{commands}"></tr> </tbody> </table> </div> </div> </div> </div> </div>', 'options-page .notice,[data-is="options-page"] .notice{ padding: 9px 10px; border-radius: 4px; border: 1px #ddd solid; opacity: 0; transition: opacity 1s ease-out; } options-page .notice i,[data-is="options-page"] .notice i{ color: #13bd13; vertical-align: middle; font-size: 1.5em; } options-page .notice.success,[data-is="options-page"] .notice.success{ background-color: #f4fff4; color: #565656; border-color: #cae6ca; opacity: 1.0; } options-page .notice.failure,[data-is="options-page"] .notice.failure{ background-color: #ffe3e0; border-color: #e69e9e; color: #8c3838; opacity: 1.0; } options-page .notice.failure i,[data-is="options-page"] .notice.failure i,options-page .notice.success i,[data-is="options-page"] .notice.success i{ opacity: 1; } options-page .notice.failure i,[data-is="options-page"] .notice.failure i{ color: #f34040; } options-page .perms,[data-is="options-page"] .perms{ margin: 10px; } options-page input[type=checkbox],[data-is="options-page"] input[type=checkbox],options-page input[type=radio],[data-is="options-page"] input[type=radio]{ vertical-align: middle; position: relative; bottom: 1px; } options-page .homophones .label,[data-is="options-page"] .homophones .label{ float: left; width: 20%; } options-page .homophones,[data-is="options-page"] .homophones{ margin-bottom: 15px; display: block; float: left; } options-page .homophones .tag-list,[data-is="options-page"] .homophones .tag-list{ float: left; width: 70%; text-align: left; } options-page input[type=radio],[data-is="options-page"] input[type=radio]{ bottom: 2px; } options-page td.enable,[data-is="options-page"] td.enable{ text-align: center; } options-page .collapser .label,[data-is="options-page"] .collapser .label{ margin-left: 15px; } options-page .desc,[data-is="options-page"] .desc{ font-style: italic; color: #a4a4a4; text-align: left; } options-page .cmd .desc,[data-is="options-page"] .cmd .desc{ font-style: normal; } options-page .version,[data-is="options-page"] .version{ margin-left: 10px; color: #a4a4a4; } options-page .enabled .collapser,[data-is="options-page"] .enabled .collapser{ color: #222; } options-page .enabled .desc,[data-is="options-page"] .enabled .desc{ color: #868686; } options-page .enabled .version,[data-is="options-page"] .enabled .version{ color: #868686; } options-page .cmd-group,[data-is="options-page"] .cmd-group{ margin: 10px 0; clear: both; } options-page .right-controls,[data-is="options-page"] .right-controls{ float: right; margin-right: 20px; } options-page .collapser,[data-is="options-page"] .collapser{ cursor: pointer; width: 100%; line-height: 1.2rem; text-align: left; background-color: #eee; color: #888; border-left: 1px solid #888; padding: 3px 5px; text-decoration: none; display: block; } options-page .collapser:before,[data-is="options-page"] .collapser:before{ content: \'-\'; position: absolute; } options-page .collapsed .collapser:before,[data-is="options-page"] .collapsed .collapser:before{ content: \'+\'; } options-page .collapser-shell,[data-is="options-page"] .collapser-shell{} options-page .collapsable,[data-is="options-page"] .collapsable{ transition: max-height 0.35s ease-out; display: block; background-color: #f5f5f5; overflow: hidden; } options-page .collapsable-inner,[data-is="options-page"] .collapsable-inner{ padding: 10px 20px; } options-page .collapsed .collapsable,[data-is="options-page"] .collapsed .collapsable{ max-height: 0 !important; } options-page .tag,[data-is="options-page"] .tag{ background-color: #e6e6e6; border-radius: 3px; line-height: 1.5em; margin: 2px; display: inline-block; padding: 3px 6px; white-space: nowrap; } options-page table,[data-is="options-page"] table{ display: block; margin-top: 15px; } options-page tr,[data-is="options-page"] tr{ vertical-align: top; } options-page tbody,[data-is="options-page"] tbody,options-page thead,[data-is="options-page"] thead{ text-align: left; } options-page td,[data-is="options-page"] td{ border-top: 1px solid #ddd; padding: .7rem; } options-page th,[data-is="options-page"] th{ padding: 0 .7rem; }', '', function(opts) {
    this.cmdGroups = opts.cmdGroups;
    this.hasMicPerm = null;

    this.save = function() {
        _save(this.cmdGroups);
    }.bind(this)

    this.reset = function() {
        if (confirm("This will erase any settings you have configured and load default settings! Press OK if you're sure you want to continue.")) {
            _reset()
        }
    }.bind(this)

    this.toggleGroupEnabled = function(e) {
        e.stopPropagation()
        e.item.enabled = e.srcElement.checked;
        this.save();
    }.bind(this)

    this.toggleCollapsed = function(e) {

        if (e.target.nodeName.toLowerCase() != 'input' &&
            e.target.nodeName.toLowerCase() != 'label') {
            let item = e.item;
            item.collapsed = !item.collapsed;
            this.save();
        }
    }.bind(this)

    function checkForPermission() {
        navigator.mediaDevices.getUserMedia({
            audio: true,
        }).then((stream) => {
            console.log("yes permission");
            this.hasMicPerm = true;
            this.update();
        }, () => {

            console.log("no permission");
            this.hasMicPerm = false;
            this.update();

        });
    }

    this.on('mount', function() {

        $('.collapsable').each(function(i, ele) {
            let $ele = $(ele);

            $ele.css('max-height', 3000);
        });

        checkForPermission.apply(this);

        setInterval(function() {
            checkForPermission.apply(this);
        }.bind(this), 1500);
    });
});