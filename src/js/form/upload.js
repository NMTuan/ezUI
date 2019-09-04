var upload = {
    defaults: {
        title: '上传文件',
        type: 'image',  //image | audio | wav | mp3, 可以取el的data-type
        area: ['460px', 'auto'],    //弹窗大小
        url: '',    //上传地址, 可以取el的data-src
        multiple: false,    //是否多选,可以取el的data-multiple
        accept: null,   //文件类型的限制
        uploadTitle: '点击选择文件',    //上传窗内的标题, 可取el的data-upload-title
        uploadTips: '',     //上传窗内的提示, 可取el的data-upload-tips
        data: {},   //额外参数
        field: 'upload', //上传的name值
        callback: function () {

        },
    },
    msgId: '',  //整体提示信息id
    loadId: '', //整体loading的id
    layerId: '',//整体上传窗的id
    upload: function (els, params) {
        $.each(els, function () {
            if (params.url || $(this).data('src')) {
                new upload.Upload(this, params);
            }
        });
    },
    Upload: function (el, params) {
        var s = this;
        s.el = $(el);
        s.params = $.extend(true, {}, upload.defaults, params);

        //若el上有data属性, 则取data, 否则按默认的来.
        s.params.url = s.el.data('src') || s.params.url;
        s.params.type = s.el.data('type') || s.params.type;
        s.params.multiple = s.el.data('multiple') || s.params.multiple;
        s.params.uploadTitle =  s.el.data('upload-title') || s.params.uploadTitle;
        s.params.uploadTips =  s.el.data('upload-tips') || s.params.uploadTips;
        s.params.type = s.el.data('type') || s.params.type;

        //格式限定
        if(s.params.type === 'image'){
            s.params.accept = {
                title: 'Images',
                extensions: 'jpg,jpeg,png',
                mimeTypes: 'image/*'
            };
        }
        if(s.params.type === 'audio'){
            s.params.accept = {
                title: 'Audio',
                extensions: 'wav,mp3',
                mimeTypes: 'audio/wav,audio/mp3'
            };
        }
        if(s.params.type === 'wav'){
            s.params.accept = {
                title: 'Audio',
                extensions: 'wav',
                mimeTypes: 'audio/wav'
            };
        }
        if(s.params.type === 'mp3'){
            s.params.accept = {
                title: 'Audio',
                extensions: 'mp3',
                mimeTypes: 'audio/mp3'
            };
        }

        upload.events.call(s);
    },
    events: function(){
        var s = this;
        s.el.on('click', function () {
            upload.layerId = layer.open({
                type: 1,
                title: s.params.title,
                area: s.params.area,
                content: upload.layerDom.call(s),
                id: 'ez_form_upload',
                success: function (layerDom, layerIndex) {
                    upload.initWebUploader.call(s);
                }
            })
        });
    },
    layerDom: function () {
        var s = this;
        var title = s.params.uploadTitle;
        var icon = 'remixicon-upload-cloud-line';
        var tips = s.params.uploadTips;

        if (s.params.type === 'image') {
            icon = 'remixicon-landscape-line';
        }
        if ($.inArray(s.params.type, ['audio', 'wav', 'mp3']) >= 0) {
            icon = 'remixicon-music-2-line';
        }

        if(s.params.type ==='image'){
            tips += '仅限后缀名为jpg、jpeg、png的文件。';
        }
        if(s.params.type ==='audio'){
            tips += '仅限后缀名为wav、mp3的文件。';
        }
        if(s.params.type ==='wav'){
            tips += '仅限后缀名为wav的文件。';
        }
        if(s.params.type ==='mp3'){
            tips += '仅限后缀名为mp3的文件。';
        }
        if(s.params.multiple){
            tips += '如有多个文件，可一次选择多个文件。'
        }

        var dom = '' +
            '<div class="ez-form-upload">' +
            '<div class="ez-form-upload-inside">' +
            '<div class="ez-form-upload_file">' +
            '<i class="ez-form-upload-icon {icon} ri-4x"></i>' +
            '<div class="ez-form-upload-title">{title}</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="ez-form-upload-tips">' +
            '<i class="remixicon-information-line ri-fw"></i> ' +
            '{tips}' +
            '</div>' +
            ''
        ;
        dom = dom.replace('{title}', title || '');
        dom = dom.replace('{icon}', icon);
        dom = dom.replace('{tips}', tips);

        return dom;
    },
    initWebUploader: function (layerDom, layerIndex) {
        var s = this;
        var uploader = WebUploader.create({
            server: s.params.url,
            pick: {
                id: '.ez-form-upload',
                multiple: s.params.multiple || false,
            },
            accept: s.params.accept,
            auto: true,
            method: 'get',
            formData: s.params.data,
            fileVal: s.params.field,
        });
        //上传中
        uploader.on('uploadProgress', function () {
            upload.loadId = layer.load();

        });
        //上传成功
        uploader.on('uploadSuccess', function (files, res) {
            if (typeof s.params.callback == 'function') {
                s.params.callback.call(s, res, files);
            }
        });
        uploader.on('uploadFinished', function () {
            layer.close(upload.loadId);
            layer.close(upload.layerId);
        });
        //上传出错
        uploader.on('uploadError', function () {
            layer.close(upload.loadId);
            layer.close(upload.layerId);
            upload.msgId = layer.msg('服务器异常，请稍后再试！');
        });
        uploader.on('error', function (type) {
            layer.close(upload.loadId);
            layer.close(upload.layerId);
            if(type === 'Q_TYPE_DENIED'){
                upload.msgId = layer.msg('文件类型不正确, 请确认后重试!');
            }
        });
    },
};
$.fn.extend({
    ez_form_upload: function (params) {
        upload.upload(this, params);
        return this;
    }
});
module.exports = upload.upload;

