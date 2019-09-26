var addForm = {
    defaults: {
        url: '',
        title: '添加',
        area: ['780px', '480px'],
        btn: ['确定', '取消'],
        multiple: true,  //多选
        template: '{title}', //item中展示的内容
        cursor: 'pointer', //item鼠标样式 ez-cursor-x
        data: {},   //弹窗的参数
    },
    addForm: function (els, params) {
        $.each(els, function () {
            new addForm.AddForm($(this), params);
        });
    },
    AddForm: function (el, params) {
        var s = this;
        s.el = el;
        addForm.initParams.call(s, params);
        if (!s.params.url) {
            return;
        }
        addForm.initData.call(s);
        addForm.events.call(s);
    },
    //初始化参数
    initParams: function (params) {
        var s = this;
        s.params = $.extend(true, {}, addForm.defaults, params);
        //有data的用data属性做参数
        $.each(s.el.data(), function (i, item) {
            s.params[i] = item;
        });
    },
    events: function () {
        var s = this;
        //点击添加
        s.el.on('click', function () {
            addForm.popForm.call(s);
        });
        //点击编辑
        s.el.parent().on('click', '.ez-form-label', function () {
            var datas = $(this).data();
            addForm.popForm.call(s, datas);
        });
        //点击删除
        s.el.parent().on('click', '.ez-form-label-remove', function (e) {
            e.stopPropagation();
            var _id = $(this).data('_id');
            layer.confirm('确定要移除么?', function (index) {
                addForm.removeData.call(s, _id);
                layer.close(index);
            });
        });
    },
    //获取弹窗表单中的数据
    getFormData: function (index) {
        var form = top.layer.getChildFrame('form', index);
        var formData = form.serializeArray();
        var data = {};
        $.each(formData, function (i, item) {
            data[item.name] = item.value;
        });
        return data;
    },
    //初始化数据
    initData: function () {
        var s = this;
        s.data = [];
        var data = {};
        var max = 0;
        s.el.closest('.ez-form-content').find('input').each(function (i, item) {
            var key = $(item).attr('name');
            var val = $.trim($(item).val());
            if (val === '') {   //保证空字符串不被split, 提前退出.
                return;
            }
            data[key] = val.split(',');
            var len = data[key].length;
            if (len > max) {
                max = len;
            }
        });
        for (var i = 0; i < max; i++) {
            var d = {};
            $.each(data, function (key, value) {
                d[key] = value[i];
            });
            s.data.push(d);
        }
        addForm.renderItem.call(s);
    },
    //添加数据
    addData: function (data) {
        var s = this;
        if (!s.params.multiple) {
            s.data = [];
        }
        if(data._id){
            s.data.splice(data._id, 1, data);
        } else {
            s.data.push(data);
        }
        addForm.renderItem.call(s);
    },
    removeData: function (id) {
        var s = this;
        if (typeof id === 'undefined') {
            return;
        }
        s.data.splice(id, 1);
        addForm.renderItem.call(s);
    },
    //渲染
    renderItem: function () {
        var s = this;
        var control = s.el.parent().find('.ez-form-control');
        var data = $.extend(true, {}, s.data);
        var inputValues = {};
        var label = $('<span>').addClass('ez-form-label');
        var remove = $('<i>').addClass('ez-form-label-remove remixicon-close-fill').attr('title', '删除');

        control.empty();
        s.el.closest('.ez-form-content').find('input').val('');
        if (s.data.length === 0) {
            return;
        }
        $.each(data, function (i, item) {
            var tpl = s.params.template;
            var _label = label.clone();
            var _remove = remove.clone();
            item._id = i;
            if(s.params.cursor){
                _label.addClass('ez-cursor-' + s.params.cursor);
            }
            $.each(item, function (key, value) {
                _label.data(key, value);
                if (!inputValues[key]) {
                    inputValues[key] = [];
                }
                inputValues[key].push(value);
                if (tpl.indexOf('{' + key + '}') >= 0) {
                    tpl = tpl.replace('{' + key + '}', value);
                }
            });
            _remove.data('_id', i);

            _label.html(tpl);
            _label.append(_remove);
            control.append(_label);
            control.append(' ');
        });
        //给input赋值
        $.each(inputValues, function (key, value) {
            s.el.parent().find('input[name="' + key + '"]').val(value.join(','));
        });
    },
    //弹窗表单
    popForm: function (datas) {
        var s = this;

        datas = datas || {};
        $.each(s.params.data, function (key, value) {
            datas[key] = value;
        });
        var dataStr = $.map(datas, function (value, key) {
            return key + '=' + value;
        }).join('&');

        var url = dataStr ? s.params.url + '?' + dataStr : s.params.url;

        top.layer.open({
            type: 2,
            title: s.params.title,
            content: url,
            area: s.params.area,
            btn: s.params.btn,
            yes: function (index) {
                var formData = addForm.getFormData(index);
                addForm.addData.call(s, formData);
                top.layer.close(index);
            }
        });
    }
};
$.fn.extend({
    ez_form_add_form: function (params) {
        addForm.addForm($(this), params);
        return this;
    }
});
module.exports = addForm.addForm;
