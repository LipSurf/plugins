riot.tag2('cmd-group', '<tr>{name}</tr>', '', '', function(opts) {
});
riot.tag2('cmd', '<tr> <td> <input type="checkbox"> </td> <td>{name}</td> <td>{description}</td> <td>{cmdWords}</td> </tr>', '', '', function(opts) {
});
riot.tag2('options-page', '<h2>Options</h2> <table> <thead> <th>Enabled</th> <th>Name</th> <th>Description</th> <th>Command Words</th> </thead> <tbody> <tr each="{cmds}"> <td><input type="checkbox"></td> <td>{name}</td> <td></td> <td></td> </tr> </tbody> </table>', '', '', function(opts) {
    	this.cmds = opts.cmds;
});