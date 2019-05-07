var menu = function (params) {
    var s = this;
    var defaults_params = {
        data: [],
    };
    s.params = $.extend(true, {}, defaults_params, params);
    
    var data = s.params.data;
    var item_tpl = '<li><a href="{url}" data-ctrl="{ctrl}" data-action="{action}">{name}</a></li>';
    var menu_tpl = $('<ul>').addClass('ez sidebar-menu');
    
    //渲染菜单项
    var render_item = function () {
        var items = [];
        $.each(data, function (i, item) {
            var tpl = item_tpl;
            tpl = tpl.replace(/{url}/, item.url || '');
            tpl = tpl.replace(/{ctrl}/, item.ctrl || '');
            tpl = tpl.replace(/{action}/, item.action || '');
            tpl = tpl.replace(/{name}/, item.name || '');
            items.push(tpl);
        });
        return items.join('');
    };
    
    //渲染菜单
    s.render_menu = function () {
        var item = render_item();
        return menu_tpl.append(item);
    };
    
    //打开标签
    s.open = function () {
        
    };
    
};

module.exports = menu;