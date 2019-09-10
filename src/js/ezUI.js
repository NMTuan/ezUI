$.extend({
    ezConfig: {
        debug: true
    }
});

global.ez = {};
ez.scrollWheel = require('./scrollWheel/scrollWheel');
ez.log = require('./log/log');  //打印
ez.renderHeight = require('./renderHeight/renderHeight');   //自动计算容器高度
ez.fixedContainer = require('./fixedContainer/fixedContainer'); //若有左右侧边，修正边距
ez.tabs = require('./tabs/tabs');   //tabs切换
ez.subNav = require('./subNav/subNav'); //二级菜单收缩
ez.iframeTabs = require('./iframeTabs/iframeTabs'); //多标签框架
ez.headlines = require('./headlines/headlines');    //头条

ez.imageView = require('./imageView/imageView');    //图片查看
ez.audioPlayer = require('./audioPlayer/audioPlay');    //音频播放
ez.menuTree = require('./menuTree/menuTree');   //树状菜单
ez.role = require('./role/role');   //权限的布局结构
ez.msg = require('./msg/msg');  //消息
ez.select = require('./form/select');   //表单, 下拉菜单
ez.player = require('./form/player');   //表单, 播放器
ez.form = require('./form/upload');     //表单, 上传
ez.tree = require('./tree/tree');   //树结构
ez.watermark = require('./watermark/watermark');    //水印

ez.tableList = require('./table/list');
