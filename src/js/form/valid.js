var valid = {
    defaults: {

    },
    valid: function (els, params) {
        $.each(els, function () {
            new valid.Valid(this, params);
        });
    },
    Valid: function (el, params) {
        var s = this;
        s.params = $.extend(true, {}, valid.defaults, params);

    },
};

$.extend({
    valid: {

    }
});

$.fn.extend({
    ez_form_valid: function (params) {
        valid.valid($(this), params);
        return this;
    }
});

module.exports = new valid.valid;

