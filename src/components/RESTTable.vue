<template>

    <div class="col-xs-12 table-responsive" flamecrud>

        <div class="btn btn-primary" style="cursor: pointer;" v-show="opts.canAdd===true" @click="popupAdd()">
            + Добавить
        </div>

        <div class="datatableFilters">
            <div class="input-group" v-for="col in Table.columns" v-show="col.hasFilter">

                <div class="input-group-prepend">
                    <span class="input-group-text" :id="'basic-addon'+col.label">{{col.label}}</span>
                </div>

                <!-- Если это текстовое поле -->
                <input v-if="col.type==='text' || col.type==='fixed'" type="text" class="form-control"
                       v-model="col.filter" :placeholder="col.label" aria-label="Username"
                       :aria-describedby="'basic-addon'+col.label">

                <input v-if="col.type==='number'" type="text" class="form-control" v-model="col.filterRange.from"
                       :placeholder="'от'" aria-label="Username" :aria-describedby="'basic-addon'+col.label"/>
                <input v-if="col.type==='number'" type="text" class="form-control" v-model="col.filterRange.to"
                       :placeholder="'до '" aria-label="Username" :aria-describedby="'basic-addon'+col.label"/>


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

        <!-- ПОПАП С РЕДАКТИРОВАНИЕМ ИНФОРМАЦИИ ОБ ЭЛЕМЕНТЕ -->
        <div id="popupWindow">
            <transition name="datatable-modal">
                <div class="datatable-modal-mask" v-show="Popup.isPopupShowed">
                    <div class="datatable-modal-wrapper">
                        <div class="datatable-modal-container">

                            <div class="datatable-modal-header">
                                {{Popup.buttonSaveName.toUpperCase()}}
                            </div>

                            <div class="datatable-modal-body">
                                <form>
                                    <div v-for="col in Table.columns" v-if="col.isShowOnPopup || col.isShow || col.isEdit">
                                        <div v-if="col.linkedto===null || col.isLoadKeys===false"
                                             class="input-group mb-3">
                                            <div class="input-group-prepend">
                                            <span class="input-group-text"
                                                  style="min-width: 200px; max-width: 200px; word-wrap: break-word; overflow-wrap: break-word;"
                                                  :id="'basic-addon'+col.label">{{col.editName}}</span>
                                            </div>
                                            <input v-model="Popup.Fields[col.field]" type="text" class="form-control"
                                                   :placeholder="col.editDesc" aria-label="Имя пользователя"
                                                   :aria-describedby="'basic-addon'+col.label" :readonly="!col.isEdit && Popup.editField!==''">
                                        </div>
                                        <div v-else class="input-group-prepend">
                                            <span class="input-group-text"
                                                  style="min-width: 200px; max-width: 200px; word-wrap: break-word; overflow-wrap: break-word;"
                                                  :id="'basic-addon'+col.label">{{col.editName}}</span>
                                            <select v-model="Popup.Fields[col.field]" class="form-control">
                                                <option v-for="item in col.selectResults" :value="item[col.linkedto.field]" :disabled="!col.isEdit && Popup.editField!==''">
                                                    {{col.selectRepresentAs(item)}}
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div class="datatable-modal-footer">
                                <button v-show="opts.canRemove" class="btn btn-dark datatable-popup-remove"
                                        @click="removePopup()">
                                    Удалить
                                </button>
                                <button class="btn btn-light" style="text-align: center"
                                        @click="Popup.isPopupShowed=false">
                                    Отмена
                                </button>
                                <button class="btn btn-success datatable-popup-save" @click="savePopup()">
                                    {{Popup.buttonSaveName}}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </div>


</template>

<script>

  // Импортим таблицу
  import Vue from 'vue'
  import {TColumnsDefinition, VuejsDatatableFactory} from 'vuejs-datatable';

  // Импортим REST
  import FLAMEREST from "flamerest";

  // That, который устанавливается после инициализации Vue шаблона
  let SuperTHAT = null;

  // Подгружаем компонент таблиц
  Vue.use(VuejsDatatableFactory);

  // Настраиваем дизайн таблицы
  VuejsDatatableFactory.useDefaultType(false)
  .registerTableType('datatable', tableType => tableType
  .mergeSettings({
    table: {
      class: 'table table-hover table-striped',
      row: {
        class: 'datatable-edit-link'
      }
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
        pager: 'pagination text-center',
        li: 'page-item page-link',
        selected: 'active',
      },
      icons: {
        next: '<i class="fas fa-chevron-right" title="Next page"></i>',
        previous: '<i class="fas fa-chevron-left" title="Previous page"></i>',
      },
    },
  }));

  export default {
    name: "vueresttable",
    props: {
      opts: {
        type: Object,
        default: function () {
          return {
            canAdd: true,
            canRemove: true,
            canEdit: true
          }
        }
      },
      host: String,
      selectedtable: String,
      columnsupdated: Function,
      rowsupdated: Function,
      beforeGetRows: Function
    },
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
         * Параметры попапа изменения и добавления элемента
         */
        Popup: {

          /**
           * Попап показан
           **/
          isPopupShowed: false,

          /**
           * Название кнопки: добавить\сохранить
           */
          buttonSaveName: "Добавить",

          /**
           * Имя изменяемого поля
           */
          editField: '',

          /**
           * ID изменяемого поля (с названием в editField)
           */
          editID: 0,

          /**
           * Модели для каждого поля в попапе
           */
          Fields: {},

        },

        /**
         * Способ получения данных
         * @param sortBy
         * @param sortDir
         * @param perPage
         * @param page
         * @return {Promise<{totalRowCount: *, rows: *}>}
         */
        async getData({sortBy, sortDir, perPage, page}) {

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
          if (sortDir === 'asc') request.sort = sortBy;
          if (sortDir === 'desc') request.sort = "-" + sortBy;

          // Фильтрация
          // Идём по всем колонкам и добавляем их в запрос
          let TotalWhere = {};
          for (let column of SuperTHAT.Table.columns) {
            // Частичное совпадение
            if (column.type === 'text' && column.filter !== '') {
              TotalWhere[column.field] = ['LIKE', column.field, column.filter];
            }
            // Точное совпадение
            if (column.type === 'fixed' && column.filter !== '') {
              TotalWhere[column.field] = column.filter;
            }
            // От до
            if (column.type === 'number') {
              if (column.filterRange.from !== '')
                TotalWhere[column.field + "from"] = ['>=', column.field, column.filterRange.from];
              if (column.filterRange.to !== '')
                TotalWhere[column.field + "to"] = ['<=', column.field, column.filterRange.to];
            }
          }
          if (Object.keys(TotalWhere).length > 0)
            request.where = TotalWhere;


          // Применяем к запросу коллбек, если он прописан
          if (typeof SuperTHAT.beforeGetRows === 'function')
            request = SuperTHAT.beforeGetRows(request);


          // Получаем данные
          let data = await SuperTHAT.REST.get(request.tablename, request.where, request.expand, request.fields, request.sort, request.page, request.perPage);
          let rows = data.data;

          // Обрабатываем данные перед выводом
          if (typeof SuperTHAT.rowsupdated === 'function')
            rows = SuperTHAT.rowsupdated(rows, SuperTHAT.Table.columns, SuperTHAT.Table);

          // Устанавливаем их
          SuperTHAT.Pager.Total = data.pages.total;
          SuperTHAT.Pager.Count = data.pages.count;

          // Так же справочно записываем в массив
          Vue.set(SuperTHAT.Table, 'rows', rows);

          return {
            rows: rows,
            totalRowCount: SuperTHAT.Pager.Total,
          }

        }

      }
    },
    methods: {

      /**
       * Показать попап с добавлением данных
       */
      popupAdd: function () {

        // Добавляем поля json в массив
        /*
        let Fields = {};
        for (let column in this.Table.columns) {
          if(column.type !== 'json')
            Fields[column] = null;
          else {
            Fields[column]={};
            for (let key in column.schema) {
              Fields[column][key]="";
            }
          }
        }
         */

        // Указываем при добавлении, что нет изменяемых полей - это добавление
        Vue.set(this.Popup, 'editID', "");
        Vue.set(this.Popup, 'editField', "");
        Vue.set(this.Popup, 'buttonSaveName', "Добавить");
        Vue.set(this.Popup, 'isPopupShowed', true);
      },

      /**
       * Показать попап с изменением данных
       */
      popupEdit: function (fieldName, fieldID, fieldType) {

        if(fieldType==='integer') fieldID=parseInt(fieldID);

        // Указываем изменяемые поля
        Vue.set(this.Popup, 'editID', fieldID);
        Vue.set(this.Popup, 'editField', fieldName);
        Vue.set(this.Popup, 'buttonSaveName', "Сохранить");

        // Находим редактируемую запись
        let item = this.Table.rows.find(row => row[fieldName] === fieldID);
        if (item === undefined) {
          console.error('Не найдена обновляемая запись: ' + fieldName + " = " + fieldID);
          return;
        }

        // Устанавливаем ссылку на оригинальный элемент, и прикрепляем его к модели
        Vue.set(this.Popup, 'Fields', item);

        Vue.set(this.Popup, 'isPopupShowed', true);
      },


      /**
       * Сохранить параметры в попапе
       * @param ev
       */
      savePopup: function (ev) {

        // В зависимости от типа: нужно сохранить или изменить запись

        // Добавление
        if (this.Popup.editField === "") {
          this.REST.create(this.Table.name, this.Popup.Fields);
        }
        // Изменение
        else {
          this.REST.edit(this.Table.name, this.Popup.editID, this.Popup.Fields);
        }
        Vue.set(this.Popup, 'isPopupShowed', false);
      },

      removePopup: function () {

        // Запрашиваем подтверждение
        if (!window.confirm("ВЫ УВЕРЕНЫ, ЧТО ХОТИТЕ УДАЛИТЬ ЗАПИСЬ: " + JSON.stringify(this.Popup.Fields) + '?')) return;

        // Удаляем
        this.REST.remove(this.Table.name, this.Popup.editID).then(res => {
          debugger;
        })

        // Закрываем окно
        Vue.set(this.Popup, 'isPopupShowed', false);

      }

    },

    mounted() {

      let that = this;

      SuperTHAT = that;

      // Устанавливаем REST
      this.REST = new FLAMEREST(this.host);
      window.REST = this.REST;

      // Получаем схему CRUD
      this.REST.getCRUDInfo()
      .then(res => {

        // Если выбрана таблица, устанавливаем её
        if (that.selectedtable !== undefined) {

          Vue.set(that.Table, 'name', that.selectedtable);
          Vue.set(that.Table, 'schema', (res.data.find(table => table.name === that.selectedtable)).fields);
          Vue.set(that, 'Tables', res.data);


          // Преобразуем колонки в формат компонента
          // Типы:
          // text - поиск через частичное совпадение
          // number - поиск через от - до
          // fixed - точное совпадение
          let cols = that.Table.schema.map(col => {
            return {
              label: col.comment,
              field: col.name,
              filter: '',
              filterRange: {from: '', to: ''},
              hasFilter: false,
              type: col.type === "integer" ? 'number' : 'text',
              linkedto: col.linkedto,
              selectResults: [],
              /**
               * Загружать ли данные от foreign keys, т.к. данных может быть много, по-умолчанию выключено
               */
              isLoadKeys: false,
              selectRepresentAs: function (item) {
                return item
              },
              editName: col.name,
              editDesc: col.comment,

              isShow: true,
              isEdit: true,
              isShowOnPopup: true

            }
          });

          // Добавляем хелперы в колонки, которыми можно быстро изменить состояние
          Object.defineProperty(cols, 'set', {
            configurable: true, enumerable: false, value: function (FieldName, Params) {
              let findedObj = this.find(res => res.field === FieldName);
              if (findedObj === undefined) {
                console.error("VUE Datatable Set Column: Object not found - " + FieldName);
                return this;
              }
              Object.assign(findedObj, Params);
              return this;
            }
          });
          Object.defineProperty(cols, 'delete', {
            configurable: true, enumerable: false, value: function (FieldName) {
              let findedObjIndex = this.findIndex(res => res.field === FieldName);
              if (findedObjIndex === -1) {
                console.error("VUE Datatable Delete Column: Object not found - " + FieldName);
                return this;
              }


              // Помечаем непоказываемыми
              this[findedObjIndex].isShow = false;
              this[findedObjIndex].isEdit = false;
              this[findedObjIndex].isShowOnPopup = false;

              this.splice(findedObjIndex, 1);

              return this;
            }
          });

          // Применяем к формату колонок коллбек, для их кастомизации
          if (typeof that.columnsupdated === 'function') {
            let changedCols = that.columnsupdated(cols, that)
            // Если забыли вернуть значение, ничего, можно пользоваться просто set и delete и всё будет ок
            if (changedCols !== undefined && Array.isArray(changedCols))
              cols = changedCols;
          }

          // Выбираем первую колонку как primary key и устанавливаем её вид как ссылку на редактирование,
          // если у неё нет замещатора и редактирование поддерживается
          for (let i = 0; i < cols.length; i++) {
            if (cols[i].representedAs === undefined && this.opts.canEdit === true) {
              if (i === 0)
                cols[i].representedAs = function (row) {
                  return '<a class="btn btn-light" style="color: #0aaee7;" onclick="document.querySelectorAll(\'[flamecrud]\')[0].__vue__.popupEdit(\'' + that.Table.schema[0].name + '\',\'' + row[that.Table.schema[0].name] + '\',\'' + that.Table.schema[0].type+'\')">' + row[cols[i].field] + '</a>'
                }
              else
                cols[i].representedAs = function (row) {
                  return '<a class="datatable-edit-link" onclick="document.querySelectorAll(\'[flamecrud]\')[0].__vue__.popupEdit(\'' + that.Table.schema[0].name + '\',\'' + row[that.Table.schema[0].name]  + '\',\'' + that.Table.schema[0].type+'\')">' + row[cols[i].field] + '</a>'
                }
              cols[i].interpolate = true;
            }
          }

          if (!Array.isArray(cols) || cols.length === 0)
            console.error("Не найдено колонок в таблице или они имеют ошибочный формат (нужен массив)")

          // Сохраняем преобразованные колонки
          Vue.set(that.Table, 'columns', cols);

          // Прогружаем сами записи
          return that.REST.get(that.Table.name);

        }

      })
      .then(res => {

        // Загружаем данные зависимых таблиц
        let allPromises = [];
        for (let column of that.Table.columns) {
          if (column.linkedto !== null && column.isLoadKeys === true) {
            allPromises.push(new Promise((resolve, reject) => {
              that.REST.get(column.linkedto.table, null, null, null, null, 1, 99999).then((res) => {
                Vue.set(column, 'selectResults', res.data);
                resolve();
              })
            }))
          }
        }

      });

    }

  }
</script>

<style>

    .datatable_FilterHeader:first-child {
        background-color: rgba(236, 236, 236, 0.55);
    }

    .datatable_FilterHeader:not(:first-child) {
        display: none;
    }

    .datatableFilters {
        display: flex;
        flex-direction: row;
    }

    .datatable-modal-mask {
        position: fixed;
        z-index: 9998;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, .5);
        display: table;
        transition: opacity .3s ease;
    }

    .datatable-modal-wrapper {
        display: table-cell;
        vertical-align: middle;
    }

    .datatable-modal-container {
        width: 800px;
        margin: 0px auto;
        padding: 10px 10px;
        background-color: #fff;
        border-radius: 2px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
        transition: all .3s ease;
        font-family: Helvetica, Arial, sans-serif;
    }

    .datatable-modal-header {
        margin-top: 0;
        color: #42b983;
    }

    .datatable-modal-body {
        margin: 0px 0;
    }

    .datatable-modal-default-button {
        float: right;
    }

    /*
     * The following styles are auto-applied to elements with
     * transition="modal" when their visibility is toggled
     * by Vue.js.
     *
     * You can easily play with the modal transition by editing
     * these styles.
     */

    .datatable-modal-enter {
        opacity: 0;
    }

    .datatable-modal-leave-active {
        opacity: 0;
    }

    .datatable-modal-enter .modal-container,
    .datatable-modal-leave-active .modal-container {
        -webkit-transform: scale(1.1);
        transform: scale(1.1);
    }

    .datatable-edit-link td a:hover {
        color: #0aaee7;
        text-decoration: rgba(37, 126, 185, 0.16) underline;
        cursor: pointer;
    }

    .datatable-popup-remove {
        float: left;
    }

    .datatable-popup-save {
        float: right;
    }


</style>