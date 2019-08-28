var random = require('../random/random');
var tree = {
    defaults: {
        ul: 'ez-tree-ul',
        li: 'ez-tree-li',
        item: 'ez-tree-item',
        name: '',   //input的name, 不指定则随机
        type: '',   //前置input框, radio, checkbox, 留空则没前置
        data: [],   //数据
        selected: [], //选中数据
        beforeChoose: function (input, el) {    //选中事件前执行, 返回false则不改变input值
        },
        choose: function (input, el) {  //选中后执行
            // $.log('choose');
        },
        dataChange: function () {   //selected数据改变时执行
            // $.log('change');
        }
    },
    Tree: function (els, params) {
        var s = this;
        s.els = els;
        s.params = $.extend(true, {}, tree.defaults, {name: 'tree' + random(100)}, params);
        tree.concat.call(s);
        $.each(els, function () {
            var el = $(this);
            tree.init.call(s, el);
        });
        s.unSelected = function (id) {
            tree.unSelected.call(s, id);
        };
        s.getSelected = function () {
            return tree.getSelected.call(s);
        };
        s.params.dataChange.call(this);
    },
    //初始化
    init: function (el) {
        var html = tree.render.call(this);
        el.html(html);
        tree.events.call(this, el);
    },
    //拼合selected到data
    concat: function () {
        var data = this.params.data;
        var selected = this.params.selected;
        $.each(selected, function (i, item) {
            $.log(i, item);
            item.selected = true;
            $.each(data, function (index) {
                if (this.id == item.id) {
                    $.extend(data[index], item);
                    return false;
                }
            })
        });
    },
    //事件
    events: function (el) {
        var s = this;
        var params = s.params;
        el.on('click', 'input', function () {
            //插入事件, 若返回false, 则返回
            var before = params.beforeChoose($(this), el);
            if (before === false) {
                return false;
            }
            var status = $(this).prop('checked');
            var id = $(this).data('id');
            if (status) { //选中了
                tree.selected.call(s, id);
            } else {    //取消了
                tree.unSelected.call(s, id);
            }
            //插入事件
            params.choose.call(s, $(this), el);
        });
    },

    //渲染
    //ul的dom构建
    ul: function () {
        return $('<ul>').addClass(this.params.ul);
    },
    //li的dom构建 todo:需要优化
    li: function (data) {
        var params = this.params;
        var li = $('<li>').addClass(params.li).attr('id', params.name + '_' + data.id);
        var item = $('<div>').addClass(params.item);
        var html = data.title;
        var checked = data.selected ? 'checked="checked"' : '';
        if (params.type === 'radio') {
            html = '<label><input type="radio" ' + checked + ' name="' + params.name + '" data-id="' + data.id + '" data-pid="' + data.pid + '" data-title="' + data.title + '" /> ' + data.title + '</label>'
        }
        if (params.type === 'checkbox') {
            html = '<label><input type="checkbox" ' + checked + ' name="' + params.name + '" data-id="' + data.id + '" data-pid="' + data.pid + '" data-title="' + data.title + '" /> ' + data.title + '</label>'
        }
        item.html(html);
        li.append(item);
        return li;
    },
    //把pid==id的数据构建为dom结构, 包括子集.
    render: function (id) {
        var s = this;
        id = id || 0;
        var child = tree.getChildData.call(this, id);
        if (child.length === 0) {
            return;
        }
        var dom = tree.ul.call(this);
        var get = function (data, html) {
            $.each(data, function (i, item) {
                var li = tree.li.call(s, item);
                html.append(li);
                var child = tree.getChildData.call(s, item.id);
                if (child.length > 0) {
                    var ul = tree.ul.call(s);
                    li.append(ul);
                    get(child, ul);
                }
            })
        };
        get(child, dom);
        return dom;
    },
    //从所有数据中找pid==id的数据
    getChildData: function (id) {
        id = id || 0;
        var childData = [];
        $.each(this.params.data, function (i, item) {
            if (item.pid === id) {
                childData.push(item);
            }
        });
        return childData;
    },
    //从所有数据中找id==id的数据
    getData: function (id) {
        id = id || 0;
        var data = {};
        $.each(this.params.data, function (i, item) {
            if (item.id === id) {
                data = item;
                return false;
            }
        });
        return data;
    },

    //方法
    //选择
    selected: function (id) {
        var s = this;
        var params = s.params;
        var item = tree.getData.call(s, id);
        if (item.selected !== true) {
            item.selected = true;
            params.dataChange.call(s);
        }
    },
    //取消选择
    unSelected: function (id) {
        var s = this;
        var params = s.params;
        var item = tree.getData.call(s, id);
        if (item.selected === true) {
            item.selected = false;
            $('#' + params.name + '_' + id).html(tree.li.call(s, item));
            params.dataChange.call(s);
        }
    },
    //取所有选中数据
    getSelected: function () {
        var data = this.params.data;
        var selected = [];
        $.each(data, function (i, item) {
            if (item.selected) {
                selected.push(item);
            }
        });
        return selected;
    }
};

$.fn.extend({
    ez_tree: function (params) {
        new tree.Tree(this, params);
        return this;
    },
});

module.exports = tree.Tree;
