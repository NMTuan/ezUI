var list = {
    defaults: {
        data: {
            header: [],
            body: [],
        },
        sort: [],
        tableClass: [
            'ez-table-list-border',
            'ez-table-list-line',
            'ez-table-list-vline',
            'ez-table-list-hover',
            'ez-table-list-full',
            'ez-table-list-stripe',
            // 'ez-table-list-sm',
        ],
        multiple: false, //多选
        move: false, //列移动
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

        list.renderTable.call(s);
        list.events.call(s);
    },
    events: function () {
        var s = this;
        //点击选中行(单选)
        s.el.on('click', '.ez-table-list-row', function () {
            console.log('click')
            list.rowSelected(this);
            list.rowUnselected($(this).siblings('.ez-table-list-active'));
            $(this).addClass('ez-table-list-active').siblings().removeClass('ez-table-list-active').find('input').prop('checked', false);
            $(this).find('input').prop('checked', true);
        });
        //勾选(可多选)
        s.el.on('click', 'input', function (e) {
            e.stopPropagation();
            list.rowToggleSelected($(this).closest('.ez-table-list-row'));
        });
        //防止意外勾选, 扩大勾选热区
        s.el.on('click', '.ez-table-list-field-checkbox', function (e) {
            e.stopPropagation();
            list.rowToggleSelected($(this).closest('.ez-table-list-row'));
        });
        //选项
        s.el.on('click', '.ez-table-list-field-option', function (e) {
            var el = $('<div>').addClass('ez-table-list')//.append($('<div>').addClass('ez-table-list'));
            var options = {
                data: {
                    header: [
                        {field: 'id', title: '编号'},
                        {field: 'col', title: '列'},
                    ],
                    body: [
                        {id: 'id', col: '编号'},
                        {id: 'code', col: '服务号'},
                        {id: 'company', col: '所属企业'},
                        {id: 'agent', col: '所属机构'},
                        {id: 'site', col: '归属落地'},
                        {id: 'address', col: '服务器地址'},
                    ]
                },
                tableClass: [
                    'ez-table-list-border',
                    'ez-table-list-line',
                    'ez-table-list-vline',
                    'ez-table-list-hover',
                    'ez-table-list-full',
                    'ez-table-list-sm',
                ],
            };
            $('body').append(el);
            new list.List(el, options);
            console.log(el);
            layer.open({
                type: 1,
                title: '表格配置',
                content: el.first(),
                btn: ['保存'],
            })
        });

    },
    //渲染表格
    renderTable: function () {
        var s = this;
        var table = $('<div>').addClass('ez-table-list-table').addClass(s.params.tableClass.join(' '));
        var header = list.renderHeader.call(s);
        var body = list.renderBody.call(s);
        table.append(header).append(body);
        s.el.append(table);
    },
    //渲染表头
    renderHeader: function () {
        var s = this;
        var html = $('<div>').addClass('ez-table-list-head');
        var row = $('<div>').addClass('ez-table-list-row');
        var dragBtn = $('<i>').addClass('remixicon-more-2-line');
        //多选框
        if (s.params.multiple) {
            var optionBtn = $('<i>').addClass('remixicon-list-settings-line');
            var cell = list.renderCell('option', true);
            cell.css('width', '1px');
            cell.html(optionBtn);
            row.append(cell);
        }
        //如果有顺序配置, 则按配置执行, 否则输出全字段
        if (s.params.sort.length > 0) {
            $.each(s.params.sort, function (i, field) {
                $.each(s.params.data.header, function (i, item) {
                    if (item.field !== field) {
                        return;
                    }
                    var cell = list.renderCell(item.field, true);
                    cell.html(item.title);
                    if (s.params.move) {
                        cell.prepend(dragBtn.clone());
                    }
                    row.append(cell);
                });
            });
        } else {
            $.each(s.params.data.header, function (i, item) {
                var cell = list.renderCell(item.field, true);
                cell.html(item.title);
                if (s.params.move) {
                    cell.prepend(dragBtn.clone());
                }
                row.append(cell);
            });
        }
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
        if (s.params.multiple) {
            var checkbox = $('<input>').attr({
                type: 'checkbox',
                name: '',
                value: data.id
            });
            var cell = list.renderCell('checkbox', true);
            cell.append(checkbox);
            html.append(cell);
        }
        //如果有顺序配置, 则按配置执行, 否则输出全字段
        if(s.params.sort.length > 0){
            $.each(s.params.sort, function (i, field) {
                $.each(data, function (key, value) {
                    if(key !== field){
                        return;
                    }
                    var cell = list.renderCell(key);
                    cell.html(value);
                    html.append(cell);
                });
            });
        } else {
            $.each(data, function (key, value) {
                var cell = list.renderCell(key);
                cell.html(value);
                html.append(cell);
            });
        }
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
        $(row).addClass('ez-table-list-active').find('input').prop('checked', true);
    },
    //取消当前行
    rowUnselected: function (row) {
        $(row).removeClass('ez-table-list-active').find('input').prop('checked', false);
    },
    //切换选中状态
    rowToggleSelected: function (row) {
        if ($(row).hasClass('ez-table-list-active')) {
            list.rowUnselected(row);
        } else {
            list.rowSelected(row);
        }
    }
};

$.fn.extend({
    ez_table_list: function (params) {
        list.list(this, params);
        return this;
    }
});

module.exports = list.list;
