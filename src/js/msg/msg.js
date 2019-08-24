var msg = {
    el: function () {
        return $('#msgTips');
    },
    set: function (len, obj) {
        len = len || 0;
        obj = obj || msg.el();
        obj.html(len);
        if(len == 0){
            obj.closest('a').removeClass('active');
        } else {
            obj.closest('a').addClass('active');
        }
    },
    get: function (obj) {
        obj = obj || msg.el();
        return parseInt($.trim(obj.text()));
    },
    minus: function (len, obj) {
        len = len || 1;
        var rs = msg.get(obj) - len;
        if(rs < 0){
            rs = 0;
        }
        msg.set(rs);
    }
};

module.exports = msg;
