<template lang="pug">
  div.home
      div(@click="exportE()") EXPORT EXCEL
      vuecrud(ref="LUL", host="http://rest", selectedtable = "obj2", :columnsupdated="columnsupdated", :opts="opts")
        template(v-slot:row1="binds")
          tr
            td {{binds.row.name}}
            td {{binds.columns[0].name}}
            td f
            td f
        template(v-slot:popupHeader="bind")
          div TEST

</template>

<script>
    import vuecrud from "../components/RESTTable";
export default {
  name: 'home',
  components: {vuecrud},
  data: function () {
    return {
      columnsupdated: function (cols) {
        cols.set('id', {isShowOnPopup: false, label: "LOL", editName: "LLLLAL", hasFilter: true, type: "number"});
        cols.delete('image', {isShowOnPopup: true, popupType: 'image', isLoadToTable: false});
        cols.set('luuuuuuuuuuuuuuuuuuuuuuul',{label: 'TRUST INFO', hasFilter: true, filterRow: 1, filterColumn: 0, filterMinSymbolsRequest: 2, editName: 'TRUST INFO', editDesc: 'Инфа', isShow: false, isShowOnPopup: true, isEdit: false});
        cols.set('name', {isEdit: false, popupType: 'text', popupTextRows: 15});
        cols.set('name', {isEdit: true, popupType: 'button', buttonFunction: (row,rest)=> alert(rest) });
        cols.set('test', {type: 'json',  schema: {
          name: "aaa",
            index: "aaab"
          }});
        cols.set('key', {isLoadKeys: true, loadKeysParams: {where: {id: 1}}, selectRepresentAs: item=>item.id});
        return cols;
      },

      opts: {
        where: {id: 1,},canEdit: true
        //filterRowMargin: 50
      }
    }
  },
  methods: {
    exportE: function (){
      this.$refs.LUL.export('xlsx');
    }
  }
}
</script>

