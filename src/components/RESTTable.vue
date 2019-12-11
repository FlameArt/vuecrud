<template>

    <div class="col-xs-12 table-responsive">
        <div class="datatableFilters">
            <div class="input-group" v-for="col in Table.columns" v-show="col.hasFilter">
                <div class="input-group-prepend">
                    <span class="input-group-text" id="basic-addon1">{{col.label}}</span>
                </div>

                <!-- Если это текстовое поле -->
                <input v-if="col.type==='text' || col.type==='fixed'" type="text" class="form-control" v-model="col.filter" :placeholder="col.label" aria-label="Username" aria-describedby="basic-addon1">

                <input v-if="col.type==='number'"  type="text" class="form-control" v-model="col.filterRange.from" :placeholder="'от'" aria-label="Username" aria-describedby="basic-addon1"/>
                <input v-if="col.type==='number'"  type="text" class="form-control" v-model="col.filterRange.to" :placeholder="'до '" aria-label="Username" aria-describedby="basic-addon1"/>


            </div>
        </div>
        <datatable name="mainTable" :columns="Table.columns" :data="getData" :per-page="Pager.PerPage">
            <!--
            <template slot-scope="{ row, columns }">
                <tr class="datatable_FilterHeader" v-if="false">
                    <td v-for="col in Table.columns"><input v-model="col.filter"></td>
                </tr>
                <tr>
                    <td v-for="col in columns">{{ row[col.field] }}</td>
                </tr>
            </template>
            -->
        </datatable>
        <datatable-pager table="mainTable" v-model="Pager.Page" type="abbreviated"></datatable-pager>
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
        li: 'page-item page-link',
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
    props: ['host', 'selectedtable', 'columnsupdated', 'rowsupdated', 'beforeGetRows'],
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
          let request = {
            tablename: SuperTHAT.Table.name,
            where: null,
            expand: null,
            fields: null,
            sort: null,
            page: page,
            perPage: perPage
          };

          // Сортировка
          if(sortDir === 'asc') request.sort = sortBy;
          if(sortDir === 'desc') request.sort = "-" + sortBy;

          // Фильтрация
          // Идём по всем колонкам и добавляем их в запрос
          let TotalWhere = {};
          for (let column of SuperTHAT.Table.columns) {
            // Частичное совпадение
            if(column.type ==='text' && column.filter !== '') {
              TotalWhere[column.field] = ['LIKE', column.field, column.filter];
            }
            // Точное совпадение
            if(column.type ==='fixed' && column.filter !== '') {
              TotalWhere[column.field] = column.filter;
            }
            // От до
            if(column.type ==='number') {
              if(column.filterRange.from!=='')
                TotalWhere[column.field+"from"] = ['>=', column.field, column.filterRange.from];
              if(column.filterRange.to!=='')
                TotalWhere[column.field+"to"] = ['<=', column.field, column.filterRange.to];
            }
          }
          if(Object.keys(TotalWhere).length>0)
            request.where = TotalWhere;


          // Применяем к запросу коллбек, если он прописан
          if(typeof SuperTHAT.beforeGetRows === 'function')
            request = SuperTHAT.beforeGetRows(request);


          // Получаем данные
          let data = await SuperTHAT.REST.get(request.tablename, request.where, request.expand, request.fields, request.sort, request.page, request.perPage);
          let rows = data.data;

          // Обрабатываем данные перед выводом
          if(typeof SuperTHAT.rowsupdated === 'function')
            rows = SuperTHAT.rowsupdated(rows, SuperTHAT.Table.columns, SuperTHAT.Table);

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
          // Типы:
          // text - поиск через частичное совпадение
          // number - поиск через от - до
          // fixed - точное совпадение
          let cols = that.Table.schema.map( col => { return {label: col.comment, field: col.name, filter: '', filterRange: {from: '', to: ''}, hasFilter: false, type: col.type === "integer" ? 'number' : 'text' }} );

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

    .datatable_FilterHeader:first-child {
        background-color: rgba(236,236,236,0.55);
    }
    .datatable_FilterHeader:not(:first-child) {
        display: none;
    }

    .datatableFilters {
        display: flex;
        flex-direction: row;
    }

</style>