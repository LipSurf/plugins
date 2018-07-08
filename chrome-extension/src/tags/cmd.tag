<cmd class="cmd">
    <td class="enable">
        <input type="checkbox" ref="input" onchange={ save } checked={ enabled }>
    </td>
    <td class="name">{ name } <span title="Global commands work on any page." class="global-tag" if={ global_ }>global</span></td>
    <td class="desc">{ description }</td>
    <td if={ typeof match=='object' }><span class="tag" each="{ name, i in match }">{ name }</span></td>
    <td if={ typeof match=='string' && !dynamicMatch }><span class="tag">{ match }</span></td>
    <td if={ typeof match=='string' && dynamicMatch }><span class="dynamic-match-str">{ match }</span></td>
    <style>
        .dynamic-match-str {
            color: #555;
            font-style: italic;
        }

        .global-tag {
            background-color: #a1a1a1;
            padding: 0px 6px;
            text-shadow: #808080cf 1px 1px;
            color: white;
            font-weight: bold;
            border: 1px #b2b2b2 solid;
            border-radius: 5px;
        }
    </style>
    <script>


    save = (e) => {
    	// binding
    	e.item.enabled = !e.item.enabled;
	    this.parent.save();
    }

    </script>
</cmd>