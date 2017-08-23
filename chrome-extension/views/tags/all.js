riot.tag2('cmd-group', '<tr>{name}</tr>', '', '', function(opts) {
});
riot.tag2('cmd', '<tr> <td> <input type="checkbox"> </td> <td>{name}</td> <td>{description}</td> <td>{cmdWords}</td> </tr>', '', '', function(opts) {
});
riot.tag2('options-page', '<div class="container"> <h2>Options</h2> <div each="{cmdGroups}" class="cmd-group"> <div class="collapser-shell {collapsed: collapsed, enabled: enabled}"> <a class="collapser" title="Click to {collapsed ? \'expand\' : \'collapse\'}" onclick="{toggleCollapsed}" href="#"> <div class="label">{name}</span> <span class="version">v{version}</span> <span class="right-controls"><label onclick="{toggleGroupEnabled}"><input type="checkbox"> Enabled</label></span> <div class="desc">{description}</div></div> </a> <div class="collapsable"> <div class="collapsable-inner"> <div class="homophones"> <div class="label"> <strong>Homophones/synonyms: </strong> </div> <div class="tag-list"> <span class="tag" each="{k, v in homophones}">{v}:{k}</span> </div> </div> <table> <thead> <th>Enabled</th> <th>Name</th> <th>Description</th> <th>Command Words</th> </thead> <tbody> <tr each="{commands}" class="cmd"> <td class="enable"><input type="checkbox" checked></td> <td class="name">{name}</td> <td class="desc">{description}</td> <td if="{typeof match == \'object\'}"><span class="tag" each="{name, i in match}">{name}</span></td> <td if="{typeof match == \'string\'}"><span class="tag">{match}</span></td> </tr> </tbody> </table> </div> </div> </div> </div> </div>', 'options-page input[type=checkbox],[data-is="options-page"] input[type=checkbox],options-page input[type=radio],[data-is="options-page"] input[type=radio]{ vertical-align: middle; position: relative; bottom: 1px; } options-page .homophones .label,[data-is="options-page"] .homophones .label{ float: left; width: 20%; } options-page .homophones,[data-is="options-page"] .homophones{ margin-bottom: 15px; display: block; float: left; } options-page .homophones .tag-list,[data-is="options-page"] .homophones .tag-list{ float: left; width: 70%; text-align: left; } options-page input[type=radio],[data-is="options-page"] input[type=radio]{ bottom: 2px; } options-page td.enable,[data-is="options-page"] td.enable{ text-align: center; } options-page .collapser .label,[data-is="options-page"] .collapser .label{ margin-left: 15px; } options-page .desc,[data-is="options-page"] .desc{ font-style: italic; color: #a4a4a4; text-align: left; } options-page .cmd .desc,[data-is="options-page"] .cmd .desc{ font-style: normal; } options-page .version,[data-is="options-page"] .version{ margin-left: 10px; color: #a4a4a4; } options-page .enabled .collapser,[data-is="options-page"] .enabled .collapser{ color: #222; } options-page .enabled .desc,[data-is="options-page"] .enabled .desc{ color: #868686; } options-page .enabled .version,[data-is="options-page"] .enabled .version{ color: #868686; } options-page .cmd-group,[data-is="options-page"] .cmd-group{ margin: 10px 0; } options-page .right-controls,[data-is="options-page"] .right-controls{ float: right; margin-right: 20px; } options-page .container,[data-is="options-page"] .container{ max-width: 900px; margin: 0 auto; } options-page .collapser,[data-is="options-page"] .collapser{ width: 100%; line-height: 1.2rem; text-align: left; background-color: #eee; color: #888; border-left: 1px solid #888; padding: 3px 5px; text-decoration: none; display: block; } options-page .collapser:before,[data-is="options-page"] .collapser:before{ content: \'-\'; position: absolute; } options-page .collapsed .collapser:before,[data-is="options-page"] .collapsed .collapser:before{ content: \'+\'; } options-page .collapser-shell,[data-is="options-page"] .collapser-shell{ } options-page .collapsable,[data-is="options-page"] .collapsable{ transition: max-height 0.35s ease-out; display: block; background-color: #f5f5f5; overflow: hidden; } options-page .collapsable-inner,[data-is="options-page"] .collapsable-inner{ padding: 10px 20px; } options-page .collapsed .collapsable,[data-is="options-page"] .collapsed .collapsable{ max-height: 0 !important; } options-page .tag,[data-is="options-page"] .tag{ background-color: #e6e6e6; border-radius: 3px; line-height: 1.5em; margin: 2px; display: inline-block; padding: 3px 6px; white-space: nowrap; } options-page table,[data-is="options-page"] table{ display: block; margin-top: 15px; } options-page tr,[data-is="options-page"] tr{ vertical-align: top; } options-page tbody,[data-is="options-page"] tbody,options-page thead,[data-is="options-page"] thead{ text-align: left; } options-page td,[data-is="options-page"] td{ border-top: 1px solid #ddd; padding: .7rem; } options-page th,[data-is="options-page"] th{ padding: 0 .7rem; }', '', function(opts) {


        function init () {
            $('.collapsable').each(function(i, ele) {
                let $ele = $(ele);
                $ele.css('max-height', $ele.parent().find('.collapsable').height());
            });
        }

        this.cmdGroups = opts.cmdGroups;

        this.cmdGroups.map((item)=>{
            item.collapsed = false;
            item.enabled = true;

            item.commands.map((cmd)=>{

                cmd.description = cmd.description ? cmd.description : null;
            });
        });

        this.toggleGroupEnabled = function (e) {

            e.stopPropagation();
            let item = e.item;
            console.log('toggleGroupEnabled ' + e.srcElement.innerHTML);

            item.enabled = e.target.checked;
            return false;

        }.bind(this)

        this.toggleCollapsed = function (e) {
           let item = e.item;
           let $ele = $(e.srcElement);
            console.log('toggleCollapsed ' + e.srcElement.innerHTML);
           item.collapsed = !item.collapsed;
       }.bind(this)

       $(document).ready(function() {
        init();
    });
});