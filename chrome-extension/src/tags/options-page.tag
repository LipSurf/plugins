<options-page>
    <div class="container">
        <div style="text-align: left">
			<div class="title-bar">
				<img class="logo". src="../assets/icon-48.png"/>
				<h1>LipSurf Options</h1>
			</div>
            <h2>Permissions</h2>
            <p>We need permission to use the microphone. Please click "allow" when your browser prompts you for microphone permission. </p>
            <div class="perms" ref="perms">
                <div rel="mic-perm" style="display: inline-block;" class="notice {success: hasMicPerm, failure: hasMicPerm === false}">
                <i class="material-icons">{hasMicPerm ? 'check_circle' : 'error'}</i>&nbsp; <span>{ hasMicPerm ? 'Has microphone permission.' : 'Needs microphone permission.' }</div>
				<div if={ !hasMicPerm } class="blocked-mic-instructions">
					<img align="middle" src="/assets/mic-no-perm.png" style="max-width: 80px"/>
					Click the blocked media icon in the address bar and click always allow.
				</div>
                </span>
            </div>
            <p class="mute">Privacy: the speech recognizer is only activated for the active window when you click the LipSurf icon in your extensions toolbar.</p>
        </div>
    </div>
	<div class="container">
		<h2>General</h2>
		<div class="option">
			<label title="The languages shown here are the ones supported by the plugins you have installed.">
                <i class="icon language"></i>
				Language:
                <select onchange={ langSave } ref="lang">
                    <option each={niceLang, possLang in possibleLanguages} value={possLang} selected={options.language==possLang}>{niceLang}</option>
                    <option value="add">+ Add a Language</option>
                </select>
			</label>
		</div>
		<div class="option">
			<label>
				<input type="checkbox" ref="showLiveText" onchange={ generalSave } checked={ options.showLiveText }/> Show live text
			</label>
		</div>
		<div class="option">
			<label title="Check the box if you aren't using headphones and live text will be suppressed while audio is playing on the page (unless a valid command is given)">
				<input type="checkbox" ref="noHeadphonesMode" onchange={ generalSave } checked={ options.noHeadphonesMode }/> No headphones mode
            </label>
		</div>
		<div class="option">
		<label>
			Automatically shut off after &nbsp;&nbsp;<input class="right" ref="inactivityAutoOffMins" onchange={ generalSave } type="number" min="0" max="525600" value={ options.inactivityAutoOffMins } /> &nbsp;&nbsp;minutes without valid commands (set to 0 to never automatically shut off)
		</label>
		</div>
        <div class="option" style="height: 1.2rem; margin: 20px">
            <div class="btn-bar">
                <button onclick="{ tutorial }">Open Tutorial</button>
                <button onclick="{ reset }">Reset to Factory Defaults</button>
            </div>
        </div>
	</div>
    <div class="container">
        <h2>Plugins</h2>
        <div each={ options.cmdGroups } class="cmd-group">
            <div class="collapser-shell { collapsed: !expanded, enabled: enabled }">
                <a class="collapser" title="Click to { expanded ? 'expand' : 'collapse' }" onclick={ toggleExpanded } href="#">
                    <div class="label">{ niceName } <span class="version">v{ version }</span> <span class="right-controls"><label><input type="checkbox" onchange={ toggleGroupEnabled } checked={ enabled } > Enabled</label></span>
                        <div class="desc">{ description }</div>
                    </div>
                </a>
                <div class="collapsable">
                    <div class="collapsable-inner">
                        <div style="display: table; border-spacing: 0 0.6em;">
                            <div class="languages" style="display: table-row">
                                <div class="label" style="display: table-cell">
                                    <strong>Supported Languages: </strong> 
                                </div>
                                <ul class="language-list" style="display: table-cell">
                                    <li class="tag" each={ suppLang in languages }>{ LANG_CODE_TO_NICE[suppLang] }</li>
                                </ul>
                            </div>
                            <div class="homophones" if={ homophones.length > 0 } style="display:table-row">
                                <div class="label" style="display: table-cell">
                                    <strong>Homophones/synonyms: </strong>
                                </div>
                                <div class="tag-list-cont" style="display: table-cell">
                                    <a class="show-more" onclick={ toggleShowMore } href="#">{ showMore ? 'Show Less' : 'Show More'}</a>
                                    <div class="tag-list {shrunk: !showMore}">
                                        <homophone each={homophones}></homophone>
                                    </div>
                                    <div class="fade {invisible: showMore}">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <table>
                            <thead>
                                <th>Enabled</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Command Words</th>
                            </thead>
                            <tbody>
                                <tr data-is="cmd" each={commands}></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <style>
	:scope {
  		--bg-color: 245, 245, 245;
		--max-homo-list-height: 80px;
  	}

	.btn-bar * {
		margin: 0 5px;
	}

	.title-bar {
		font-family: "Special Elite";
		text-align: center;
	}

    .language-list {
        list-style: none;
        margin: 0;
        padding: 0;
    }

	.title-bar img {
		vertical-align: text-bottom;
	}

    .icon {
        display: inline-block;
        width: 1.4em;
        height: 1.4em;
        vertical-align: text-bottom;
        background-repeat: no-repeat;
        background-size: contain;
    }

    .icon.language {
        background-image: url(data:image/png;base64,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);
    }

	.title-bar * {
		display: inline-block;
	}

	.invisible {
		opacity: 0 !important;
	}

	.tag-list-cont {
		position: relative;
	}

	.show-more {
		text-shadow: white 1px 1px;
		text-decoration: none;
		color: #7e7e7e;
		position: absolute;
        transform: translateX(-50%);
		left: 50%;
		z-index: 10;
		bottom: -10px;
		background-color: rgb(var(--bg-color));
	    padding: 0 10px;
	}

	.fade {
		pointer-events: none;
		background: linear-gradient(to bottom, rgba(var(--bg-color),0) 20%,rgba(var(--bg-color),1) 90%);
		height: var(--max-homo-list-height);
	    position: relative;
		transition: opacity .5s ease;
		opacity: 1;
		margin-top: calc(-1 * var(--max-homo-list-height) - 1px);
	}

    .mute {
        color: #555;
    }

    .notice {
        padding: 9px 10px;
        border-radius: 4px;
        border: 1px #ddd solid;
        opacity: 0;
        transition: opacity 1s ease-out;
    }

    .notice i {
        color: #13bd13;
        vertical-align: middle;
        font-size: 1.5em;
    }

    .notice.success {
        background-color: #f4fff4;
        color: #565656;
        border-color: #cae6ca;
        opacity: 1.0;
    }

    .notice.failure {
        background-color: #ffe3e0;
        border-color: #e69e9e;
        color: #8c3838;
        opacity: 1.0;
    }

    .notice.failure i, .notice.success i {
        opacity: 1;
    }

    .notice.failure i {
        color: #f34040;
    }

	.blocked-mic-instructions {
		color: red;
	}

    .perms {
		text-align: center;
        margin: 10px;
    }

    input[type=checkbox],
    input[type=radio] {
        vertical-align: middle;
        position: relative;
        bottom: 1px;
    }

    .homophones .label {
        width: 20%;
    }

	.option {
		margin: 1.5em 0;
	}

    .homophones {
        margin-bottom: 30px;
        display: block;
    }

    .homophones .tag-list {
		position: relative;
		overflow: hidden;
        text-align: left;
		border-bottom: 1px solid #dddddd;
		max-height: 600px;
		transition: max-height .5s ease;
		padding-bottom: 10px;
    }

	.homophones .tag-list.shrunk {
		max-height: var(--max-homo-list-height);
	}

    input[type=radio] {
        bottom: 2px;
    }

    td.enable {
        text-align: center;
    }

    .collapser .label {
        margin-left: 15px;
    }

    .desc {
        font-style: italic;
        color: #a4a4a4;
        text-align: left;
    }

    .cmd .desc {
        font-style: normal;
    }

    .version {
        margin-left: 10px;
        color: #a4a4a4;
    }

    .enabled .collapser {
        color: #222;
    }

    .enabled .desc {
        color: #868686;
    }

    .enabled .version {
        color: #868686;
    }

    .cmd-group {
        margin: 10px 0;
        clear: both;
    }

    .right {
        text-align: right;
    }

    .right-controls {
        float: right;
        margin-right: 20px;
    }

    .collapser {
        /*font-size: 1.05rem;*/
        cursor: pointer;
        width: 100%;
        line-height: 1.2rem;
        text-align: left;
        background-color: #eee;
        color: #888;
        border-left: 1px solid #888;
        padding: 3px 5px;
        text-decoration: none;
        display: block;
    }

    .collapser:before {
        content: '-';
        position: absolute;
    }

    .collapsed .collapser:before {
        content: '+';
    }

    .collapser-shell {}

    .collapsable {
        transition: max-height 0.35s ease-out;
        display: block;
        background-color: rgb(var(--bg-color));
        overflow: hidden;
		/* TODO: set dynamically */
		max-height: 3000px;
    }

    .collapsable-inner {
        padding: 10px 20px;
    }

    .collapsed .collapsable {
        max-height: 0 !important;
    }

    .tag {
        background-color: #e6e6e6;
        border-radius: 3px;
        line-height: 1.5em;
        margin: 2px;
        display: inline-block;
        padding: 3px 6px;
        white-space: nowrap;
    }

    table {
        display: block;
        margin-top: 15px;
    }

    tr {
        vertical-align: top;
    }

    tbody,
    thead {
        text-align: left;
    }

    td {
        border-top: 1px solid #ddd;
        padding: .7rem;
    }

    th {
        padding: 0 .7rem;
    }

    .container {
        max-width: 900px;
        margin: 50px auto;
        text-align: left;
    }

	.container:first-child {
		margin: 20px auto;
	}

    </style>
    <script>
	require('./cmd-group.tag');
	require('./cmd.tag');
	require('./homophone.tag');
    this.LANG_CODE_TO_NICE = opts.LANG_CODE_TO_NICE;
    this.options = opts.store;
    this.hasMicPerm = true;
    this.initialLoad = true;
    this.possibleLanguages = [
		"en-AU", 
		"en-IN",
		"en-NZ",
		"en-ZA",
		"en-GB",
		"en-US",
		"ja",
	].reduce((memo, lang) => {memo[lang] = this.LANG_CODE_TO_NICE[lang]; return memo;}, {});

    this.save = () => {
        options.save();
    }

    this.reset = () => {
        if (confirm("This will erase any settings you have configured and load default settings! Press OK if you're sure you want to continue.")) {
            options.reset()
        }
    }

	this.tutorial = () => {
        // todo: call the main.ts openTutorial fn
		window.open("./tutorial.html");
	}

	this.generalSave = (e) => {
		Object.assign(options.options, {
			noHeadphonesMode: this.refs.noHeadphonesMode.checked,
			showLiveText: this.refs.showLiveText.checked,
			inactivityAutoOffMins: +this.refs.inactivityAutoOffMins.value,
		});
		this.save()
	}

    this.langSave = (e) => {
        if (this.refs.lang.value == "add") {
            // add a language
            window.open("https://github.com/mikob/LipSurf#adding-support-for-more-languages-i18n", "_blank");
            this.refs.lang.value = options.options.language;
        } else {
            Object.assign(options.options, {
                language: this.refs.lang.value
            });
            this.save();
        }
    }

    this.toggleGroupEnabled = (e) => {
        e.stopPropagation();
        e.item.enabled = !e.item.enabled;
        this.save();
    }

    this.toggleExpanded = (e) => {
        // hack to get around propagation not being stopped in riot
        if (e.target.nodeName.toLowerCase() != 'input' &&
            e.target.nodeName.toLowerCase() != 'label') {
            e.preventDefault();
            let item = e.item;
            item.expanded = !item.expanded;
            this.save();
        }
    }

	this.toggleShowMore = (e) => {
		e.stopPropagation();
		e.preventDefault();
		e.item.showMore = !e.item.showMore;
		this.save();
	}

    function checkForPermission() {
        navigator.mediaDevices.getUserMedia({
            audio: true,
        }).then((stream) => {
            if (!this.hasMicPerm) {
                this.hasMicPerm = true;
                this.update();
            }
        }, () => {
            // Aw. No permission (or no microphone available).
            if (this.hasMicPerm) {
                this.hasMicPerm = false;
                this.update();
            }
        });
    }

    opts.store.on('update', (store) => {
        if (this.initialLoad) {
            this.update(store);
            this.initialLoad = false;
        } else {
            // allow time to animate
            setTimeout(() => {
                this.update(store);
            }, 1000);
        }
    });

    this.on('mount', function() {
        // the thing might already be collapsed
        // set the max height on each accordion item, then shrink the ones
        // that need to be based on user settings
        /*$('.collapsable').each(function(i, ele) {*/
            /*let $ele = $(ele);*/
            /*// TODO: this doesn't work anymore because when the page is loaded,*/
            /*// $ele.css('max-height', $ele.parent().find('.collapsable').height());*/
            /*$ele.css('max-height', 3000);*/
        /*});*/

        checkForPermission.apply(this);

        setInterval(function() {
            checkForPermission.apply(this);
        }.bind(this), 1500);
    });
    </script>
</options-page>
