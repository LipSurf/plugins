<cmd-group>
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
                <table style="width: 100%">
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
    <style>
    :scope {
        --max-homo-list-height: 80px;
    }
    table {
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

    .homophones .label {
        width: 20%;
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

    .tag { background-color: #e6e6e6;
        border-radius: 3px;
        line-height: 1.5em;
        margin: 2px;
        display: inline-block;
        padding: 3px 6px;
        white-space: nowrap;
    }


    </style>
    <script>
	require('./cmd.tag');
	require('./homophone.tag');
    // need to mount when there are styles involved
    riot.mount('cmd');
    // attr is lowercased
    this.LANG_CODE_TO_NICE = opts.lang_code_to_nice;

    this.save = this.parent.save;

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
		parent.save();
	}

    </script>
</cmd-group>
