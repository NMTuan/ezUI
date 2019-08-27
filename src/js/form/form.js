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
        selected: {},   //选中数据  {value: {key: value}, }
        selected_min: 0,    //最小选择数量, 0为不限
        selected_max: 1,    //最大选择数量, 0为不限
    },
    Select: function (els, _params) {
        var s = this;
        var params = $.extend(true, {}, form.defaults, _params);
        $.each(els, function () {
            var el = $(this);
            form.init.call(s, el, params);
            form.events.call(s, el, params);
        });
        // $.log(s);
    },
    init: function (el, params) {
        var s = this;
        var body = el.find(params.body);
        this.tree = new Tree(body, {
            data: params.data,
            selected: params.selected,
            type: params.selected_max === 1 ? 'radio' : 'checkbox',
            selectChange: function(input, tree_el){
                $.log('change');
                var selected = this.params.selected;
                params.selected = selected;
                form.renderVal.call(s, el, params);
            }
        });
    },
    renderVal: function (el, params) {
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
            head.append(label.clone().html(item.key + ' ').append(removeBtn.clone().data('value', item.value)));
            head.append(' ');
            field.append('<option value="' + item.value + '">' + item.key + '</option>')
        });
    },
    events: function (el, params) {
        var s = this;
        var icon = el.find(params.icon);
        var head = el.find(params.head);
        var body = el.find(params.body);

        el.on('click', function () {
            form.toggle(el, params);
        });
        head.on('click', function (e) {
            e.stopPropagation();
            form.toggle(el, params);
        });
        head.on('click', params.removeBtn, function (e) {
            e.stopPropagation();
            s.tree.unSelected($(this).data('value'));
        });
        body.on('click', function (e) {
            e.stopPropagation();
        });
        icon.on('click', function (e) {
            e.stopPropagation();
            form.toggle(el, params);
        });
        //任意位置, 关闭
        $(document).on('click', function (e) {
            if (e.target != el[0] && $(e.target).closest(el).length == 0 && body.css('display') != 'none') {
                form.hide(el, params);
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
    show: function (el, params) {
        // var item = select.find(params.item);
        var height = el.height();
        var body = el.find(params.body);
        if (body.css('display') != 'none') {
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
    hide: function (el, params) {
        el.find(params.body).css({
            top: '',
            bottom: ''
        }).hide();
    },
    toggle: function (el, params) {
        var body = el.find(params.body);
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
