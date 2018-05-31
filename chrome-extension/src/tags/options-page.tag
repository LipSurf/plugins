<options-page>
    <div class="container">
        <div style="text-align: left">
			<div class="title-bar">
				<img class="logo". src="../assets/icon-48.png"/>
				<h1>LipSurf Options</h1>
			</div>
        </div>
		<section>
            <h2>Permissions</h2>
            <p>We need permission to use the microphone. Please click "allow" when your browser prompts you for microphone permission. </p>
            <div class="perms" ref="perms">
                <div rel="mic-perm" style="display: inline-block;" class="notice {success: hasMicPerm, failure: hasMicPerm === false}">
                <i class="icon {check-circle: hasMicPerm, error: !hasMicPerm}"></i>&nbsp; <span>{ hasMicPerm ? 'Has microphone permission.' : 'Needs microphone permission.' }</div>
				<div if={ !hasMicPerm } class="blocked-mic-instructions">
					<img align="middle" src="/assets/mic-no-perm.png" style="max-width: 80px"/>
					Click the blocked media icon in the address bar and click always allow.
				</div>
                </span>
            </div>
            <p class="mute">Privacy: the speech recognizer is only activated for the active window when you click the LipSurf icon in your extensions toolbar.</p>
    	</section>
        <section>
            <h2>Support the Project</h2>
            <div class="notice warning">
                <i class="icon warning-empty"></i> &nbsp;&nbsp;LipSurf will always have a free version.
				</div>
			<p>You are on the free trial of <strong>LipSurf Pro</strong>. LipSurf Pro is free while in beta. The free trial will end 1 month after the 1.0 release.</p>
            <div style="text-align: center">
                <button onclick={ donate } id="donateBtn">Donate as an Early Bird Supporter
					<div>
					<i class="img-icon btc"></i>
					<i class="img-icon eth"></i>
					<i class="img-icon pp"></i>
					<i class="img-icon cc"></i>
					</div>
				</button>
                <p class="mute">Early supporters will be credited 2x the value of their donation when 1.0 is released.</p>
            </div>
        </section>
        <section>
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
                    <i class="icon text"></i>
                    <input type="checkbox" ref="showLiveText" onchange={ generalSave } checked={ options.showLiveText }/> Show live text
                </label>
            </div>
            <div class="option">
                <label title="Check the box if you aren't using headphones and live text will be suppressed while audio is playing on the page (unless a valid command is given)">
                    <i class="icon headphones"></i>
                    <input type="checkbox" ref="noHeadphonesMode" onchange={ generalSave } checked={ options.noHeadphonesMode }/> No headphones mode
                </label>
            </div>
            <div class="option">
            <label>
                <i class="icon timer-off"></i>
                Automatically shut off after &nbsp;&nbsp;<input class="right" ref="inactivityAutoOffMins" style="width: 3.5em" onchange={ generalSave } type="number" min="0" max="525600" value={ options.inactivityAutoOffMins } /> &nbsp;&nbsp;minutes without valid commands (set to 0 to never automatically shut off)
            </label>
            </div>
            <div class="option" style="height: 1.2rem; margin: 20px">
                <div class="btn-bar">
                    <button onclick="{ tutorial }">Open Tutorial</button>
                    <button onclick="{ reset }">Reset to Factory Defaults</button>
                </div>
            </div>
        </section>
        <section>
            <h2>Plugins</h2>
			<div style="text-align: right">
				<button onclick={ getMorePlugins } id="getMorePlugins"><i class="icon lib-add"></i> Get More Plugins</button>
			</div>
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
        </section>
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

	.img-icon {
		width: 1.2em;
		height: 1.2em;
		display: inline-block;
		background-size: contain;
	}

	.img-icon.eth {
		background-image: url(chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/vendor/eth.svg);
	}

	.img-icon.btc {
		background-image: url(chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/vendor/btc.svg);
	}

	.img-icon.pp {
		background-image: url(chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/vendor/pp.svg);
	}

	.img-icon.cc {
		background-image: url(chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/vendor/cc.svg);
	}

	#donateBtn {
		color: white;
		padding: 10px;
		font-family: "Barlow";
		font-weight: bold;
		border-radius: 10px;
		border: 1px solid;
		background-image: -webkit-linear-gradient(top, #3498db, #2980b9);
		background-image: -moz-linear-gradient(top, #3498db, #2980b9);
		background-image: -ms-linear-gradient(top, #3498db, #2980b9);
		background-image: -o-linear-gradient(top, #3498db, #2980b9);
		background-image: linear-gradient(to bottom, #3498db, #2980b9);
		box-shadow: 1px 1px #828282;
	}

	#donateBtn div {
		filter: drop-shadow( 1px 1px 5px #ffffffcc );
		margin-top: 10px;
		font-size: 1.2em;
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

    .notice.success i {
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

    .notice.warning {
        background-color: #fffad7;
        border-color: #e5dda1;
        color: #615f3b;
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
		margin: 1.5em;
		font-size: 1.2em;
	}

	.option i {
		margin-right: 15px;
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
        margin: 0px auto;
        text-align: left;
    }

    section {
        margin: 50px auto;
    }

	section:nth-of-type(1) {
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

	this.getMorePlugins = () => {
		if (confirm("This feature is not yet available. Click \"OK\" if you're a programmer and want to write a plugin.")) {
			window.open('https://github.com/mikob/lipsurf', '_blank');
		}
	}

	this.donate = () => {
		window.open('https://www.lipsurf.com/donate/', '_blank');
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
