<cmd class="cmd">
    <td class="enable">
        <input type="checkbox" ref="input" onchange={ save } checked={ enabled }>
    </td>
    <td class="name">{ name }</td>
    <td class="desc">{ description }</td>
    <td if={ typeof match=='object' }><span class="tag" each="{ name, i in match }">{ name }</span></td>
    <td if={ typeof match=='string' && !dynamicMatch }><span class="tag">{ match }</span></td>
    <td if={ typeof match=='string' && dynamicMatch }><span class="dynamic-match-str">{ match }</span></td>
    <style>
        .dynamic-match-str {
            color: #555;
            font-style: italic;
        }
    </style>
    <script>

    save = (e) => {
    	// binding
    	e.item.enabled = !e.item.enabled;
	    this.parent.save(e);
    }

    </script>
</cmd>