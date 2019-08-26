var random = require('../random/random');
var tree = {
    defaults: {
        ul: 'ez-tree-ul',
        li: 'ez-tree-li',
        item: 'ez-tree-item',
        name: '',
        type: '',   //radio, checkbox
    },
    Tree: function (els, _params) {
        var params = $.extend(true, {}, tree.defaults, {name: 'tree' + random(100)}, _params);
        $.each(els, function () {
            var el = $(this);
            tree.init(el, params);
        });
    },
    ul: function (params) {
        return $('<ul>').addClass(params.ul);
    },
    li: function (params, data) {
        var li = $('<li>').addClass(params.li);
        var item = $('<div>').addClass(params.item);
        if(params.type === 'radio'){
            var html = '<label><input type="radio" name="'+ params.name +'" /> '+ data.key +'</label>'
            item.prepend(html);
        } else {
            item.html(data.key);
        }
        li.append(item);
        return li;
    },
    init: function (el, params) {
        var html = tree.render(el, params);
        window.html = html;
        el.html(html);
    },
    render: function (el, params) {
        var dom = tree.ul(params);
        var _render = function (data, html) {
            $.each(data, function (i, item) {
                var li = tree.li(params, item);
                html.append(li);
                if(item.child && item.child.length > 0){
                    var ul = tree.ul(params);
                    li.append(ul);
                    _render(item.child, ul);
                }
            });
        };
        _render(params.data, dom);
        return dom;
    },
};

$.fn.extend({
    ez_tree: function (params) {
        new tree.Tree(this, params);
        return this;
    },
});

module.exports = tree.Tree;
