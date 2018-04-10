<options-page>
    <div class="container">
        <div style="text-align: left">
            <h1>Lip Surf</h1>
            <h2>Permissions</h2>
            <p>We need permission to use the microphone. Please click "allow" when your browser prompts you for microphone permission. </p>
            <div class="perms" ref="perms">
                <div rel="mic-perm" style="display: inline-block;" class="notice {success: hasMicPerm, failure: hasMicPerm === false}">
                <i class="material-icons">{hasMicPerm ? 'check_circle' : 'error'}</i>&nbsp; <span>{ hasMicPerm ? 'Has microphone permission.' : 'Needs microphone permission.' }</div>
				<div if={ !hasMicPerm } class="blocked-mic-instructions">
					<img align="middle" src="/assets/mic-no-perm.png" style="max-width: 80px"/>
					Click the blocked media icon in the address bar and click allow.
				</div>
                </span>
            </div>
            <p class="mute">Privacy: the speech recognizer is only activated for the active window when you click the Lip Surf icon in your extensions toolbar.</p>
        </div>
    </div>
	<div class="container">
		<h2>General</h2>
		<div class="option">
		<label>
			<input type="checkbox" ref="showLiveText" onchange={ generalSave } checked={ options.showLiveText }/> Show live text
		</label>
		</div>
		<div class="option">
		<label>
			Automatically shut off after <input ref="inactivityAutoOffMins" onchange={ generalSave } type="number" min="0" max="525600" value={ options.inactivityAutoOffMins } /> minutes without valid commands (set to 0 to never auto. shut off).
		</label>
		</div>
        <div class="option" style="height: 1.2rem">
            <div>
                <button onclick="{ reset }">Reset to Factory Defaults</button>
            </div>
        </div>
	</div>
    <div class="container">
        <h2>Plugins</h2>
        <div each={ options.cmdGroups } class="cmd-group">
            <div class="collapser-shell { collapsed: collapsed, enabled: enabled }">
                <div class="collapser" title="Click to { collapsed ? 'expand' : 'collapse' }" onclick={ toggleCollapsed } href="#">
                    <div class="label">{ friendlyName } <span class="version">v{ version }</span> <span class="right-controls"><label><input type="checkbox" onchange={ toggleGroupEnabled } checked={ enabled } > Enabled</label></span>
                        <div class="desc">{ description }</div>
                    </div>
                </div>
                <div class="collapsable">
                    <div class="collapsable-inner">
                        <div class="homophones" if={ homophones.length > 0 }>
                            <div class="label">
                                <strong>Homophones/synonyms: </strong>
                            </div>
                            <div class="tag-list">
                                <homophone each={homophones}></homophone>
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
        float: left;
        width: 20%;
    }

	.option {
		margin: 10px 0;
	}

    .homophones {
        margin-bottom: 15px;
        display: block;
        float: left;
    }

    .homophones .tag-list {
        float: left;
        width: 70%;
        text-align: left;
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
        background-color: #f5f5f5;
        overflow: hidden;
        /* max height is set via js dynamically for smooth animation*/
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
    </style>
    <script>
	require('./cmd-group.tag');
	require('./cmd.tag');
	require('./homophone.tag');
    this.options = opts.store;
    this.hasMicPerm = null;

    this.save = () => {
        options.save();
    }

    this.reset = () => {
        if (confirm("This will erase any settings you have configured and load default settings! Press OK if you're sure you want to continue.")) {
            options.reset()
        }
    }

	generalSave = (e) => {
		Object.assign(options.options, {
			showLiveText: this.refs.showLiveText.checked,
			inactivityAutoOffMins: +this.refs.inactivityAutoOffMins.value,
		});
		this.save()
	}

    this.toggleGroupEnabled = (e) => {
        e.stopPropagation()
        e.item.enabled = !e.item.enabled;
        this.save();
    }

    this.toggleCollapsed = (e) => {
        // hack to get around propagation not being stopped in riot
        if (e.target.nodeName.toLowerCase() != 'input' &&
            e.target.nodeName.toLowerCase() != 'label') {
            let item = e.item;
            item.collapsed = !item.collapsed;
            this.save();
        }
    }

    function checkForPermission() {
        navigator.mediaDevices.getUserMedia({
            audio: true,
        }).then((stream) => {
            this.hasMicPerm = true;
            this.update();
        }, () => {
            // Aw. No permission (or no microphone available).
            this.hasMicPerm = false;
            this.update();
        });
    }

    opts.store.on('update', (store) => {
        this.update(store);
    });

    this.on('mount', function() {
        // the thing might already be collapsed
        // set the max height on each accordion item, then shrink the ones
        // that need to be based on user settings
        $('.collapsable').each(function(i, ele) {
            let $ele = $(ele);
            // TODO: this doesn't work anymore because when the page is loaded,
            // $ele.css('max-height', $ele.parent().find('.collapsable').height());
            $ele.css('max-height', 3000);
        });

        checkForPermission.apply(this);

        setInterval(function() {
            checkForPermission.apply(this);
        }.bind(this), 1500);
    });
    </script>
</options-page>
