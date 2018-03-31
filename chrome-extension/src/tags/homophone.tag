<homophone>
    <label class="tag">
        <input type="checkbox" ref="input" checked={ enabled } onchange={ save }> { source } ➪ { destination }</label>
    <script>
    	save = (e) => {
	    	e.item.enabled = this.refs.input.checked;
    		this.parent.save(e);
    	}
    </script>
</homophone>
