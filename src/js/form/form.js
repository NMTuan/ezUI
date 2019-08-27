var Tree = require('../tree/tree');
var form = {
    defaults: {
        icon: '.ez-form-select-icon',
        item: '.ez-form-select-item',
        head: '.ez-form-select-head',
        body: '.ez-form-select-body',
        dir: 3, //1上 2右 3下 4左
        data: [],
        selected: [],
        selected_min: 0,    //最小选择数量, 0为不限
        selected_max: 1,    //最大选择数量, 0为不限
    },
    Select: function (els, _params) {
        var params = $.extend(true, {}, form.defaults, _params);
        $.each(els, function () {
            var select = $(this);
            form.init(select, params);
            form.events(select, params);
        });
    },
    init: function (select, params) {
        var icon = select.find(params.icon);
        var head = select.find(params.head);
        var body = select.find(params.body);
        //selected
        form.renderVal(select, params);
        //value
        new Tree(body, {
            data: params.data,
            selected: params.selected,
            type: params.selected_max === 1 ? 'radio' : 'checkbox',
        });
    },
    renderVal: function (select, params) {
        var head = select.find(params.head);
        head.html('');
        if (params.selected.length === 0) {
            return;
        }
        var label = $('<span>').addClass('ez-form-label');
        var removeBtn = $('<i>').addClass('remixicon-close-circle-fill');
        $.each(params.selected, function (i, item) {
            head.append(label.clone().html(item.key + ' ').append(removeBtn.clone(true)));
            head.append(' ');
        });
    },
    events: function (select, params) {
        var icon = select.find(params.icon);
        var head = select.find(params.head);
        var body = select.find(params.body);

        select.on('click', function () {
            form.show(select, params);
        });
        head.on('click', function (e) {
            e.stopPropagation();
            form.toggle(select, params);
        });
        icon.on('click', function (e) {
            e.stopPropagation();
            form.toggle(select, params);
        });
        //任意位置, 关闭
        $(document).on('click', function (e) {
            if (e.target != select[0] && $(e.target).closest(select).length == 0 && body.css('display') != 'none') {
                form.hide(select, params);
            }
        });
    },
    showWhere: function (el, ref) {   //当前元素, 参照物
        var ov = $('body').css('overflow'); //记录body的overflow状态, 后面还原
        $('body').css('overflow', 'hidden');
        var win = $(window).height() > $("body").height() ? $(window).height() : $("body").height();
        var rs = {};
        rs.bottom = win - el.offset().top > el.height();
        // $.log(win - el.offset().top , el.height())
        rs.top = ref.offset().top > el.height();
        // $.log(ref.offset().top , el.height())
        rs.right = ref.offset().left + ref.width() > el.width();    //未校验正确性
        // $.log(ref.offset().left + ref.width() , el.width())
        rs.left = ref.offset().left > el.width();    //未校验正确性
        // $.log(ref.offset().left , el.width())
        $('body').css('overflow', ov);
        return rs;
    },
    show: function (select, params) {
        // var item = select.find(params.item);
        var height = select.height();
        var body = select.find(params.body);
        if (body.css('display') != 'none') {
            return;
        }
        body.show();
        var dir = form.showWhere(body, select);
        //向上显示
        if ((params.dir === 1 && dir.top === true) || (dir.bottom === false && dir.top === true)) {
            body.css('bottom', height);
        } else {
            body.css('top', height);
        }
    },
    hide: function (select, params) {
        select.find(params.body).css({
            top: '',
            bottom: ''
        }).hide();
    },
    toggle: function (select, params) {
        var body = select.find(params.body);
        if (body.css('display') === 'none') {
            form.show.apply(this, arguments);
        } else {
            form.hide.apply(this, arguments);
        }
    },


};

$.fn.extend({
    ez_form_select: function (params) {
        new form.Select(this, params);
        return this;
    }
});

module.exports = {
    select: form.Select
};
