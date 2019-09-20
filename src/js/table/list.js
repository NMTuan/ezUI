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
        ],
        hideFields: [], //列隐藏 [field1, field2]
        sort: [],   //列排序及显示    [field1, field2]
        clickSelected: false,   //点击选中
        multiple: false, //多选   false不开启, option增加配置功能, 其它值则直接显示string
        cfgTableLocalstorage: true, //本地记录配置
        btns: [],   //操作按钮
    },
    list: function (els, params) {
        $.each(els, function () {
            new list.List($(this), params);
        });
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
                $(this).addClass('ez-table-list-active').siblings().removeClass('ez-table-list-active').find('input').prop('checked', false);
                $(this).find('input').prop('checked', true);
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
        //选项
        s.el.on('click', '.ez-table-list-field-option', function (e) {
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
                // hideFields: ['id'],
                sort: ['id', 'col', 'drag', 'checkbox'],
                multiple: '隐藏',
                cfgTableLocalstorage: false
            };
            $('body').append(el);
            var cfgTable = new list.List(el, options);
            layer.open({
                type: 1,
                title: '表格配置',
                content: el,
                area: ['640px', 'auto'],
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
                    if (window.localStorage && s.params.cfgTableLocalstorage) {
                        localStorage.setItem('hideFields_' + path, JSON.stringify(s.params.hideFields));
                        localStorage.setItem('sort_' + path, JSON.stringify(s.params.sort));
                    }
                    list.renderTable.call(s);
                },
                end: function () {
                    cfgTable.destory();
                }
            })
        });
    },
    //初始化隐藏列
    initHideFields: function () {
        var s = this;
        var ls = localStorage.getItem('hideFields_' + path);
        if (window.localStorage && s.params.cfgTableLocalstorage && ls) {
            s.params.hideFields = JSON.parse(ls);
        }
    },
    //初始化排序
    initSort: function () {
        var s = this;
        var ls = localStorage.getItem('sort_' + path);
        if (window.localStorage && s.params.cfgTableLocalstorage && ls) {
            s.params.sort = JSON.parse(ls);
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
        s.el.empty().append(table);
    },
    //渲染表头
    renderHeader: function () {
        var s = this;
        var html = $('<div>').addClass('ez-table-list-head');
        var row = $('<div>').addClass('ez-table-list-row');
        //多选框
        if (s.params.multiple) {
        }
        //按排序构建列
        $.each(s.params.sort, function (i, field) {
            //如果隐藏, 跳过
            if ($.inArray(field, s.params.hideFields) >= 0) {
                return;
            }
            if (field === 'checkbox') {
                var optionBtn = '';
                if (s.params.multiple === 'option') {
                    optionBtn = $('<i>').addClass('remixicon-settings-line');
                    optionBtn = $('<a>').attr('href', 'javascript:;').append(optionBtn);
                } else {
                    optionBtn = s.params.multiple;
                }
                var cell = list.renderCell(s.params.multiple === 'option' ? 'option' : '', true);
                cell.css('width', '1px');
                cell.addClass('ez-text-center');
                cell.html(optionBtn);
                row.append(cell);
                return;
            }
            $.each(s.params.data.header, function (i, item) {
                if (item.field === field) {
                    var cell = list.renderCell(item.field, true);
                    cell.html(item.title);
                    if (item.field === 'drag') {
                        cell.css('width', '1px');
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
            var row = list.renderRow.call(s, item);
            html.append(row);
        });
        return html;
    },
    //渲染行, data单元格数据数组
    renderRow: function (data) {
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
            if ($.inArray(field, s.params.hideFields) >= 0) {
                return;
            }
            //构建复选框
            if (field === 'checkbox') {
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
                    cell.html(value);
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
        list.selectedAdd.call(s, $(row).data('id'));
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
        if ($(row).hasClass('ez-table-list-active')) {
            list.rowUnselected.call(s, row);
        } else {
            list.rowSelected.call(s, row);
        }
    },
    //销毁
    destory: function () {
        this.el.remove();
    },
    //获取选中数据
    getSelected: function () {
        var s = this;
        var selected = [];  //返回的数据集
        var el = s.el.find('input').length === 0 ? s.el.find('.ez-table-list-active') : s.el.find(':checked');  //取数据的el
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
    selectedAdd: function (dataId) {
        if (dataId) {
            this.params.selected.push(dataId);
            list.selectedChanged.call(this);
        }
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
        list.selectedChanged.call(s);
    },
    //选中数据改变后
    selectedChanged: function () {
        var s = this;
        clearTimeout(delay);
        delay = setTimeout(function () {
            var selected = list.getSelected.call(s);
            list.renderBtns.call(s);
        }, 100);
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
    initBtns: function(){
        this.fnEl = $('<div>').addClass('ez-table-list-fn');
        this.el.prepend(this.fnEl);
    },
    renderBtns: function () {
        var s = this;
        if(s.params.btns.length === 0){
            return;
        }
        if(typeof s.fnEl === 'undefined'){
            list.initBtns.call(s);
        }
        s.fnEl.empty();

        $.each(s.params.btns,function (i, item) {
            var btn = $('<div>');
            btn.addClass('ez-btn ez-btn-success');
            btn.html(item.title);
            var state = item.state.call(s);
            if(state === 'disabled'){
                btn.addClass('ez-btn-disabled');
            }
            btn.on('click', function () {
                var selected = list.getSelected.call(s);
                item.click.call(s, selected);
            });
            s.fnEl.append(btn);
            s.fnEl.append(' ');
        });
    },
};

$.fn.extend({
    ez_table_list: function (params) {
        list.list(this, params);
        return this;
    }
});

module.exports = list.list;
