var random = require('../random/random');
//防抖
var dataChangeDt, appendTreeDt;

var tree = {
    defaults: {
        ul: 'ez-tree-ul',
        li: 'ez-tree-li',
        item: 'ez-tree-item',
        tips: 'ez-tree-tips',
        name: '',   //input的name, 不指定则随机
        type: '',   //前置input框, radio, checkbox, 留空则没前置
        selectAllItem: false,   //是否有全选这个项目
        data: [],   //数据
        dataUrl: '', //异步加载
        selected: [], //选中数据
        searchKeys: [], //本地搜索的keys
        searchValue: '', //本地搜索的value
        searchData: [],   //搜索的数据
        searchUrl: '',  //异步搜索
        beforeChoose: function (input, el) {    //选中事件前执行, 返回false则不改变input值
        },
        choose: function (input, el) {  //选择后执行
            // $.log('choose');
        },
        dataChange: function () {   //selected数据改变时执行
            // $.log('change');
        }
    },
    Tree: function (els, params) {
        var s = this;
        s.el = els.first();
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
        s.setData = function () {
            tree.setData.apply(s, arguments);
        };
        tree.init.call(s);
        tree.events.call(s);
    },
    //初始化
    init: function () {
        var s = this;
        var params = s.params;

        //处理默认选中的数据
        if (params.selected.length > 0) {
            $.each(params.selected, function () {
                this.selected = true;
            });
        }

        //更新默认数据信息
        tree.concat.call(s, params.data, params.selected, {push_existence: false});

        //异步
        if (params.dataUrl) {
            tree.getJson.call(s, params.dataUrl, function (res) {
                tree.concat.call(s, params.data, res.result);
                tree.concat.call(s, params.selected, res.result, {push_existence: false});
                tree.concat.call(s, params.data, params.selected, {push_existence: false});
                tree.appendTree.call(s);
            });
        } else {
            tree.appendTree.call(s);
        }
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
            push_existence: true,
        };
        options = $.extend(true, {}, defaults, options);
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
    events: function () {
        var s = this;
        var el = s.el;
        var params = s.params;
        el.on('click', 'input', function () {
            var that = $(this);
            //插入事件, 若返回false, 则返回
            var before = params.beforeChoose(that, el);
            if (before === false) {
                return false;
            }
            var status = that.prop('checked');
            var id = that.data('id');
            //单选模式, 选择已选数据, 不处理.
            // if (s.params.type === 'radio' && s.params.selected.length === 1 && s.params.selected[0].id === id) {
            //     return;
            // }
            if(s.params.type === 'radio'){
                $.each(params.data, function () {
                    if (this.selected) {
                        this.selected = false;
                    }
                });
                params.selected = tree.getData.call(s, id);
                tree.dataChange.call(s);
            }
            //全选操作
            if(that.data('id') === 'selectAll'){
                if(status){
                    tree.selectedAll.call(s);
                } else {
                    tree.unSelectedAll.call(s);
                }
                return;
            }
            if(s.params.type === 'checkbox'){
                if (status) { //选中了
                    tree.selected.call(s, id);
                } else {    //取消了
                    tree.unSelected.call(s, id);
                }
            }
            //插入事件
            params.choose.call(s, that, el);
        });
    },

    //渲染
    //ul的dom构建
    ul: function () {
        return $('<ul>').addClass(this.params.ul);
    },
    //li的dom构建 todo:需要优化
    li: function (data) {
        var s = this;
        var params = this.params;
        var li = $('<li>').addClass(params.li).attr('id', params.name + '_' + data.id);
        var item = $('<div>').addClass(params.item);
        var html = data.title;
        var checked = data.selected ? 'checked="checked"' : '';
        if(s.params.selectAllItem && data.id === 'selectAll'){  //全选操作, 默认是否选中
            var d = s.params.searchData.length === 0 ? s.params.data : s.params.searchData;
            checked = d.length === s.params.selected.length ?'checked="checked"' : '';
        }
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
        var el = this.el;
        var dom = $('<div>');
        dom.addClass(this.params.tips);
        dom.html(content);
        el.html(dom);
        return dom;
    },
    appendTree: function () {
        var s = this;
        setTimeout(appendTreeDt);
        appendTreeDt = setTimeout(function () {
            var html = tree.render.call(s);
            if (html.html() === '') {
                var tips = '暂无内容';
                if (s.params.searchUrl) {
                    tips = s.params.searchValue ? '没找到任何内容' : '请输入查询条件';
                }
                tree.tips.call(s, tips);
            } else {
                s.el.html(html);
            }
            tree.dataChange.call(s);

        }, 30);
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
                if (s.params.searchValue) {
                    return;
                }
                var child = tree.getChildData.call(s, item.id);
                if (child.length > 0) {
                    var ul = tree.ul.call(s);
                    li.append(ul);
                    get(child, ul);
                }
            })
        };
        get(child, dom);
        if(dom.html() !== '' && s.params.selectAllItem){ //如果有全选配置
            var li = tree.li.call(s, {title: '(全选)', id: 'selectAll', pid: 'selectAll'});
            dom.prepend(li);
        }
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
    getData: function (id, data) {
        data = data || this.params.data;
        id = id || 0;
        var _data = [];
        $.each(data, function (i, item) {
            if (item.id === id) {
                _data.push(item);
                return false;
            }
        });
        return _data;
    },
    setData: function (data) {
        var s = this;
        var params = s.params;
        //把data替换掉
        params.data = data;
        //更新下data状态
        tree.concat.call(s, params.data, params.selected, {push_existence: false});
        //重新渲染
        tree.appendTree.call(s);
    },
    //取数据
    getJson: function (url, data, success) {
        if(typeof data === 'function'){
            success = data;
            data = {};
        }
        var s = this;
        if (!url && typeof success === 'function') {
            success({});
            return;
        }
        var loading = tree.tips.call(s, '努力加载中');
        $.getJSON(url, data)
            .done(function (res) { //success
                if (res.code !== '40000') {
                    tree.tips.call(s, '数据加载失败, 请刷新后重试!');
                    return;
                }
                if (typeof success === 'function') {
                    success(res);
                }
            })
            .fail(function () { //error
                tree.tips.call(s, '数据加载失败, 请刷新后重试!');
            })
            .always(function () {   //complete
                loading.remove();
            })
        ;
    },

    //方法
    //选择
    selected: function (id) {
        var s = this;
        var params = s.params;
        var currentData = tree.getData.call(s, id); //找到当前数据
        tree.concat(params.selected, currentData);  //合并到已选数据中
        $.each(currentData, function () {   //处理当前数据的选中状态
            if (this.selected !== true) {
                this.selected = true;
            }
        });
        tree.appendTree.call(s);
    },
    //取消选择
    unSelected: function (id) {
        var s = this;
        var params = s.params;
        var selectedData = tree.getData.call(s, id, params.selected);   //从选中数据中找到当前数据
        var currentData = tree.getData.call(s, id); //从所有数据中找到当前数据

        tree.delete(params.selected, selectedData); //从选中数据中移除当前数据.
        $.each(currentData, function () {
            if (this.selected === true) {
                this.selected = false;
                //以下逻辑忘记干啥的了, 注释掉发现没异常, 暂时注释掉..2019.10.30
                // var li = tree.li.call(s, this);
                // var child = tree.render.call(s, id);
                // var current = $('#' + params.name + '_' + id);
                // current.html('');
                // current.append(li);
                // if (!params.searchValue) {
                //     current.append(child);
                // }
            }
        });
        tree.appendTree.call(s);
    },
    //数据发生变化, 执行.
    dataChange: function(){
        var s = this;
        clearTimeout(dataChangeDt);
        dataChangeDt = setTimeout(function () {
            console.table(s.params.searchData);
            s.params.dataChange.call(s);

        }, 30);
    },
    selectedAll: function(){
        var s = this;
        var data = s.params.searchData.length === 0 ? s.params.data : s.params.searchData;
        $.each( data, function (i, item) {
            if(item.id){
                tree.selected.call(s, item.id);
            }
        });
        tree.appendTree.call(s);

    },
    unSelectedAll: function(){
        var s = this;
        $.each(s.params.data, function (i, item) {
            if(item.selected){
                tree.unSelected.call(s, item.id);
            }
        });
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
        if (!params.searchValue) {
            tree.appendTree.call(s);
            return;
        }
        if (params.searchUrl) {   //异步查询模式
            tree.getJson.call(s, params.searchUrl, {q: value}, function (res) {
                s.params.searchData = res.result;
                s.params.data = res.result;
                tree.concat.call(s, s.params.selected, res.result, {push_existence: false});
                tree.concat.call(s, s.params.searchData, s.params.selected, {push_existence: false});
                tree.appendTree.call(s);
            });
            return;
        }
        $.each(s.params.data, function () { //本地查询
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
            tree.appendTree.call(s);
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
