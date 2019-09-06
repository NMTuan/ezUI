var Tree = require('../tree/tree');
var select = {
    defaults: {
        icon: '.ez-form-select-icon',       //下拉的图标按钮
        item: '.ez-form-select-item',       //整个select
        head: '.ez-form-select-head',       //下拉显示框区域
        body: '.ez-form-select-body',       //下拉区域
        search: '.ez-form-select-search',   //搜索
        list: '.ez-form-select-list',       //下拉列表
        field: '.ez-form-select-field',     //隐藏域
        removeBtn: '.ez-form-label-remove', //移除按钮
        placeholder: '请选择',
        dir: 3, //1上 2右 3下 4左
        data: [],       //数据集
        dataUrl: '',    //异步加载
        selected: [],   //选中数据  [{id, title}]
        // selected_min: 0,    //最小选择数量, 0为不限
        selected_max: 1,    //最大选择数量, 0为不限
        listHeight: 220, //body高度
        searchKeys: [], //需要搜索的key
        searchTime: 300, //延时搜索
        searchUrl: '',  //异步搜索
        change: function () {
        },
        choose: function () {
        }
    },
    Select: function (els, params) {
        var s = this;
        s.el = els.first();
        s.params = $.extend(true, {}, select.defaults, params);
        s.setData = function (data) {
            select.setData.call(s, data);
        };
        select.renderTree.call(s);
        select.init.call(s);
        select.events.call(s);
    },
    init: function () {
        var s = this;
        var el = s.el;
        var params = s.params;
        var list = el.find(params.list);
        list.css('max-height', this.params.listHeight);
        if (params.searchKeys.length > 0 || params.searchUrl) {
            select.renderSearch.call(s, el);
        }
    },
    renderTree: function () {
        var s = this;
        var params = s.params;
        if (this.tree) {
            return;
        }
        s.tree = new Tree(s.el.find(params.list), {
            data: params.data,
            dataUrl: params.dataUrl,
            selected: params.selected,
            type: params.selected_max === 1 ? 'radio' : 'checkbox',
            searchKeys: params.searchKeys,
            searchUrl: params.searchUrl,
            dataChange: function () {
                params.selected = this.getSelected();
                select.renderVal.call(s);
                params.change.call(s);
            },
            choose: function () {
                if (params.selected_max === 1) {
                    select.hide.call(s);
                }
                params.choose.apply(s, arguments);
            }
        });
    },
    renderVal: function () {
        var s = this;
        var el = s.el;
        var params = s.params;
        var head = el.find(params.head);
        head.html('');
        var field = el.find(params.field);
        field.html('');
        if ($.isEmptyObject(params.selected)) {
            head.append(s.params.placeholder);
            return;
        }
        var label = $('<span>').addClass('ez-form-label');
        var removeBtn = $('<i>').addClass('remixicon-close-fill').addClass(params.removeBtn.replace('.', ''));
        $.each(params.selected, function (i, item) {
            head.append(label.clone().html(item.title + ' ').append(removeBtn.clone().data('id', item.id)));
            head.append(' ');
            field.append('<option value="' + item.id + '" selected="selected">' + item.title + '</option>')
        });
    },
    renderSearch: function () {
        var s = this;
        var el = s.el;
        var search = $('<div>').addClass(s.params.search.replace('.', ''));
        var ipt = $('<input>').attr({
            type: 'text',
            placeholder: '搜索...',
        }).addClass('ez-form-control ez-form-control-sm');
        var body = el.find(this.params.body);
        var timer; //定时器
        body.prepend(search.append(ipt));

        ipt.on('keyup', function () {
            var that = $(this);
            timer = setTimeout(function () {
                clearTimeout(timer);
                var value = $.trim(that.val());
                select.search.call(s, value);
            }, s.params.searchTime);
        });
    },
    events: function () {
        var s = this;
        var el = s.el;
        var params = s.params;
        var icon = el.find(params.icon);
        var head = el.find(params.head);
        var body = el.find(params.body);

        el.on('click', function () {
            select.show.call(s, el);
        });
        head.on('click', function (e) {
            // e.stopPropagation();
            select.show.call(s, el);
        });
        head.on('click', params.removeBtn, function (e) {
            e.stopPropagation();
            s.tree.unSelected($(this).data('id'));
        });
        body.on('click', function (e) {
            e.stopPropagation();
        });
        icon.on('click', function (e) {
            // e.stopPropagation();
            select.toggle.call(s, el);
        });
        //任意位置, 关闭
        $(document).on('click', function (e) {
            if (e.target !== el[0] && $(e.target).closest(el).length === 0 && body.css('display') !== 'none') {
                select.hide.call(s, el);
            }
        });
    },
    search: function (val) {
        this.tree.search(val);
    },
    showWhere: function (el, ref) {   //当前元素, 参照物
        var body = $('body');
        var ov = body.css('overflow'); //记录body的overflow状态, 后面还原, 防止出现滚动条导致元素变动.
        body.css('overflow', 'hidden');
        var win = $(window).height() > body.height() ? $(window).height() : body.height();
        var rs = {};
        rs.bottom = win - el.offset().top > el.height();
        // $.log(win - el.offset().top , el.height())
        rs.top = ref.offset().top > el.height();
        // $.log(ref.offset().top , el.height())
        rs.right = ref.offset().left + ref.width() > el.width();    //未校验正确性
        // $.log(ref.offset().left + ref.width() , el.width())
        rs.left = ref.offset().left > el.width();    //未校验正确性
        // $.log(ref.offset().left , el.width())
        body.css('overflow', ov);
        return rs;
    },
    show: function () {
        var s = this;
        var el = s.el;
        var params = s.params;
        var height = el.height();
        var body = el.find(params.body);
        if (body.css('display') !== 'none') {
            return;
        }
        body.show();
        var dir = select.showWhere(body, el);
        //向上显示
        if ((params.dir === 1 && dir.top === true) || (dir.bottom === false && dir.top === true)) {
            body.css('bottom', height);
        } else {
            body.css('top', height);
        }
        //如果有搜索, 默认聚焦
        if (params.searchKeys.length > 0 || params.searchUrl) {
            el.find(params.search).find('input').focus();
        }
    },
    hide: function () {
        this.el.find(this.params.body).css({
            top: '',
            bottom: ''
        }).hide();
    },
    toggle: function () {
        var body = this.el.find(this.params.body);
        if (body.css('display') === 'none') {
            select.show.apply(this, arguments);
        } else {
            select.hide.apply(this, arguments);
        }
    },
    setData: function (data) {
        var s = this;
        var el = s.el;
        var params = s.params;
        //设置待选项
        s.tree.setData(data);
        //清空搜索
        el.find(params.search).find('input').val('').trigger('keyup');
        //清除选中数据
        $.each(params.selected, function () {
            // var selected = this;
            // var existence = false;  //本数据是否已经存在
            // $.each(data, function (i, item) {
            //     if(item.id === selected.id){
            //         existence = true;
            //         return false;
            //     }
            // });
            // if(!existence){
                s.tree.unSelected(this.id);
            // }
        })
    },

};

$.fn.extend({
    ez_form_select: function (params) {
        new select.Select(this, params);
        return this;
    }
});

module.exports = select.Select;
