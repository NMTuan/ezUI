var path = location.pathname;
var delay;  //延时
var list = {
    defaults: {
        data: { //数据集, 必须有id
            header: [], //表头 {field, title}
            body: [],   //主体 {id, field1, field2}
        },
        selected: [],   //默认选中的行, [id1, id2]
        tableClass: [     //table要增加的class
            'ez-table-list-border',
            'ez-table-list-line',
            'ez-table-list-vline',
            'ez-table-list-hover',
            'ez-table-list-full',
            'ez-table-list-stripe',
            // 'ez-table-list-sm'
        ],
        hideFields: [], //列隐藏 [field1, field2], 如果本地有配置, 则优先本地配置
        sort: [],   //列排序及显示    [field1, field2], 如果本地有配置, 则优先本地配置
        clickSelected: true,   //点击选中
        multiple: '<input type="checkbox" class="ez-table-list-head-allChecked" />', //多选: 值是什么, 显示什么; false不开启; 如果为option 则为设定按钮, 同时, 不处理下面的optionsBtn.
        optionsBtn: '<i class="remixicon-settings-line">',   //功能设置按钮, false则不显示 remixicon-table-line
        localStorage: true, //本地记录配置, 如果是string, 则为ls_key的一部分, 解决一个url多个table无法独立配置的问题.
        btns: [],   //操作按钮
        btnsClassName: [    //按钮默认样式
            'ez-btn-sm',
            'ez-btn-radius'
        ],
        groupClassName: [   //组默认样式
            'ez-btn-group-radius'
        ],
        selectedChange: function (selected) {  //选中改变后执行

        }
    },
    list: function (els, params) {
        var arr = [];
        $.each(els, function () {
            var rs = new list.List($(this), params);
            arr.push(rs);
        });
        return arr;
    },
    List: function (el, params) {
        var s = this;
        s.el = el;
        s.params = $.extend(true, {}, list.defaults, params);
        s.destory = function () {
            list.destory.call(s);
        };
        s.getSelected = function () {
            return list.getSelected.call(s);
        };
        s.getSort = function () {
            return list.getSort.call(s);
        };
        s.selectedExistence = function () {
            return list.selectedExistence.apply(s, arguments);
        };
        s.selectedGetValues = function (key) {
            return list.selectedGetValues.call(s, key);
        };
        s.allSelect = function () {
            list.allSelect.call(s);
        };
        s.unSelect = function () {
            list.unSelect.call(s);
        };
        s.cancelSelect = function () {
            list.cancelSelect.call(s);
        };
        s.setData = function (data) {
            list.setData.call(s, data);
        };

        //如果开启多选, 则会直接跟上全选/反选两个操作按钮
        if (s.params.multiple !== false && s.params.multiple !== list.defaults.multiple && s.params.optionsBtn !== false) {
            var btns = {
                group: true,
                className: ['ez-btn-group-radius'],
                btns: [
                    {
                        id: 'selectAll',
                        title: '全选',
                        available: 'always',
                        click: function (btn, selected) {
                            this.allSelect();
                        }
                    },
                    {
                        id: 'unSelected',
                        title: '反选',
                        available: 'always',
                        click: function (btn, selected) {
                            this.unSelect();
                        }
                    },
                ]
            };
            s.params.btns.unshift(btns);
        }

        //表格设定
        if(s.params.optionsBtn !== false && s.params.multiple !== 'option'){
            var btns = {
                id: 'option',
                title: s.params.optionsBtn,
                available: 'always',
                click: function (btn, selected) {
                    list.optionTable.call(s);
                }
            };
            s.params.btns.unshift(btns);
        }

        list.initHideFields.call(s);
        list.initSort.call(s);
        list.renderTable.call(s);
        list.renderBtns.call(s);
        list.events.call(s);
        return s;
    },
    events: function () {
        var s = this;
        //点击选中行(单选)
        if (s.params.clickSelected) {
            s.el.on('click', '.ez-table-list-body .ez-table-list-row', function () {
                list.rowSelected.call(s, this);
                list.rowUnselected.call(s, $(this).siblings('.ez-table-list-active'));
            });
        }
        //勾选(可多选)
        s.el.on('click', 'input', function (e) {
            e.stopPropagation();
            list.rowToggleSelected.call(s, $(this).closest('.ez-table-list-row'));
        });
        //防止意外勾选, 扩大勾选热区
        s.el.on('click', '.ez-table-list-field-checkbox', function (e) {
            e.stopPropagation();
            list.rowToggleSelected.call(s, $(this).closest('.ez-table-list-row'));
        });
        //全选 checkbox
        s.el.on('click', '.ez-table-list-head-allChecked', function (e) {
            e.preventDefault();
            var checked = $(this).attr('checked');
            if(checked){
                s.cancelSelect();
            } else {
                s.allSelect();
            }
        });
        //设置
        s.el.on('click', '.ez-table-list-option', function () {
             list.optionTable.call(s);
        });
    },
    //初始化隐藏列
    initHideFields: function () {
        var s = this;
        if (window.localStorage && s.params.localStorage !== false) {
            var ls = localStorage.getItem('hideFields_' + s.params.localStorage.toString() + '_' + path);
            if(ls){
                s.params.hideFields = JSON.parse(ls);
            }
        }
    },
    //初始化排序
    initSort: function () {
        var s = this;
        if (window.localStorage && s.params.localStorage !== false) {
            var ls = localStorage.getItem('sort_' + s.params.localStorage.toString() + '_'  + path);
            if(ls){
                s.params.sort = JSON.parse(ls);
            }
        }
        //循环表头, 补充没有被排序的列, 保证后期新加的列默认呈显示状态.
        $.each(s.params.data.header, function () {
            if (this.field.indexOf('_') === 0) {
                return;
            }
            if ($.inArray(this.field, s.params.sort) >= 0) {
                return;
            }
            s.params.sort.push(this.field);
        });
        //如果是多选, 并且没有设定checkbox, 则在第一位增加checkbox
        if (s.params.multiple !== false && $.inArray('checkbox', s.params.sort) < 0) {
            s.params.sort.unshift('checkbox');
        }
    },
    //渲染表格
    renderTable: function () {
        var s = this;
        var table = $('<div>').addClass('ez-table-list-table').addClass(s.params.tableClass.join(' '));
        var header = list.renderHeader.call(s);
        var body = list.renderBody.call(s);
        table.append(header).append(body);
        s.el.find('.ez-table-list-table').remove();
        s.el.append($('<div class="ez-table-list-wrap"/>').append(table));
    },
    //渲染表头
    renderHeader: function () {
        var s = this;
        var html = $('<div>').addClass('ez-table-list-head');
        var row = $('<div>').addClass('ez-table-list-row');

        //按排序构建列
        $.each(s.params.sort, function (i, field) {
            if (field === 'checkbox') {
                if(s.params.multiple === false){
                    return;
                }
                var optionBtn = '';
                if (s.params.multiple === 'option') {
                    optionBtn = $('<i>').addClass('remixicon-settings-line ez-table-list-option');
                    optionBtn = $('<a>').attr('href', 'javascript:;').append(optionBtn);
                } else {
                    optionBtn = s.params.multiple;
                }
                var cell = list.renderCell(s.params.multiple === 'option' ? 'option' : '', true);
                cell.css('width', '46px');
                cell.addClass('ez-text-center');
                cell.html(optionBtn);
                row.append(cell);
                return;
            }
            $.each(s.params.data.header, function (i, item) {
                if (item.field === field) {
                    var cell = list.renderCell(item.field, true);
                    if ($.inArray(field, s.params.hideFields) < 0) {
                        cell.html(item.title);
                        if (item.width) {
                            cell.css('width', item.width);
                        }
                    } else {    //如果隐藏, 显示一条线
                        cell.addClass('ez-table-list-cell-hide')
                    }
                    // cell.attr('title', cell.text());
                    if (item.field === 'drag') {
                        cell.css('width', '46px');
                        cell.addClass('ez-text-center');
                    }
                    row.append(cell);
                    return false;
                }
            });
        });

        html.append(row);
        return html;
    },
    //渲染表格主体
    renderBody: function () {
        var s = this;
        var html = $('<div>').addClass('ez-table-list-body');
        $.each(s.params.data.body, function (i, item) {
            if (typeof item.id === 'undefined') {   //没有id就造一个.
                item.id = 'id_' + i;
            }
            var row = list.renderRow.call(s, item, i);
            html.append(row);
        });
        return html;
    },
    //渲染行, data单元格数据数组
    renderRow: function (data, _index) {
        var s = this;
        var html = $('<div>').addClass('ez-table-list-row');
        $.each(data, function (key, value) {
            html.data(key, value);
        });
        //增加选中class
        if ($.inArray(data.id, s.params.selected) >= 0) {
            html.addClass('ez-table-list-active');
        }

        //按排序构建列
        $.each(s.params.sort, function (i, field) {
            //构建复选框
            if (field === 'checkbox') {
                if(s.params.multiple === false){
                    return;
                }
                var checkbox = $('<input>').attr({
                    type: 'checkbox',
                    name: '',
                    value: data.id
                });
                $.each(data, function (key, value) {
                    checkbox.data(key, value);
                });
                //默认选中
                if ($.inArray(data.id, s.params.selected) >= 0) {
                    checkbox.attr('checked', 'checked');
                }
                var cell = list.renderCell('checkbox', true);
                cell.addClass('ez-text-center');
                cell.append(checkbox);
                html.append(cell);
            }
            //构建拖拽
            if (field === 'drag') {
                var cell = list.renderCell('drag', true);
                cell.addClass('ez-text-center');
                cell.append('<i class="remixicon-drag-move-fill ez-cursor-drag"></i>');
                html.append(cell);
            }
            $.each(data, function (key, value) {
                if (key === field) {
                    var cell = list.renderCell(key);
                    if ($.inArray(field, s.params.hideFields) < 0) {
                        cell.html(value);
                        // cell.attr('title', cell.text());
                    } else {    //隐藏数据显示一条线
                        cell.addClass('ez-table-list-cell-hide')
                    }
                    html.append(cell);
                    return false;
                }
            });
        });
        return html;
    },
    //渲染单元格, field字段, th是否为th
    renderCell: function (field, th) {
        var cls = [];
        cls.push(th ? 'ez-table-list-th' : 'ez-table-list-td');
        if (field) {
            cls.push('ez-table-list-field-' + field);
        }
        return $('<div>').addClass(cls.join(' '));
    },

    //选中当前行
    rowSelected: function (row) {
        var s = this;
        $(row).addClass('ez-table-list-active').find('input').prop('checked', true);
        var ids = $(row).map(function () {
            return $(this).data('id');
        });
        list.selectedAdd.call(s, ids);
    },
    //取消当前行
    rowUnselected: function (row) {
        var s = this;
        $(row).removeClass('ez-table-list-active').find('input').prop('checked', false);
        var ids = $(row).map(function () {
            return $(this).data('id');
        });
        list.selectedRemove.call(s, ids);
    },
    //切换选中状态
    rowToggleSelected: function (row) {
        var s = this;
        var selected = [];
        var unSelected = [];
        $.each(row, function () {
            if ($(this).hasClass('ez-table-list-active')) {
                selected.push(this);
            } else {
                unSelected.push(this);
            }
        });
        list.rowSelected.call(s, unSelected);
        list.rowUnselected.call(s, selected);

        // if ($(row).hasClass('ez-table-list-active')) {
        //     list.rowUnselected.call(s, row);
        // } else {
        //     list.rowSelected.call(s, row);
        // }
    },
    //销毁
    destory: function () {
        this.el.remove();
    },
    //获取选中数据
    getSelected: function () {
        var s = this;
        var selected = [];  //返回的数据集
        var el = s.el.find('input').length === 0 ? s.el.find('.ez-table-list-active') : s.el.find(':checked').not('.ez-table-list-head-allChecked');  //取数据的el
        el.each(function () {
            var item = {};  //每项数据集
            $.each($(this).data(), function (key, value) {
                item[key] = value;
            });
            selected.push(item);
        });

        return selected;
    },
    //添加选中
    selectedAdd: function (dataIds) {
        var s = this;
        $.each(dataIds, function (i, dataId) {
            if (typeof dataId !== 'undefined' && $.inArray(dataId, s.params.selected) < 0) {
                s.params.selected.push(dataId);
                list.selectedChange.call(s);
            }
        });
    },
    //移除选中
    selectedRemove: function (dataIds) {
        var s = this;
        $.each(dataIds, function (i, dataId) {
            var index = s.params.selected.indexOf(dataId);
            if (index < 0) {
                return;
            }
            s.params.selected.splice(index, 1);
        });
        list.selectedChange.call(s);
    },
    //选中数据改变后
    selectedChange: function () {
        var s = this;
        clearTimeout(delay);
        delay = setTimeout(function () {
            list.renderBtns.call(s);
            var selected  = s.getSelected();
            var allChecked = s.el.find('.ez-table-list-head-allChecked');
            if(selected.length === s.params.data.body.length){
                allChecked.attr('checked', 'checked');
                allChecked.prop('checked', true);
            } else {
                allChecked.removeAttr('checked');
                allChecked.prop('checked', false);
            }
            s.params.selectedChange.call(s, selected);
        }, 50);
    },
    //在选中的数据中找key的值是否等于value
    selectedExistence: function (key, values) {
        var s = this;
        var has = false;
        if (typeof key === 'undefined') {
            return has;
        }
        values = values || [];
        if (values.length === 0) {
            return has;
        }
        var datas = list.getSelected.call(s);
        $.each(datas, function (i, item) {
            if (item[key] && $.inArray(item[key], values) >= 0) {
                has = true;
                return false;
            }
        });
        return has;
    },
    //从选中数据中找某字段的值
    selectedGetValues: function (key) {
        var s = this;
        var values = [];
        var datas = list.getSelected.call(s);
        $.each(datas, function (i, item) {
            values.push(item[key]);
        });
        return values;
    },
    //获取顺序
    getSort: function () {
        var s = this;
        var sort = [];
        $.each(s.el.find(':checkbox'), function (i, item) {
            var val = $.trim($(item).val());
            if (val) {
                sort.push(val);
            }
        });
        return sort;
    },
    //拖拽
    dragula: function (container) {
        dragula([container], {
            revertOnSpill: true,
            // direction: 'vertical',
            moves: function (el, container, handle) {
                return $(handle).hasClass('remixicon-drag-move-fill');
            }
        });
    },

    //按钮
    initBtns: function () {
        var s = this;
        s.fnEl = $('<div>').addClass('ez-table-list-fn');
        s.el.prepend(this.fnEl);
    },
    renderBtns: function () {
        var s = this;
        if (s.params.btns.length === 0) {
            return;
        }
        if (typeof s.fnEl === 'undefined') {
            list.initBtns.call(s);
        }
        s.fnEl.empty();

        //先取按钮交集
        var intersection = [];
        $.each(s.getSelected(), function (i, item) {
            if (typeof item._btnStatus === 'undefined') {
                return;
            }
            var btnStatus = item._btnStatus.split(',');
            if (i === 0) {
                intersection = btnStatus;
                return;
            }
            var _intersection = [];
            $.each(intersection, function () {
                var existence = $.inArray(this, btnStatus);
                if (existence >= 0) {
                    _intersection.push(this);
                }
            });
            intersection = _intersection;
        });


        //btn: {
        // id:按钮编号,
        // title:按钮显示名称,
        // className:额外class,
        // available:可用状态, 默认可用 unSelected:未选择可用, selected:有选择可用, allSelect:全选可用, single:单选可用, multiple:多选可用
        // click:点击事件
        // }
        $.each(s.params.btns, function (i, item) {
            if (item.group && item.btns.length > 0) {    //按钮组
                var group = $('<span>').addClass('ez-btn-group');
                group.addClass(s.params.groupClassName.join(' '));
                if (item.className && item.className.length > 0) {
                    group.addClass(item.className.join(' '));
                }
                $.each(item.btns, function (i, _item) {
                    var btn = list.renderBtn.call(s, _item, intersection);
                    group.append(btn);
                });
                s.fnEl.append(group);
                s.fnEl.append(' ');
                return;
            }
            var btn = list.renderBtn.call(s, item, intersection);
            s.fnEl.append(btn);
            s.fnEl.append(' ');

        });
    },
    //构建单个按钮
    renderBtn: function (btnData, intersection) {
        var s = this;
        var selected = s.params.selected;  //选中数据id;
        var btn = $('<a>');
        btn.addClass('ez-btn');
        btn.addClass(s.params.btnsClassName.join(' '));
        btn.html(btnData.title);
        if (btnData.className) {
            btn.addClass(btnData.className.join(' '));
        }
        //处理available状态
        if (
            // (btnData.available !== 'always') ||   //不是一直
            (btnData.available !== 'always' && $.inArray(btnData.id, intersection) < 0) ||   //没按钮
            (btnData.available === 'unSelected' && selected.length > 0) || //未选状态, 但已选数量大于0
            (btnData.available === 'selected' && selected.length === 0) ||  //有选状态, 但已选数量等于0
            (btnData.available === 'allSelect' && selected.length !== s.params.data.body.length) || //全选状态, 但已选数量不等于最大数据
            (btnData.available === 'single' && selected.length !== 1) || //单选状态, 但已选数量不是1
            (btnData.available === 'multiple' && selected.length <= 1) //多选状态, 但已选数量不够
        ) {
            btn.addClass('ez-btn-disabled');
            return btn;
        }

        btn.on('click', function () {
            btnData.click.call(s, btn, selected);
        });

        return btn;
    },
    //全选
    allSelect: function () {
        var s = this;
        list.rowSelected.call(s, s.el.find('.ez-table-list-body .ez-table-list-row'));
    },
    //反选
    unSelect: function () {
        var s = this;
        list.rowToggleSelected.call(s, s.el.find('.ez-table-list-body .ez-table-list-row'));
    },
    //取消选择
    cancelSelect: function () {
        var s = this;
        list.rowUnselected.call(s, s.el.find('.ez-table-list-body .ez-table-list-row'));
    },
    //设置项
    optionTable: function () {
        var s = this;
        var el = $('<div>').addClass('ez-table-list');
        el.css({
            padding: '12px'
        });
        var body = [];
        $.each(s.params.sort, function () {
            var field = this;
            $.each(s.params.data.header, function (i, item) {
                if (item.field === field) {
                    body.push({id: field, col: item.title});
                    return false;
                }
            });
        });
        var options = {
            data: {
                header: [
                    {field: 'id', title: '编号'},
                    {field: 'col', title: '列'},
                    {field: 'drag', title: '顺序'},
                ],
                body: body,
            },
            tableClass: [
                'ez-table-list-border',
                'ez-table-list-line',
                'ez-table-list-vline',
                'ez-table-list-hover',
                'ez-table-list-full',
                'ez-table-list-sm',
                'ez-table-list-selected-disabled',
                'ez-noselect'
            ],
            selected: s.params.hideFields,
            clickSelected: false,
            // hideFields: ['id'],
            optionsBtn: false,
            sort: ['col', 'id',  'drag', 'checkbox'],
            multiple: '隐藏',
            localStorage: false
        };
        $('body').append(el);
        var cfgTable = new list.List(el, options);
        layer.open({
            type: 1,
            title: '表格配置',
            content: el,
            area: ['640px', '480px'],
            btn: ['保存'],
            zIndex: 10,
            success: function () {
                list.dragula(cfgTable.el.find('.ez-table-list-body')[0]);
            },
            yes: function (layerIndex, layerObj) {
                layer.close(layerIndex);
                var selectedData = cfgTable.getSelected();
                var selected = [];
                $.each(selectedData, function () {
                    selected.push(this.id);
                });
                s.params.hideFields = selected;
                var checkboxIndex = $.inArray('checkbox', s.params.sort);   //找到checkbox的位置
                s.params.sort = cfgTable.getSort();
                s.params.sort.splice(checkboxIndex, 0, 'checkbox'); //新排序插入checkbox
                if (window.localStorage && s.params.localStorage) {
                    localStorage.setItem('hideFields_' + s.params.localStorage.toString() + '_'  + path, JSON.stringify(s.params.hideFields));
                    localStorage.setItem('sort_' + s.params.localStorage.toString() + '_'  + path, JSON.stringify(s.params.sort));
                }
                list.renderTable.call(s);
            },
            end: function () {
                cfgTable.destory();
            }
        })
    },
    //更新数据
    setData: function (data) {
        var s = this;
        s.params.data.body = data;  //写入新数据
        list.renderTable.call(s);   //渲染表格
        list.cancelSelect.call(s);  //清空已选内容
    }
};

$.fn.extend({
    ez_table_list: function (params) {
        list.list(this, params);
        return this;
    }
});

module.exports = list.list;
