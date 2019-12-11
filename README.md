# Vue CRUD for Yii2 REST

# Установка

    npm install FlameArt/vuecrud --save

Импортируем компонент:

```
import Vue from 'vue';
import RESTTable from 'flamecrud';
Vue.use(RESTTable);
```

Используем в шаблоне с параметрами:
 
* `host`: endpoint для REST сервиса *(обязателен)*
* `selectedtable` таблица по-умолчанию *(обязательно на текущий момент)*
* `columnsupdated` коллбек после получения колонок, до их вставки
* `rowsupdated` коллбек после получения записей, перед их вставкой
* `beforeGetRows` коллбек позволяет настроить get-запрос перед применением запроса

    <vueresttable :host="'http://rest'" :selectedtable = "'obj2'" :columnsupdated="column_callback" :rowsupdated="rows_callback"></vueresttable>
    
`FLAMEREST` так же регистрируется и для `window`

Текущая версия так же требует `Bootstrap`, т.к. в ней сейчас нет дизайна (вообще)

    npm i bootstrap

И в `src/main.js` объявить:

    import 'bootstrap/dist/css/bootstrap.min.css';
    
## Формат колонок
    {
        label: 'ЗАГОЛОВОК', 
        field: 'Имя столбца',
        
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
    }