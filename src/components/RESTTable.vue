<template>

    <div class="col-xs-12 table-responsive">
        <datatable name="mainTable" :columns="Table.columns" :data="getData" :per-page="Pager.PerPage"></datatable>
        <datatable-pager table="mainTable" v-model="Pager.Page"></datatable-pager>
    </div>


</template>

<script>

  // Импортим таблицу
  import Vue from 'vue'
  import { TColumnsDefinition, VuejsDatatableFactory } from 'vuejs-datatable';

  // Импортим REST
  import FLAMEREST from "flamerest";

  // That, который устанавливается после инициализации Vue шаблона
  let SuperTHAT = null;

  // Подгружаем компонент таблиц
  Vue.use( VuejsDatatableFactory );

  // Настраиваем дизайн таблицы
  VuejsDatatableFactory.useDefaultType( false )
  .registerTableType( 'datatable', tableType => tableType
  .mergeSettings( {
    table: {
      class:   'table table-hover table-striped',
      /*
      sorting: {
        sortAsc:  '<i class="fas fa-sort-amount-up" title="Sort ascending"></i>',
        sortDesc: '<i class="fas fa-sort-amount-down" title="Sort descending"></i>',
        sortNone: '<i class="fas fa-sort" title="Sort"></i>',
      },
      */
    },
    pager: {
      classes: {
        pager:    'pagination text-center',
        selected: 'active',
      },
      icons: {
        next:     '<i class="fas fa-chevron-right" title="Next page"></i>',
        previous: '<i class="fas fa-chevron-left" title="Previous page"></i>',
      },
    },
  }));

  export default {
    name: "vueresttable",
    props: ['host', 'selectedtable', 'columnsupdated', 'rowsupdated'],
    data: function () {
      return {

        /**
         * @param {FLAMEREST} REST
         */
        REST: null,

        /**
         * Список таблиц с их схемами
         */
        Tables: [],

        /**
         * Выбранная таблица с содержимым
         */
        Table: {
          name: '',
          schema: {},
          columns: [],
          rows: [],
        },

        /**
         * Инфа по странице
         */
        Pager: {
          Page: 1,
          Total: 0,
          PerPage: 20,
          Count: 0
        },

        /**
         * Способ получения данных
         * @param sortBy
         * @param sortDir
         * @param perPage
         * @param page
         * @return {Promise<{totalRowCount: *, rows: *}>}
         */
        async getData( { sortBy, sortDir, perPage, page } ) {

          // Формируем запрос
          let sort = null;
          if(sortDir === 'asc') sort = sortBy;
          if(sortDir === 'desc') sort = "-" + sortBy;

          // Получаем данные
          let data = await SuperTHAT.REST.get(SuperTHAT.Table.name, null, null, null, sort, page, perPage);
          let rows = data.data;

          // Обрабатываем данные перед выводом
          if(typeof SuperTHAT.rowsupdated === 'function')
            rows = SuperTHAT.rowsupdated(rows);

          // Устанавливаем их
          SuperTHAT.Pager.Total = data.pages.total;
          SuperTHAT.Pager.Count = data.pages.count;

          // Так же справочно записываем в массив
          Vue.set(SuperTHAT.Table,'rows', rows);

          return {
            rows: rows,
            totalRowCount: SuperTHAT.Pager.Total,
          }

        }

        }
    },
    methods: {
    },

    mounted() {

      let that = this;

      SuperTHAT = that;

      // Устанавливаем REST
      this.REST = new FLAMEREST(this.host);
      window.REST = this.REST;

      // Получаем схему CRUD
      this.REST.getCRUDInfo()
      .then(res=>{

        // Если выбрана таблица, устанавливаем её
        if(that.selectedtable!==undefined) {

          Vue.set(that.Table, 'name', that.selectedtable);
          Vue.set(that.Table, 'schema', (res.data.find(table=>table.name===that.selectedtable)).fields);

          // Преобразуем колонки в формат компонента
          let cols = that.Table.schema.map( col => { return {label: col.comment, field: col.name}} );

          // Применяем к формату колонок коллбек, для их кастомизации
          if(typeof that.columnsupdated === 'function')
            cols = that.columnsupdated(cols);

          if(!Array.isArray(cols) || cols.length===0)
            console.error("Не найдено колонок в таблице или они имеют ошибочный формат (нужен массив)")

          // Сохраняем преобразованные колонки
          Vue.set(that.Table, 'columns', cols);

          // Прогружаем сами записи
          return that.REST.get(that.Table.name);

        }

      })
      .then(res=>{

        // Загружаем записи в таблицу
        //Vue.set(that.Table, 'rows', res.data);

      });

    }

  }
</script>

<style scoped>

</style>