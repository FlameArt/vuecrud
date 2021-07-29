<template>

  <div class="col-xs-12 table-responsive" flamecrud>


    <div style="z-index: 999999999" id="PopupAvatarPopup" v-show="Popup.Avatar.isEnabled">
      <vue-avatar :width="Popup.Avatar.width" :height="Popup.Avatar.height" :scale="Popup.Avatar.scale"
                  :borderRadius="Popup.Avatar.borderRadius" ref="vueavatar"
                  @vue-avatar-editor:image-ready="onImageReady" id="PopupAvatar">
      </vue-avatar>
    </div>

    <div class="btn btn-primary" style="cursor: pointer; margin-bottom: 8px" v-show="optsInfo.canAdd===true"
         @click="popupAdd()">
      + Добавить
    </div>

    <div>
      <div class="datatableFilters" v-for="(val, i) in Filters.rows"
           :style="'margin-top: '+optsInfo.filterRowMargin+'px'">
        <div class="input-group" v-for="col in Table.columns" v-show="col.hasFilter" v-if="col.filterRow === i">

          <div class="input-group-prepend">
            <span class="input-group-text" :id="'basic-addon'+col.label">{{ col.label }}</span>
          </div>

          <!-- Если это текстовое поле -->
          <input v-if="col.type==='text' || col.type==='fulltext' || col.type==='fixed'" type="text" class="form-control"
                 v-model="col.filter" @keyup="updateTable()" :placeholder="col.label" aria-label="Username"
                 @focusout="PushToURLFilters"
                 :aria-describedby="'basic-addon'+col.label">

          <input v-if="col.type==='number'" type="text" class="form-control" v-model="col.filterRange.from"
                 @keyup="updateTable()"
                 @focusout="PushToURLFilters"
                 :placeholder="'от'" aria-label="Username" :aria-describedby="'basic-addon'+col.label"/>
          <input v-if="col.type==='number'" type="text" class="form-control" v-model="col.filterRange.to"
                 @keyup="updateTable()"
                 @focusout="PushToURLFilters"
                 :placeholder="'до '" aria-label="Username" :aria-describedby="'basic-addon'+col.label"/>


        </div>
      </div>
    </div>
    <div class="datatable-loader">
      <datatable name="mainTable" :columns="Table.columns" :data="getData" :per-page="Pager.PerPage">
        <template slot-scope="{ row, columns }" v-if="hasSlot('row')">
          <slot name="row" v-bind:row="row" v-bind:columns="columns">
            <tr class="datatable_FilterHeader" v-if="false">
              <td v-for="col in Table.columns"><input v-model="col.filter"></td>
            </tr>
            <tr>
              <td v-for="col in columns">{{ row[col.field] }}</td>
            </tr>
          </slot>
        </template>
      </datatable>
      <datatable-pager table="mainTable" v-model="Pager.Page" type="abbreviated"></datatable-pager>
      <div class="datatable-loader-overlay" v-if="isLoading">
        <!--<div class="lds-ripple"><div></div><div></div></div>-->
        <!--<div class="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>-->
        <div style="margin: 0 auto"><div class="lds-dual-ring"></div></div>
      </div>
    </div>

    <!-- ПОПАП С РЕДАКТИРОВАНИЕМ ИНФОРМАЦИИ ОБ ЭЛЕМЕНТЕ -->
    <div id="popupWindow" v-show="Popup.isPopupShowed">
      <transition name="datatable-modal">
        <div class="datatable-modal-mask" v-show="Popup.isPopupShowed" @click="Popup.isPopupShowed=false"></div>
      </transition>
      <div class="datatable-modal-wrapper" v-show="Popup.isPopupShowed">
        <slot name="popup" v-bind:popup="Popup" v-bind:id="Popup.editID">
          <div class="datatable-modal-container">

            <div class="datatable-modal-header">
              {{ Popup.buttonSaveName.toUpperCase() }}
            </div>

            <div class="datatable-modal-body">
              <form>
                <div v-for="col in Table.schema" v-if="col.isShowOnPopup || col.isEdit">
                  <div v-if="col.linkedto===null || col.isLoadKeys===false">

                    <!-- Строки -->
                    <div class="input-group mb-3" v-if="col.popupType==='string'">
                      <div class="input-group-prepend">
                                                <span class="input-group-text"
                                                      style="min-width: 200px; max-width: 200px; word-wrap: break-word; overflow-wrap: break-word;"
                                                      :id="'basic-addon'+col.label">{{ col.editName }}</span>
                      </div>
                      <input v-model="Popup.Fields[col.field]" type="text"
                             class="form-control"
                             :placeholder="col.editDesc" aria-label="Имя пользователя"
                             :aria-describedby="'basic-addon'+col.label"
                             :readonly="!col.isEdit && Popup.editField!==''">
                    </div>

                    <!-- textarea -->
                    <div class="form-group" v-if="col.popupType==='text'">
                      <label for="exampleFormControlTextarea1">{{ col.editDesc }}</label>
                      <textarea class="form-control"
                                id="exampleFormControlTextarea1"
                                :rows="col.popupTextRows"
                                v-model="Popup.Fields[col.field]"
                                :readonly="!col.isEdit && Popup.editField!==''"
                      ></textarea>
                    </div>

                    <!-- button -->
                    <div class="input-group mb-3" v-if="col.popupType==='button'">
                      <div class="input-group-prepend">
                                                <span class="input-group-text"
                                                      style="min-width: 200px; max-width: 200px; word-wrap: break-word; overflow-wrap: break-word;"
                                                      :id="'basic-addon'+col.label">{{ col.editName }}</span>
                      </div>
                      <button type="button" style="margin-left: auto" class="form-control btn btn-light"
                              @click="col.buttonFunction(Popup.Fields, REST)">{{ col.label }}
                      </button>
                    </div>


                    <!-- Картинки -->
                    <div class="input-group mb-3" v-if="col.popupType==='image'">

                      <div class="input-group-prepend">
                                                <span class="input-group-text"
                                                      style="min-width: 200px; max-width: 200px; word-wrap: break-word; overflow-wrap: break-word;"
                                                      :id="'basic-addon'+col.label">{{ col.editName }}</span>
                      </div>

                      <label v-show="Popup.Avatar.isEnabled===false" :for="'basic-addon-file'+col.label"
                             class="datatable-custom-file-upload"
                             :aria-describedby="'basic-addon'+col.label"
                      >
                        <img class="data-table-popup-image" :src="Popup.Fields[col.field]"/>
                        <div style="margin: auto"
                             v-if="Popup.Fields[col.field]===null || Popup.Fields[col.field]===undefined || Popup.Fields[col.field]===''">
                          📁
                        </div>
                      </label>

                      <!-- Кнопки -->
                      <div v-show="Popup.Avatar.isEnabled===false" class="" style="margin-top: 5px; margin-left: auto;">
                        <div class="btn btn-primary" style="display: block"
                             @click="showAvatarPopup(col.field, 'basic-addon-file-avatar-'+col.label, false, true)">
                          Обрезать
                        </div>
                        <div class="btn btn-primary" style="display: block; margin-top: 5px"
                             @click="showAvatarOriginal(col.field)">Оригинал
                        </div>
                      </div>

                      <div class="datatable-popup-avatar-space" v-show="Popup.Avatar.isEnabled"
                           :datatable-id="'basic-addon-file-avatar-'+col.label">
                        <div class="datatable-popup-avatar-space-infopanel">
                          <div>Размер</div>
                          <input type="range" min=1 max=3 step=0.02 v-model="Popup.Avatar.scale"/>
                          <div v-show="Popup.Avatar.isEnabled" class="btn btn-primary"
                               @click="showAvatarPopup(col.field, 'basic-addon-file-avatar-'+col.label, true, false)">
                            Сохранить
                          </div>
                          <div v-show="Popup.Avatar.isEnabled" class="btn btn-secondary"
                               @click="showAvatarPopup(col.field, 'basic-addon-file-avatar-'+col.label, false, false)">
                            Отменить
                          </div>
                        </div>
                      </div>


                      <input :id="'basic-addon-file'+col.label" type="file" vuedatatable-file-field
                             style="display: none;" @change="fileSelected($event,col.field)"/>
                    </div>

                  </div>

                  <!-- Селекторы -->
                  <div v-else class="input-group mb-3">
                    <div class="input-group-prepend">
                                            <span class="input-group-text"
                                                  style="min-width: 200px; max-width: 200px; word-wrap: break-word; overflow-wrap: break-word;"
                                                  :id="'basic-addon'+col.label">{{ col.editName }}</span>
                    </div>
                    <select v-model="Popup.Fields[col.field]" class="form-control">
                      <option :value="null" :disabled="!col.isEdit && Popup.editField!==''">

                      </option>
                      <option v-for="item in col.selectResults"
                              :value="item[col.linkedto.field]"
                              :disabled="!col.isEdit && Popup.editField!==''">
                        {{ col.selectRepresentAs(item) }}
                      </option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            <div class="datatable-modal-footer">
              <button v-show="optsInfo.canRemove" class="btn btn-dark datatable-popup-remove"
                      @click="removePopup()">
                Удалить
              </button>
              <button class="btn btn-light" style="text-align: center"
                      @click="Popup.isPopupShowed=false">
                Отмена
              </button>
              <button class="btn btn-success datatable-popup-save" @click="savePopup()">
                {{ Popup.buttonSaveName }}
              </button>
            </div>
          </div>
        </slot>
      </div>


    </div>
  </div>


</template>

<script>

// Импортим таблицу
import Vue from 'vue'
import {TColumnsDefinition, VuejsDatatableFactory} from 'vuejs-datatable';

import "regenerator-runtime/runtime";

// Импортим REST
import FLAMEREST from "flamerest";

// Редачер аватаров
import {VueAvatar} from 'vue-avatar-editor-improved';

// That, который устанавливается после инициализации Vue шаблона
let SuperTHAT = null;

// Подгружаем компонент таблиц
Vue.use(VuejsDatatableFactory);

// Настраиваем дизайн таблицы
let thatTable = VuejsDatatableFactory.useDefaultType(false)
    .registerTableType('datatable', tableType => tableType
        .mergeSettings({
          table: {
            class: 'table table-hover table-striped',
            row: {
              class: 'datatable-edit-link'
            },

            sorting: {
              sortAsc: '<svg width="13px" style="color: gray" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="sort-amount-up-alt" class="svg-inline--fa fa-sort-amount-up-alt fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M240 96h64a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16h-64a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16zm0 128h128a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16H240a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16zm256 192H240a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h256a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm-256-64h192a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16H240a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16zM16 160h48v304a16 16 0 0 0 16 16h32a16 16 0 0 0 16-16V160h48c14.21 0 21.39-17.24 11.31-27.31l-80-96a16 16 0 0 0-22.62 0l-80 96C-5.35 142.74 1.78 160 16 160z"></path></svg>',
              sortDesc: '<svg width="13px" style="color: gray" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="sort-amount-down" class="svg-inline--fa fa-sort-amount-down fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M304 416h-64a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm-128-64h-48V48a16 16 0 0 0-16-16H80a16 16 0 0 0-16 16v304H16c-14.19 0-21.37 17.24-11.29 27.31l80 96a16 16 0 0 0 22.62 0l80-96C197.35 369.26 190.22 352 176 352zm256-192H240a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h192a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm-64 128H240a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zM496 32H240a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h256a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"></path></svg>',
              sortNone: '<svg width="8px" style="color: gray" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="sort" class="svg-inline--fa fa-sort fa-w-10" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41zm255-105L177 64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4 0 32.1-25.9 17-41z"></path></svg>', //'<i class="fas fa-sort" title="Sort"></i>',
            },

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
          canEdit: true,
          where: {},
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

      isFirstLoad: true,

      isLoading: true,

      /**
       * Инфа по странице
       */
      Pager: {
        Page: 1,
        Total: 0,
        PerPage: 20,
        Count: 0
      },

      Filters: {
        rows: [],
        columns: [],
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

        /**
         * Параметры изменения картинки
         */
        Avatar: {
          rotation: 0,
          scale: 1,
          borderRadius: 200,
          width: 320,
          height: 320,
          isEnabled: false
        },

      },

      microPauseFilterLastDT: Date.now(),

      /**
       * Способ получения данных
       * @param sortBy
       * @param sortDir
       * @param perPage
       * @param page
       * @return {Promise<{totalRowCount: *, rows: *}>}
       */
      async getData({sortBy, sortDir, perPage, page}) {

        // Если ещё не было получено колонок (схемы КРУД), то не делаем первый запрос до получения схемы
        if (SuperTHAT.Table.columns.length === 0) return {
          rows: [],
          totalRowCount: 0,
        };

        // Формируем запрос
        let request = {
          tablename: SuperTHAT.Table.name,
          where: null,
          expand: null,
          fields: [],
          sort: null,
          page: page,
          perPage: perPage
        };

        // Если это первая загрузка - то если есть предзагруженная сортировка - выбираем её
        if (SuperTHAT.isFirstLoad) {
          if (SuperTHAT.$route.query.hasOwnProperty('sortBy')) sortBy = SuperTHAT.$route.query.sortBy;
          if (SuperTHAT.$route.query.hasOwnProperty('sortDir')) sortBy = SuperTHAT.$route.query.sortDir;
          SuperTHAT.isFirstLoad = false;
        } else {
          // Все последующие выборки: сохраняем текущую сортировку в URL
          for (let ThisVueInstance of SuperTHAT.$children) {
            if (typeof ThisVueInstance.processRows === 'function') {
              if (ThisVueInstance.sortBy !== null) {
                SuperTHAT.$router.replace({query: Object.assign(SuperTHAT.$route.query, {sortBy: ThisVueInstance.sortBy.field})}).catch(res => {
                });
              }
              break;
            }
          }
        }

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
          if (column.type === 'fulltext' && column.filter !== '') {
            TotalWhere[column.field] = ['FULLTEXT', column.field, column.filter];
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

        // Копируем Preload WHERE запрос (предустановленная фильтрация по-умолчанию, независимо ни от чего)
        TotalWhere = Object.assign({}, TotalWhere, SuperTHAT.opts.where === undefined ? {} : SuperTHAT.opts.where);

        // Окончательно устанавливаем WHERE
        if (Object.keys(TotalWhere).length > 0)
          request.where = TotalWhere;

        // Добавляем поля [из чистой схемы, чтобы все поля были добавлены]
        for (let column of SuperTHAT.Table.schema) {
          if (column.isLoadToTable)
            request.fields.push(column.field);
        }

        // Применяем к запросу коллбек, если он прописан
        if (typeof SuperTHAT.beforeGetRows === 'function')
          request = SuperTHAT.beforeGetRows(request);

        // Устанавливаем анимацию лоадера
        SuperTHAT.isLoading = true;


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

        // Загрузка завершена
        SuperTHAT.isLoading = false;

        return {
          rows: rows,
          totalRowCount: SuperTHAT.Pager.Total,
        }

      },
    }
  },
  methods: {

    /**
     * Показать попап с добавлением данных
     */
    popupAdd: function () {

      // Очищаем попап от старых значений
      Vue.set(this.Popup, 'Fields', {});
      // и снимаем выделенные файлы
      document.querySelectorAll('[vuedatatable-file-field]').forEach(node => node.value = "");

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
    popupEdit: function (fieldName, fieldID, fieldType, isLoaded = false) {

      let that = this;

      if (fieldType === 'integer') fieldID = parseInt(fieldID);

      // Указываем изменяемые поля
      Vue.set(this.Popup, 'editID', fieldID);
      Vue.set(this.Popup, 'editField', fieldName);
      Vue.set(this.Popup, 'buttonSaveName', "Сохранить");

      // Находим редактируемую запись
      let item = this.Table.rows.find(row => {
        let testID = row[fieldName];
        return testID.toString() === fieldID.toString()
      });
      if (item === undefined) {
        console.error('Не найдена обновляемая запись: ' + fieldName + " = " + fieldID);
        return;
      }

      // Если попап надо прогрузить из базы (есть поля)
      let loadFields = [];
      for (let column of SuperTHAT.Table.schema) {
        if (column.isLoadToTable === false && column.isLoadToPopup === true) loadFields.push(column.field);
      }

      // Есть непрогруженные поля - делаем REST-запрос
      // После запроса он снова вызовет
      if (loadFields.length > 0 && isLoaded === false) {
        let where = {};
        where[fieldName] = fieldID;
        this.REST.get(that.Table.name, where, null, loadFields).then(res => {
          that.popupEdit(fieldName, fieldID, fieldType, true);
          for (let field in res.data[0])
            Vue.set(item, field, res.data[0][field]);
        });
        // ждём прогрузки а это окно выведется по её окончании (будет ещё один запрос popupEdit)
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
      let that = this;

      // Добавление
      if (this.Popup.editField === "") {
        this.REST.create(this.Table.name, this.Popup.Fields).then(res => {
          that.Table.rows.unshift(res.data);
        })
      }
      // Изменение
      else {

        // Фильтруем для обновления только изменённые позиции и те, которые предназначены для редактирования
        let fields = {};
        for (let name in this.Popup.Fields) {
          let findedField = this.Table.schema.find(r => r.field === name);
          if (findedField === null)
            debugger;
          if (findedField.isEdit !== true) continue;
          fields[name] = this.Popup.Fields[name];
        }

        this.REST.edit(this.Table.name, this.Popup.editID, fields);

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

    },

    /**
     * Файл выбран
     */
    fileSelected: function (event, Field) {

      let that = this;

      let tgt = event.target || window.event.srcElement,
          files = tgt.files;

      // FileReader support
      if (FileReader && files && files.length) {

        var fr = new FileReader();
        fr.onload = function () {
          Vue.set(that.Popup.Fields, Field, fr.result)
        };
        fr.readAsDataURL(files[0]);

        // Устанавливаем размеры аватара
        this.Popup.Avatar.scale = 1;
        this.Popup.Avatar.rotation = 0;
        this.Popup.Avatar.borderRadius = 200;

        // Добавляем выбранный файл в попап изменения фотки
        let element = document.querySelector('#PopupAvatar>input[type=file]');
        element.files = files;

        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", false, true);
        element.dispatchEvent(evt);

      }

      // Not supported
      else {
        // fallback -- perhaps submit the input to an iframe and temporarily store
        // them on the server until the user's session ends.
      }

    },

    saveClicked() {
      var img = this.$refs.vueavatar.getImageScaled()
      this.$refs.image.src = img.toDataURL()
    },
    onImageReady() {
    },

    showAvatarPopup(Field, AriaID, isSave = false, isOpenPopup = false) {

      if (!isSave) {
        let tLabel = document.querySelector('div[datatable-id="' + AriaID + '"]');
        tLabel.appendChild(document.querySelector('#PopupAvatarPopup'));
      } else {
        let img = this.$refs.vueavatar.getImageScaled().toDataURL();
        Vue.set(this.Popup.Fields, Field, img);
      }

      if (isOpenPopup) {
        Vue.set(this.Popup.Avatar, 'isEnabled', true);
      } else
        Vue.set(this.Popup.Avatar, 'isEnabled', false);

    },


    showAvatarOriginal(fieldName) {

      let randName = "Photo#" + (Math.random() * 100);

      let win = window.open("", randName);

      win.document.title = randName;
      win.document.body.innerHTML = "<img src=\"data:" + this.Popup.Fields[fieldName] + "\"/>";

    },


    // Обновить таблицу
    updateTable: function () {

      // Микропауза после ввода, чтобы не выполнять запросы каждую секунду
      if (Date.now() - this.microPauseFilterLastDT > 300) {

        for (let ThisVueInstance of this.$children) {
          if (typeof ThisVueInstance.processRows === 'function') {
            ThisVueInstance.processRows();
            break;
          }
        }
        this.microPauseFilterLastDT = Date.now();
      }
    },

    // Заменить параметры в URL после ввода в фильтры
    PushToURLFilters() {

      // Собираем все активные фильтры в ссылку
      let filters = {};
      for (let i = 0; i < this.Table.columns.length; i++) {

        let column = this.Table.columns[i];

        // Без фильтра
        if (!column.hasFilter) continue;

        // С пустым текстовым фильтром
        if (column.type === 'text') {
          if (column.filter === '') continue;
          filters[this.Table.columns[i].field] = this.Table.columns[i].filter;
        }
        if (column.type === 'fulltext') {
          if (column.filter === '') continue;
          filters[this.Table.columns[i].field] = this.Table.columns[i].filter;
        }
        if (column.type === 'fixed') {
          if (column.filter === '') continue;
          filters[this.Table.columns[i].field] = this.Table.columns[i].filter;
        }

        // С пустым фильтром от до
        if (column.type === 'number') {
          if (column.filterRange.from !== '') {
            filters["from." + this.Table.columns[i].field] = this.Table.columns[i].filterRange.from
          }
          if (column.filterRange.to !== '') {
            filters["to." + this.Table.columns[i].field] = this.Table.columns[i].filterRange.to
          }
        }

      }

      this.$router.replace({query: filters}).catch(res => {
      });

    },

    hasSlot (name = 'default') {
      return !!this.$slots[ name ] || !!this.$scopedSlots[ name ];
    }

  },

  components: {
    VueAvatar,
  },

  mounted() {

    let that = this;

    SuperTHAT = that;

    // Устанавливаем REST
    if (window.REST === undefined)
      window.REST = new FLAMEREST(this.host);

    this.REST = window.REST;

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
              Object.assign(col, {

                label: col.comment,
                field: col.name,


                filter: '',
                filterRange: {from: '', to: ''},
                hasFilter: false,

                // Позиции фильтров
                filterRow: 0,
                filterColumn: 0,

                // Ленивая загрузка полей базы или вообще их не загрузка для экономии траффика
                isLoadToTable: true,
                isLoadToPopup: true,

                // Тип фильтрации для поля, выясняется автоматически на основе типа записи, но может быть переопределён
                // text - поиск через частичное совпадение (LIKE)
                // number - числовой поиск в диапазоне от - до
                // fixed - точное совпадение
                type: col.type === "integer" ? 'number' : 'text',

                // Тип элемента в попапе
                // string - обычная строка или селектор строк
                // text - text area
                // button - кнопка
                popupType: 'string',

                // Функция кнопки
                buttonFunction: function (row) {
                },

                // Количество строк текстового поля
                popupTextRows: 6,

                linkedto: col.linkedto,
                selectResults: [],
                /**
                 * Загружать ли данные от foreign keys, т.к. данных может быть много, по-умолчанию выключено
                 */
                isLoadKeys: false,

                // Какие параметры при загрузке ключа
                loadKeysParams: {
                  where: null,
                  expand: null,
                  fields: null,
                  sortfields: null,
                  page: 1,
                  perPage: 9999
                },

                selectRepresentAs: function (item) {
                  return item
                },
                editName: col.name,
                editDesc: col.comment,

                isShow: true,
                isEdit: true,
                isShowOnPopup: true,

              });
              return col;
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
                // Уточняем название в попапе, если существует кастомный label
                if (findedObj.editName === findedObj.name && findedObj.label !== findedObj.comment) findedObj.editName = findedObj.label;
                return this;
              }
            });
            Object.defineProperty(cols, 'delete', {
              configurable: true, enumerable: false, value: function (FieldName, Params) {

                let findedObjIndex = this.findIndex(res => res.field === FieldName);
                if (findedObjIndex === -1) {
                  console.error("VUE Datatable Delete Column: Object not found - " + FieldName);
                  return this;
                }


                // Помечаем непоказываемыми
                //this[findedObjIndex].isShow = false;
                //this[findedObjIndex].isEdit = false;
                //this[findedObjIndex].isShowOnPopup = false;
                // Скрепляем с параметрами
                Object.assign(this[findedObjIndex], Params);

                // Уточняем название в попапе, если существует кастомный label
                //debugger;
                if (this[findedObjIndex].editName === this[findedObjIndex].name && this[findedObjIndex].label !== this[findedObjIndex].comment) this[findedObjIndex].editName = this[findedObjIndex].label;

                this.splice(findedObjIndex, 1);

                return this;
              }
            });

            Object.defineProperty(cols, 'deleteAll', {
              configurable: true, enumerable: false, value: function (FieldName, Params) {

                this.splice(0, 1000);

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

            // Устанавливаем число строк и столбцов в фильтрах
            that.Filters.rows = Math.max.apply(null, cols.map(r => r.filterRow));
            that.Filters.columns = Math.max.apply(null, cols.map(r => r.filterColumn));
            let tempFilterRows = [];
            for (let i = 0; i <= that.Filters.rows; i++) tempFilterRows.push(cols.filter(r => r.filterRow === i));
            that.Filters.rows = tempFilterRows;
            let tempFilterColumns = [];
            for (let i = 0; i <= that.Filters.columns; i++) tempFilterColumns.push(cols.filter(r => r.filterColumn === i));
            that.Filters.columns = tempFilterColumns;

            // Выбираем первую колонку как primary key и устанавливаем её вид как ссылку на редактирование,
            // если у неё нет замещатора и редактирование поддерживается
            for (let i = 0; i < cols.length; i++) {
              if (cols[i].representedAs === undefined && that.optsInfo.canEdit === true) {
                if (i === 0)
                  cols[i].representedAs = function (row) {
                    return '<a class="btn btn-light" style="color: #0aaee7;" onclick="document.querySelectorAll(\'[flamecrud]\')[0].__vue__.popupEdit(\'' + that.Table.schema[0].name + '\',\'' + row[that.Table.schema[0].name] + '\',\'' + that.Table.schema[0].type + '\')">' + row[cols[i].field] + '</a>'
                  }
                else
                  cols[i].representedAs = function (row) {
                    return '<a class="datatable-edit-link" onclick="document.querySelectorAll(\'[flamecrud]\')[0].__vue__.popupEdit(\'' + that.Table.schema[0].name + '\',\'' + row[that.Table.schema[0].name] + '\',\'' + that.Table.schema[0].type + '\')">' + row[cols[i].field] + '</a>'
                  }
                cols[i].interpolate = true;
              }
            }

            if (!Array.isArray(cols) || cols.length === 0)
              console.error("Не найдено колонок в таблице или они имеют ошибочный формат (нужен массив)")


            // Устанавливаем фильтры из URL
            for (let queryName in that.$route.query) {
              let colName = "";
              if (queryName.startsWith("to.")) {
                colName = queryName.substr(3);
                let finded = cols.find(res => colName === res.field);
                if (finded !== undefined) finded.filterRange.to = that.$route.query[queryName];
                continue;
              }
              if (queryName.startsWith("from.")) {
                colName = queryName.substr(5);
                let finded = cols.find(res => colName === res.field);
                if (finded !== undefined) finded.filterRange.from = that.$route.query[queryName];
                continue;
              }
              // во всех остальных случаях просто фиксируем значение
              let finded = cols.find(res => queryName === res.field);
              if (finded !== undefined) finded.filter = that.$route.query[queryName];
            }


            // Сохраняем преобразованные колонки
            Vue.set(that.Table, 'columns', cols);

            // Прогружаем сами записи
            //return that.REST.get(that.Table.name);

            // готово, записи прогрузятся автоматически
            return;

          }

        })
        .then(res => {

          // Загружаем данные зависимых таблиц
          let allPromises = [];
          for (let column of that.Table.columns) {
            if (column.linkedto !== null && column.isLoadKeys === true) {
              allPromises.push(new Promise((resolve, reject) => {
                // TODO: определить почему не прикрепляются параметры по-умолчанию, undefined вместо null
                that.REST.get(column.linkedto.table, column.loadKeysParams.where, column.loadKeysParams.expand, column.loadKeysParams.fields, column.loadKeysParams.sortfields, 1, 9999).then((res) => {
                  Vue.set(column, 'selectResults', res.data);
                  resolve();
                })
              }))
            }
          }

        });

  },

  computed: {
    optsInfo: function () {
      return Object.assign({
        canAdd: true,
        canRemove: true,
        canEdit: true,
        where: {},
        filterRowMargin: 0,
      }, this.opts);
    },
  }

}
</script>

<style lang="scss">

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

#popupWindow {
  align-items: flex-start;
  bottom: 0;
  display: flex;
  justify-content: center;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 10;
  overflow: auto;
  transition: opacity .3s ease;
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100%;
  width: 80%;
  padding: 30px;
  z-index: 9998;
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

.datatable-custom-file-upload {
  border: 1px solid #ccc;
  display: block;
  padding: 0;
  cursor: pointer;
  margin: auto;
  min-width: 50%;
}

.data-table-popup-image {
  max-width: 150px;
  max-height: 150px;
  margin: 0 auto;
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

#PopupAvatarPopup {
}

.datatable-popup-avatar-space {
  display: flex;
  flex-direction: row;
  width: 50%;
}

.datatable-popup-avatar-space-infopanel {
  margin: 20px 30px;

  .btn-primary {
    margin-top: 170px;
  }

  .btn-secondary {
    margin-top: 20px;
  }
}

/* LOADER ANIMATION */
.lds-ripple {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}

.lds-ripple div {
  position: absolute;
  border: 4px solid black;
  opacity: 1;
  border-radius: 50%;
  animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}

.lds-ripple div:nth-child(2) {
  animation-delay: -0.5s;
}

@keyframes lds-ripple {
  0% {
    top: 36px;
    left: 36px;
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    top: 0px;
    left: 0px;
    width: 72px;
    height: 72px;
    opacity: 0;
  }
}

.lds-grid {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.lds-grid div {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: black;
  animation: lds-grid 1.2s linear infinite;
}
.lds-grid div:nth-child(1) {
  top: 8px;
  left: 8px;
  animation-delay: 0s;
}
.lds-grid div:nth-child(2) {
  top: 8px;
  left: 32px;
  animation-delay: -0.4s;
}
.lds-grid div:nth-child(3) {
  top: 8px;
  left: 56px;
  animation-delay: -0.8s;
}
.lds-grid div:nth-child(4) {
  top: 32px;
  left: 8px;
  animation-delay: -0.4s;
}
.lds-grid div:nth-child(5) {
  top: 32px;
  left: 32px;
  animation-delay: -0.8s;
}
.lds-grid div:nth-child(6) {
  top: 32px;
  left: 56px;
  animation-delay: -1.2s;
}
.lds-grid div:nth-child(7) {
  top: 56px;
  left: 8px;
  animation-delay: -0.8s;
}
.lds-grid div:nth-child(8) {
  top: 56px;
  left: 32px;
  animation-delay: -1.2s;
}
.lds-grid div:nth-child(9) {
  top: 56px;
  left: 56px;
  animation-delay: -1.6s;
}
@keyframes lds-grid {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.lds-dual-ring {
  display: inline-block;
  width: 80px;
  height: 80px;
}
.lds-dual-ring:after {
  content: " ";
  display: block;
  width: 64px;
  height: 64px;
  margin: 8px;
  border-radius: 50%;
  border: 6px solid black;
  border-color: gray transparent gray transparent;
  animation: lds-dual-ring 1.2s linear infinite;
}
@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}


.datatable-loader {

  position: relative;

}

.datatable-loader-overlay {
  opacity: 0.9;
  background-color: white;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 99999;
  display: flex;
}

.sort_up {
  background: im;
}

</style>
