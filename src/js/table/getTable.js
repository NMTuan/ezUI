var getTable = {
    defaults: {
        hide: false,
        remove: false
    },
    getTable: function (el, params) {
        var data = {header: [], body: []};
        var params = $.extend(true, {}, getTable.defaults, params);
        el = $(el);

        //header
        el.find('thead th, thead td').each(function (i, item) {
            data.header.push({
                field: $(item).data('field') || 'field' + i,
                title: $.trim($(item).html())
            });
        });

        //body
        el.find('tbody tr').each(function (i, tr) {
            var item = {};
            $(tr).find('th, td').each(function (i, cell) {
                var field = $(cell).data('field') ||  'field' + i;
                var title = $.trim($(cell).html());
                item[field] = title;
            });
            data.body.push(item);
        });
        if(params.hide){
            el.hide();
        }
        if(params.remove){
            el.remove();
        }
        return data;
    },
};

module.exports = getTable.getTable;
