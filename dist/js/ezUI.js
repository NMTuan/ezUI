(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){
"use strict";

var _Menu = _interopRequireDefault(require("./menu/Menu"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import test from './test/test';
// global.test = test;
// test();
//菜单
global.ez = {};
ez.Menu = _Menu.default;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./menu/Menu":2}],2:[function(require,module,exports){
"use strict";

var menu = function menu(params) {
  var s = this;
  var defaults_params = {
    data: []
  };
  s.params = $.extend(true, {}, defaults_params, params);
  var data = s.params.data;
  var item_tpl = '<li><a href="{url}" data-ctrl="{ctrl}" data-action="{action}">{name}</a></li>';
  var menu_tpl = $('<ul>').addClass('ez sidebar-menu'); //渲染菜单项

  var render_item = function render_item() {
    var items = [];
    $.each(data, function (i, item) {
      var tpl = item_tpl;
      tpl = tpl.replace(/{url}/, item.url || '');
      tpl = tpl.replace(/{ctrl}/, item.ctrl || '');
      tpl = tpl.replace(/{action}/, item.action || '');
      tpl = tpl.replace(/{name}/, item.name || '');
      items.push(tpl);
    });
    return items.join('');
  }; //渲染菜单


  s.render_menu = function () {
    var item = render_item();
    return menu_tpl.append(item);
  }; //打开标签


  s.open = function () {};
};

module.exports = menu;
},{}]},{},[1]);
