<options-page>
    <h2>Options</h2>
    <!-- place the custom tag anywhere inside the body -->
    <table>
        <thead>
            <th>Enabled</th>
            <th>Name</th>
            <th>Description</th>
            <th>Command Words</th>
        </thead>
        <tbody>
	        <tr each={ cmds }>
		        <td><input type="checkbox"/></td>
	        	<td>{ name }</td>
	        	<td></td>
	        	<td></td>
	        </tr>
        </tbody>
    </table>
    <script>
    	this.cmds = opts.cmds;
    </script>
</options-page>