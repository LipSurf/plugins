<cmd class="cmd">
  <td class="enable"><input type="checkbox" checked /></td>
  <td class="name">{ name }</td>
  <td class="desc">{ description }</td>
  <td if={ typeof match == 'object' }><span class="tag" each="{ name, i in match }">{ name }</span></td>
  <td if={ typeof match == 'string' }><span class="tag" >{ match }</span></td>
</cmd>