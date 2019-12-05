<template lang="pug">
  div.home
    RESTTable(:host="'http://rest'", :selectedtable = "'obj2'")
</template>

<script>
    import RESTTable from "../components/RESTTable";
export default {
  name: 'home',
  components: {RESTTable},
}
</script>
