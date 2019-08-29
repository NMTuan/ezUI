var Tree = require('../tree/tree');
var form = {
    defaults: {
        icon: '.ez-form-select-icon',       //下拉的图标按钮
        item: '.ez-form-select-item',       //整个select
        head: '.ez-form-select-head',       //下拉显示框区域
        body: '.ez-form-select-body',       //下拉菜单
        field: '.ez-form-select-field',     //隐藏域
        removeBtn: '.ez-form-label-remove', //移除按钮

        dir: 3, //1上 2右 3下 4左
        data: [],       //数据集
        selected: [],   //选中数据  [{id, title}]
        // selected_min: 0,    //最小选择数量, 0为不限
        selected_max: 1,    //最大选择数量, 0为不限
        bodyHeight: 180, //body高度
    },
    Select: function (els, params) {
        var s = this;
        s.params = $.extend(true, {}, form.defaults, params);
        $.each(els, function () {
            var el = $(this);
            form.init.call(s, el);
            form.events.call(s, el);
        });
    },
    init: function (el) {
        var s = this;
        var params = s.params;
        var body = el.find(params.body);
        body.css('max-height', this.params.bodyHeight);
        // form.renderVal.call(s, el);
        this.tree = new Tree(body, {
            data: params.data,
            selected: params.selected,
            type: params.selected_max === 1 ? 'radio' : 'checkbox',
            dataChange: function () {
                params.selected = this.getSelected();
                form.renderVal.call(s, el);
            }
        });
    },
    renderVal: function (el) {
        var s = this;
        var params = s.params;
        var head = el.find(params.head);
        head.html('');
        var field = el.find(params.field);
        field.html('');
        if ($.isEmptyObject(params.selected)) {
            return;
        }
        var label = $('<span>').addClass('ez-form-label');
        var removeBtn = $('<i>').addClass('remixicon-close-circle-fill').addClass(params.removeBtn.replace('.', ''));
        $.each(params.selected, function (i, item) {
            head.append(label.clone().html(item.title + ' ').append(removeBtn.clone().data('id', item.id)));
            head.append(' ');
            field.append('<option value="' + item.id + '">' + item.title + '</option>')
        });
    },
    events: function (el) {
        var s = this;
        var params = s.params;
        var icon = el.find(params.icon);
        var head = el.find(params.head);
        var body = el.find(params.body);

        el.on('click', function () {
            form.toggle.call(s, el);
        });
        head.on('click', function (e) {
            e.stopPropagation();
            form.toggle.call(s, el);
        });
        head.on('click', params.removeBtn, function (e) {
            e.stopPropagation();
            s.tree.unSelected($(this).data('id'));
        });
        body.on('click', function (e) {
            e.stopPropagation();
        });
        icon.on('click', function (e) {
            e.stopPropagation();
            form.toggle.call(s, el);
        });
        //任意位置, 关闭
        $(document).on('click', function (e) {
            if (e.target != el[0] && $(e.target).closest(el).length == 0 && body.css('display') != 'none') {
                form.hide.call(s, el);
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
    show: function (el) {
        var s = this;
        var params = s.params;
        var height = el.height();
        var body = el.find(params.body);
        if (body.css('display') !== 'none') {
            return;
        }
        body.show();
        var dir = form.showWhere(body, el);
        //向上显示
        if ((params.dir === 1 && dir.top === true) || (dir.bottom === false && dir.top === true)) {
            body.css('bottom', height);
        } else {
            body.css('top', height);
        }
    },
    hide: function (el) {
        el.find(this.params.body).css({
            top: '',
            bottom: ''
        }).hide();
    },
    toggle: function (el) {
        var body = el.find(this.params.body);
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
