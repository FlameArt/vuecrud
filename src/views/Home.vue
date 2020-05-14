<template lang="pug">
  div.home
      vuecrud(host="http://rest", selectedtable = "obj2", :columnsupdated="columnsupdated")
</template>

<script>
    import vuecrud from "../components/RESTTable";
export default {
  name: 'home',
  components: {vuecrud},
  data: function () {
    return {
      columnsupdated: function (cols) {
        cols.delete('id', {isShowOnPopup: false, label: "LOL", editName: "LLLLAL"});
        cols.delete('image', {isShowOnPopup: true, popupType: 'image'});
        cols.set('luuuuuuuuuuuuuuuuuuuuuuul',{label: 'TRUST INFO', hasFilter: true, editName: 'TRUST INFO', editDesc: 'Инфа', isShow: false, isShowOnPopup: true, isEdit: false});
        cols.set('name', {isEdit: false, popupType: 'text', popupTextRows: 15});
        cols.set('name', {isEdit: true, popupType: 'button', buttonFunction: (row,rest)=> alert(rest) });
        cols.set('test', {type: 'json', schema: {
          name: "aaa",
            index: "aaab"
          }});
        cols.set('key', {isLoadKeys: true, selectRepresentAs: item=>item.id});
        return cols;
      }
    }
  }
}
</script>

