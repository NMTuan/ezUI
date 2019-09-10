var list = {
    defaults: {
        data: {
            header: [],
            body: [],
            option: [],
        },
        tableClass: [
            'ez-table-list-border',
            'ez-table-list-line',
            'ez-table-list-vline',
            'ez-table-list-hover',
            'ez-table-list-full',
            'ez-table-list-stripe',
            // 'ez-table-list-sm',
        ],
        // multiple: true, //多选
        // move: true, //列移动
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
        //点击选中行
        s.el.on('click', '.ez-table-list-row', function () {
            $(this).addClass('ez-table-list-active').siblings().removeClass('ez-table-list-active').find('input').prop('checked', false);
            $(this).find('input').prop('checked', true);
        });
        s.el.on('click', 'input', function (e) {
            e.stopPropagation();
            $(this).closest('.ez-table-list-row').addClass('ez-table-list-active');
        })

    },
    renderTable: function () {
        var s = this;
        var table = $('<div>').addClass('ez-table-list-table').addClass(s.params.tableClass.join(' '));
        var header = list.renderHeader.call(s);
        var body = list.renderBody.call(s);
        table.append(header).append(body);
        s.el.append(table);
    },
    renderHeader: function () {
        var s = this;
        var html = $('<div>').addClass('ez-table-list-head');
        var row = $('<div>').addClass('ez-table-list-row');
        var drag = $('<i>').addClass('remixicon-more-2-line');
        var optionBtn = $('<i>').addClass('remixicon-list-settings-line');
        row.append(list.renderCell(optionBtn, true));
        $.each(s.params.data.header, function (i, item) {
            var cell = list.renderCell(item.title, true);
            cell.prepend(drag.clone());
            row.append(cell);
        });
        html.append(row);
        return html;
    },
    renderBody: function () {
        var s = this;
        var html = $('<div>').addClass('ez-table-list-body');
        $.each(s.params.data.body, function (i, item) {
            var row = list.renderRow(item);
            html.append(row);
        });
        return html;
    },
    renderRow: function (data) {
        var html = $('<div>').addClass('ez-table-list-row');
        html.append(list.renderCell('<input type="checkbox" name="" id="">', true));
        $.each(data, function (key, value) {
            var cell = list.renderCell(value);
            html.append(cell);
        });
        return html;
    },
    renderCell: function (value, th) {
        return $('<div>').addClass('ez-table-list-' + (th ? 'th' : 'td')).html(value);
    },
};

$.fn.extend({
    ez_table_list: function (params) {
        list.list(this, params);
        return this;
    }
});

module.exports = list.list;
