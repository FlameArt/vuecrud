# Vue CRUD for Yii2 REST

Новые фичи:
* Фильтры добавляют параметры в URL после редактирования, и ссылку с фильтрами можно использовать, чтобы получить готовую отфильтрованную страницу!

# Установка

    npm i flamecrud --save

Импортируем компонент:

```
import Vue from 'vue';
import vuecrud from 'flamecrud';
Vue.use(vuecrud);
```

Текущая версия так же требует `Bootstrap`, т.к. в ней сейчас нет дизайна (вообще)

    npm i bootstrap

И в `src/main.js` объявить:

    import 'bootstrap/dist/css/bootstrap.min.css';

---
Используем в шаблоне с параметрами:

    <vuecrud host="http://rest" selectedtable = "objects"></vuecrud> 

* `host`: endpoint для REST сервиса *(обязателен)*
* `selectedtable` таблица по-умолчанию *(обязательно на текущий момент)*
* `columnsupdated` коллбек после получения колонок, до их вставки
* `rowsupdated` коллбек после получения записей, перед их вставкой
* `beforeGetRows` коллбек позволяет настроить get-запрос перед применением запроса
* `opts` - доп параметры
  * `canAdd` bool - CRUD может добавлять записи
  * `canEdit` bool - CRUD может редактировать записи
  * `canRemove` bool - CRUD может удалять записи
  * `where` obj - предустановленные условия для фильтрации (добавляются к фильтрам автоматически)
  * `filterRowMargin` int - отступ между строками фильтров (по-вертикали)
    
`FLAMEREST` так же регистрируется и для `window`
    
## Быстрая работа с колонками

Изменение/добавление набора параметров:

    // функция-реплейсер колонок
    columnsupdated: function (cols) {
          
        // Изменить колонку ID
        cols.set('id',{label: 'TRUST ID', editDesc: 'User ID'});
        
        // Удалить колонку name при выводе
        cols.delete('name');
          
        // Добавить новую колонку, которой нет в выдаче
        cols.new('newColumn',{label: 'TRUST ID', editDesc: 'User ID', representedAs: row=> row.name + ' ' + row.nickname, interpolate: true});
        
    }


## Формат колонок
    {
        label: 'ЗАГОЛОВОК', 
        field: 'Имя столбца',
        
        // Стандартное значение колонки при вставке нового элемента, если оно не было заполнено
        defaultValue: undefined,
        
        editName: 'Имя элемента при добавлении/редактировании',
        editDesc: 'Описание элемента при добавлении/редактировании',
        
        // Наличие выносного фильтра для колонки
        hasFilter: false, 
        
        // Тип фильтрации для поля, выясняется автоматически на основе типа записи, но может быть переопределён
        // text - поиск через частичное совпадение (LIKE %%)
        // fulltext - поиск через частичное совпадение (FULLTEXT in boolean mode *)
        // number - числовой поиск в диапазоне от - до
        // fixed - точное совпадение
        type: 'text'
        
        // Технические параметры, устанавливать по необходимости
        filter: 'Текстовый фильтр', 
        filterRange: {from: '', to: ''}, // Ренжовый фильтр для значений

        // включить фильтр для колонки
        hasFilter: false,
        
        // Минимальное число символов в строке фильтра, после которого будет произведён запрос
        filterMinSymbolsRequest: 0,

        
        // Позиция фильтра на странице (автоматическое распределение)
        filterRow: 0,
        filterColumn: 0,
        
        // Тип элемента в попапе
        // string - обычная строка или селектор строк
        // text - text area
        // file - file select
        // image - select image, crop & resize
        popupType: 'string',
        
        // Загружать поле из REST в таблицу (мгновенная загрузка)
        isLoadToTable: true,
        // Загружать поле из REST в попап (ленивая загрузка, если isLoadToTable=false)
        // если isLoadToTable=false и isLoadToPopup=false, поле вообще никогда загружено из базы не будет
        isLoadToPopup: true,
        
        // Связи с другими таблицами
        
        // Справочно: к какой таблице и полю текущее поле прикреплено
        linkedto: {table: 'objects', field: 'id'},
        
        // Справочно: загруженные значения для связанного поля
        selectResults = [],
        
        // Загружать ли связанные поля (foreign keys) в списки select, или оставить просто значение ключа (классический вариант)
        isLoadKeys: false,
        
        // Возможность управлять загрузкой связанных ключей
        loadKeysParams: {
             where: null,
             expand: null,
             fields: null,
             sortfields: null,
             page: 1,
             perPage: 9999
        },
        
        // Функция, которая приводит формат поля связанного списка в select к кастомному
        selectRepresentAs: column => 'Foreign key ' + column.id
        
        // Показывать поле в таблице
        isShow: true,
        
        // Показывать поле при добавлении\редактировании
        isShowOnPopup: true,
        
        // Поле разрешено редактировать
        // Если isEdit=false и isShowOnPopup=true, оно будет выключено, но показано
        isEdit: true,
        
        popupImage: {
            // прогружать ли кнопки
            buttons: false
        }
        
    }
    
#### Дополнительные параметры колонок, которые предустановлены из vue-datatable

    // Специфичный формат одной колонки
    representedAs: row=> row.name,
    
    // Преобразовать колонку в html: true
    interpolate: true
    
Остальные параметры в: https://gerkindev.github.io/vuejs-datatable/classes/column.html

## Шаблоны

Все примеры на Pug

### Свой Popup


Можно установить через слот `popup`

        template(v-slot:popup)
          div(style="width: 100%; min-height:100%; flex-direction:row; flex-grow: 2; background:#FFF; overflow-y:scroll;") Hello

### Кастомный шаблон строки таблицы

        template(v-slot:row="binds")
          tr
            td {{binds.row.name}}
            td {{binds.columns[0].name}}
            
### Строка кнопки добавить и сама кнопка

Слот для поля с кнопками над таблицей

        template(v-slot:Buttons)

Слот кнопки добавления отдельно

        template(v-slot:AddButton)


## Ленивая загрузка паджинации

Нужна, т.к. запрос на Count(*) занимает значительно большее время, нежели SELECT LIMIT, что для ёмких запросов критично

    opts: {
        lazyLoadPagination: true
    }
