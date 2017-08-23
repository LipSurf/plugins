<options-page>
    <div class="container">
        <h2>Options</h2>
        <!-- place the custom tag anywhere inside the body -->
        <div each={ cmdGroups } class="cmd-group">
            <div class="collapser-shell { collapsed: collapsed, enabled: enabled }">
                <a class="collapser" title="Click to { collapsed ? 'expand' : 'collapse' }" onclick={ toggleCollapsed } href="#">
                    <div class="label">{ name }</span> <span class="version">v{ version }</span> <span class="right-controls"><label onclick={ toggleGroupEnabled }><input type="checkbox"/> Enabled</label></span>
                     <div class="desc">{ description }</div></div>
                 </a>
                 <div class="collapsable">
                    <div class="collapsable-inner">
                        <div class="homophones">
                            <div class="label">
                               <strong>Homophones/synonyms: </strong>
                           </div>
                           <div class="tag-list">
                               <span class="tag" each={ k, v in homophones }>{ v }:{ k }</span>
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
                         <tr each={ commands } class="cmd">
                          <td class="enable"><input type="checkbox" checked /></td>
                          <td class="name">{ name }</td>
                          <td class="desc">{ description }</td>
                          <td if={ typeof match == 'object' }><span class="tag" each="{ name, i in match }">{ name }</span></td>
                          <td if={ typeof match == 'string' }><span class="tag" >{ match }</span></td>
                      </tr>
                  </tbody>
              </table>
          </div>
      </div>
  </div>
</div>
</div>
<style>
    input[type=checkbox], input[type=radio] {
        vertical-align: middle;
        position: relative;
        bottom: 1px;
    }

    .homophones .label {
        float: left;
        width: 20%;
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
    }

    .right-controls {
        float: right;
        margin-right: 20px;
    }

    .container {
        max-width: 900px;
        margin: 0 auto;
    }

    .collapser {
        /*font-size: 1.05rem;*/
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

    .collapser-shell {
    }

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

    tbody, thead {
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
        // set the max height on each accordion item, then shrink the ones
        // that need to be based on user settings
        function init () {
            $('.collapsable').each(function(i, ele) {
                let $ele = $(ele);
                $ele.css('max-height', $ele.parent().find('.collapsable').height());
            });
        }

        this.cmdGroups = opts.cmdGroups;

        // TODO: load from settings
        this.cmdGroups.map((item)=>{
            item.collapsed = false;
            item.enabled = true;

            item.commands.map((cmd)=>{
                // make sure it's defined so we don't take parents
                cmd.description = cmd.description ? cmd.description : null;
            });
        });

        toggleGroupEnabled (e) {
            // e.preventDefault();
            e.stopPropagation();
            let item = e.item;
            console.log('toggleGroupEnabled ' + e.srcElement.innerHTML);
            // item.enabled = !item.enabled;
            item.enabled = e.target.checked;
            return false;
            // e.preventUpdate = true;
            // this.update();
            // looped item

            // index on the collection
        }

        toggleCollapsed (e) {
           let item = e.item;
           let $ele = $(e.srcElement);
            console.log('toggleCollapsed ' + e.srcElement.innerHTML);
           item.collapsed = !item.collapsed;
       }

       $(document).ready(function() {
        init();
    });
</script>
</options-page>