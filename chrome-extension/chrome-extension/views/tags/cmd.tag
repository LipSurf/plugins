<cmd class="cmd">
    <td class="enable">
        <input type="checkbox" ref="input" onchange={ save } checked={ enabled }>
    </td>
    <td class="name">{ name }</td>
    <td class="desc">{ description }</td>
    <td if={ typeof match=='object' }><span class="tag" each="{ name, i in match }">{ name }</span></td>
    <td if={ typeof match=='string' }><span class="tag">{ match }</span></td>
    <script>

    save(e) {
    	// binding
    	e.item.enabled = this.refs.input.checked;
	    this.parent.save(e);
    }

    </script>
</cmd>