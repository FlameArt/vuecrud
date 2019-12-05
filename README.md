# Vue CRUD for Yii2 REST

# Установка

    npm install FlameArt/vuecrud --save

Импортируем компонент:

```
import Vue from 'vue';
import RESTTable from 'flamecrud';
Vue.use(RESTTable);
```

Используем в шаблоне, указывая endpoint для REST сервиса в `host`, а также таблицу по-умолчанию в `selectedtable`

    <vueresttable :host="'http://rest'" :selectedtable = "'obj2'"></vueresttable>
    
`FLAMEREST` так же регистрируется и для `window`

Текущая версия так же требует `Bootstrap`, т.к. в ней сейчас нет дизайна (вообще)

    npm i bootstrap

И в `src/main.js` объявить:

    import 'bootstrap/dist/css/bootstrap.min.css';