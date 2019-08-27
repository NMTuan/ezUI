var random = require('../random/random');
var tree = {
    defaults: {
        ul: 'ez-tree-ul',
        li: 'ez-tree-li',
        item: 'ez-tree-item',
        name: '',   //input的name, 不指定则随机
        type: '',   //前置input框, radio, checkbox, 留空则没前置
        data: [],   //数据
        selected: {},   //选中数据 {value: {key, value}, }
        beforeChoose: function (input, el) {    //选中事件前执行, 返回false则不改变input值
        },
        choose: function (input, el) {  //选中后执行
            $.log('choose');
        },
        selectChange: function (input, el) {   //selected数据改变时执行
            $.log('change');
        }
    },
    Tree: function (els, params) {
        var s = this;
        s.els = els;
        s.params = $.extend(true, {}, tree.defaults, {name: 'tree' + random(100)}, params);
        $.each(els, function () {
            var el = $(this);
            tree.init.call(s, el);
        });
        s.unSelected = function (value) {
            tree.unSelected.call(s, value);
        };
        this.params.selectChange.call(this);
    },
    //初始化
    init: function (el) {
        var html = tree.render(this.params);
        el.html(html);
        tree.events.apply(this, arguments);
    },
    //事件
    events: function (el) {
        var s = this;
        var params = s.params;
        var ipt = el.find('input');
        ipt.on('click', function () {
            //插入事件, 若返回false, 则返回
            var before = params.beforeChoose($(this), el);
            if (before === false) {
                return false;
            }
            var status = $(this).prop('checked');
            var value = $(this).data('value');
            if(status){ //选中了
                tree.selected.call(s, value, $(this).data('key'));
            } else {    //取消了
                tree.unSelected.call(s, value);
            }
            //插入事件
            params.choose.call(s, $(this), el);
        });
    },

    //渲染
    render: function (params) {
        var dom = tree.ul(params);
        var _render = function (data, html) {
            $.each(data, function (i, item) {
                var li = tree.li(params, item);
                html.append(li);
                if (item.child && item.child.length > 0) {
                    var ul = tree.ul(params);
                    li.append(ul);
                    _render(item.child, ul);
                }
            });
        };
        _render(params.data, dom);
        return dom;
    },
    ul: function (params) {
        return $('<ul>').addClass(params.ul);
    },
    li: function (params, data) {
        var li = $('<li>').addClass(params.li);
        var item = $('<div>').addClass(params.item);
        var html = data.key;
        var checked = params.type && params.selected[data.value] ? 'checked="checked"' : '';
        if (params.type === 'radio') {
            html = '<label><input type="radio" ' + checked + ' name="' + params.name + '" data-value="' + data.value + '" data-key="'+ data.key +'" /> ' + data.key + '</label>'
        }
        if (params.type === 'checkbox') {
            html = '<label><input type="checkbox" ' + checked + ' name="' + params.name + '" data-value="' + data.value + '" data-key="'+ data.key +'" /> ' + data.key + '</label>'
        }
        item.html(html);
        li.append(item);
        return li;
    },

    //方法
    selected: function(value, key){
        var s = this;
        var params = s.params;
        params.selected[value] = {value: value, key: key};
        params.selectChange.call(s);
    },
    unSelected: function (value) {
        var s = this;
        var els = s.els;
        var params = s.params;
        if(params.selected[value]){
            delete params.selected[value];
            $.each(els, function () {
                var el = $(this);
                tree.init.call(s, el);
            });
            params.selectChange.call(s);
        }
    },
};

$.fn.extend({
    ez_tree: function (params) {
        new tree.Tree(this, params);
        return this;
    },
});

module.exports = tree.Tree;
