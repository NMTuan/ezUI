var random = require('../random/random');
var tree = {
    defaults: {
        ul: 'ez-tree-ul',
        li: 'ez-tree-li',
        item: 'ez-tree-item',
        empty: 'ez-tree-empty',
        name: '',   //input的name, 不指定则随机
        type: '',   //前置input框, radio, checkbox, 留空则没前置
        data: [],   //数据
        dataUrl: '', //异步加载
        selected: [], //选中数据
        searchKeys: [], //本地搜索的keys
        searchValue: '', //本地搜索的value
        searchData: [],   //搜索的数据
        searchUrl: '',  //异步搜索
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
        s.unSelected = function (id) {
            tree.unSelected.call(s, id);
        };
        s.getSelected = function () {
            return tree.getSelected.call(s);
        };
        s.search = function () {
            return tree.search.apply(s, arguments);
        };

        tree.concatSelected.call(s);    //合并selectedData 到 data

        //异步
        if (s.params.dataUrl) {
            var loading = tree.tips.call(s, '努力加载中');
            els.html(loading);
            $.getJSON(s.params.dataUrl)
                .done(function (res) { //success
                    if (res.code !== '40000') {
                        var error = tree.tips.call(s, '数据加载失败, 请刷新后重试!');
                        els.html(error);
                        return;
                    }
                    tree.concat.call(s, s.params.data, res.result);
                    tree.concat.call(s, s.params.selected, res.result, {push_existence: false});

                    $.each(els, function () {
                        var el = $(this);
                        tree.init.call(s, el);
                    });
                    s.params.dataChange.call(s);
                })
                .fail(function () { //error
                    var error = tree.tips.call(s, '数据加载失败, 请刷新后重试!');
                    els.html(error);
                })
                .always(function () {   //complete
                    loading.remove();
                })
            ;
        } else {
            $.each(els, function () {
                var el = $(this);
                tree.init.call(s, el);
            });
            s.params.dataChange.call(s);
        }
    },
    //初始化
    init: function (el) {
        var s = this;
        var html = tree.render.call(this);
        if (html.html() === '') {
            html = tree.tips.call(s, '暂无内容');
        }
        el.html(html);
        tree.events.call(this, el);
    },
    //拼合selected到data
    concatSelected: function () {
        var selected = this.params.selected;
        $.each(selected, function (i, item) {
            item.selected = true;
        });
        tree.concat.call(this, this.params.data, selected);
    },
    //循环data往target里插入, 存在则更新, 否则插入.
    concat: function (target, data, options) {
        var defaults = {
            push_existence: true
        };
        options = $.extend(true, {}, defaults, options);
        var s = this;
        if (data.length === 0) {
            return;
        }
        $.each(data, function () {
            var newItem = this;
            var existence = false;  //本数据是否已经存在
            $.each(target, function () {
                var item = this;
                if (item.id == newItem.id) {    //存在更新
                    $.extend(item, newItem);
                    existence = true;
                    return false;
                }
            });
            if (options.push_existence && !existence) {   //不存在插入
                target.push(newItem);
            }
        });
    },
    delete: function (target, data) {
        var s = this;
        if (data.length === 0) {
            return;
        }
        $.each(data, function () {
            var newItem = this;
            $.each(target, function (i, item) {
                if (item.id == newItem.id) {
                    target.splice(i, 1);
                    return false;
                }
            });
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
    //提示区域
    tips: function (content) {
        var dom = $('<div>');
        dom.addClass(this.params.empty);
        dom.html(content);
        return dom;
    },
    //把pid==pid的数据构建为dom结构, 包括子集.
    render: function (pid) {
        var s = this;
        pid = pid || 0;
        var child = s.params.searchValue ? s.params.searchData : tree.getChildData.call(this, pid);
        var dom = tree.ul.call(this);
        var get = function (data, html) {
            $.each(data, function (i, item) {
                var li = tree.li.call(s, item);
                html.append(li);
                var child = s.params.searchValue ? [] : tree.getChildData.call(s, item.id);
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
    getChildData: function (pid) {
        pid = pid || 0;
        var childData = [];
        $.each(this.params.data, function (i, item) {
            if (item.pid === pid) {
                childData.push(item);
            }
        });
        return childData;
    },
    //从所有数据中找id==id的数据
    getData: function (id) {
        id = id || 0;
        var data = [];
        $.each(this.params.data, function (i, item) {
            if (item.id === id) {
                data.push(item);
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
        var currentData = tree.getData.call(s, id);
        tree.concat(params.selected, currentData);
        $.each(currentData, function () {
            if (this.selected !== true) {
                this.selected = true;
            }
        });
        params.dataChange.call(s);
    },
    //取消选择
    unSelected: function (id) {
        var s = this;
        var params = s.params;
        var currentData = tree.getData.call(s, id);
        tree.delete(params.selected, currentData);
        $.each(currentData, function () {
            if (this.selected === true) {
                this.selected = false;
                var li = tree.li.call(s, this);
                if (!params.searchValue) { //有搜索的时候平级显示,所以不需要找下级.
                    var child = tree.render.call(s, id);
                    var current = $('#' + params.name + '_' + id);
                    current.html('');
                    current.append(li).append(child);
                }
            }
        });
        params.dataChange.call(s);
    },
    //取所有选中数据
    getSelected: function () {
        return this.params.selected;
    },
    //搜索
    search: function (value) {
        var s = this;
        var params = s.params;
        params.searchValue = $.trim(value);
        params.searchData = []; //清空搜索数据, 下面重构数据
        if (params.searchValue) {
            $.each(s.params.data, function () {
                var item = this;
                $.each(s.params.searchKeys, function () {
                    var key = this;
                    if (typeof item[key] === 'number' && item[key] === value) {
                        params.searchData.push(item);
                        return false;
                    }
                    if (typeof item[key] === 'string' && item[key].indexOf(value) >= 0) {
                        params.searchData.push(item);
                        return false;
                    }
                    if (typeof item[key] === 'boolean' && item[key].toString() === value) {
                        params.searchData.push(item);
                        return false;
                    }
                });
            });
        }
        $.each(s.els, function () {
            var el = $(this);
            tree.init.call(s, el);
        });
    }
};

$.fn.extend({
    ez_tree: function (params) {
        new tree.Tree(this, params);
        return this;
    },
});

module.exports = tree.Tree;
