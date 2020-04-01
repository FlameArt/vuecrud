# Vue CRUD for Yii2 REST

# Установка

    npm install FlameArt/vuecrud --save

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
    
`FLAMEREST` так же регистрируется и для `window`
    
## Быстрая работа с колонками

Изменение/добавление набора параметров:

    // функция-реплейсер колонок
    columnsupdated: function (cols) {
          
        // Изменить колонку ID
        cols.set('id',{label: 'TRUST ID', editDesc: 'User ID'});
        
        // Удалить колонку name при выводе
        cols.delete('name');
                    
    }


## Формат колонок
    {
        label: 'ЗАГОЛОВОК', 
        field: 'Имя столбца',
        
        editName: 'Имя элемента при добавлении/редактировании',
        editDesc: 'Описание элемента при добавлении/редактировании',
        
        // Наличие выносного фильтра для колонки
        hasFilter: false, 
        
        // Тип фильтрации для поля, выясняется автоматически на основе типа записи, но может быть переопределён
        // text - поиск через частичное совпадение (LIKE)
        // number - числовой поиск в диапазоне от - до
        // fixed - точное совпадение
        type: 'text'
        
        // Технические параметры, устанавливать по необходимости
        filter: 'Текстовый фильтр', 
        filterRange: {from: '', to: ''}, // Ренжовый фильтр для значений
        
        // Тип элемента в попапе
        // string - обычная строка или селектор строк
        // text - text area
        popupType: 'string',
        
        // Связи с другими таблицами
        
        // Справочно: к какой таблице и полю текущее поле прикреплено
        linkedto: {table: 'objects', field: 'id'},
        
        // Справочно: загруженные значения для связанного поля
        selectResults = [],
        
        // Загружать ли связанные поля (foreign keys) в списки select, или оставить просто значение ключа (классический вариант)
        isLoadKeys: false,
        
        // Функция, которая приводит формат поля связанного списка в select к кастомному
        selectRepresentAs: column => 'Foreign key ' + column.id
        
        // Показывать поле в таблице
        isShow: true,
        
        // Показывать поле при добавлении\редактировании
        isShowOnPopup: true,
        
        // Поле разрешено редактировать
        // Если isEdit=false и isShowOnPopup=true, оно будет выключено, но показано
        isEdit: true,
        
    }
    
    