var imageView = {
    defaults: {
        keyboard: false,
        modalWidth: 640,
        modalHeight: 480,
    },
    imageView: function (data, params) {
        if(data.length === 0){
            return;
        }
        imageView.params = $.extend({}, imageView.defaults, params);
        new top.PhotoViewer(data, imageView.params);
    }
};

module.exports = imageView.imageView;
