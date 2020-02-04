<template lang="pug">
  div.home
    RESTTable(:host="'http://rest'", :selectedtable = "'obj2'", :columnsupdated="columnsupdated")
</template>

<script>
    import RESTTable from "../components/RESTTable";
export default {
  name: 'home',
  components: {RESTTable},
  data: function () {
    return {
      columnsupdated: function (cols) {
        cols.set('id',{label: 'TRUST'});
        cols.delete('name');
        return cols;
      }
    }
  }
}
</script>
