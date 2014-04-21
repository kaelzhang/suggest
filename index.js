'use strict';

/**
 * @module  suggest
 * @author  Jiayi.Xu, Kael
 * @description 表单提示的基础控件，处理获取数据并显示提示等最简单的事情。具体业务需求尤其发展出来。
 */

// Todo: 
//  1.由于打算支持各种事件，打算还是改写成Class -- done
//  2.把preselect时的内容填写到input上的逻辑抽离出来，或写成简单的配置 -- done，抽离出来
//  3.考虑如何在ul内容render的时候添加额外的东西 

// 不负责定位，由具体的业务组建，只负责ul的显示隐藏，鼠标键盘事件， 


// Change log:
// - 2012-2-10: 修改take方法，value参数与上次相同则不重新生成html
// - 2012-4-24: 移除reset方法，preselect及select方法增加支持传index作为参数，由input自己阻止冒泡

// - 2013-07-18  Kael: 
//      - remove `isCommand` method
//      - refractor all functionalities, no more deal with business requirements
//      - migrate to cortex 2.0
//      - migrate to class 2.0, use attributes to santitize the logic about options

var Class = require('class');
var $ = require('jquery');
    
var WIN = window;
var DOC = WIN.document;

module.exports = suggest;

function suggest(input, options) {
    return new Suggest(input, options);  
};

var Suggest = suggest.Suggest = Class({

    Implements: 'attrs events',
    initialize: function (input, options) {
        this.input = input = $(input);

        var self = this;

        // maintain sequence
        ['panel', 'itemWrapper'].forEach(function(key) {
            self.set(key, options[key]);
            delete options[key];
        });

        // set the rest of options
        this.set(options);

        this.selectedIndex = -1;
        this.hide();

        var item_selector = this.get('itemSelector');
        this.panel
            .appendTo( this.get('container') )
            .on({
                mouseenter: function(e) {
                    self.preselect($(this));
                },

                click: function(e){
                    self.select($(this));
                }

            }, item_selector);

        $(DOC.body).on('click', function(e) {
            self.hide();
        });

        this.input.on({
            click: function(e){
                e.stopPropagation();
            },

            keydown: function(e) {
                self._applyCommand(e);
            }
        });

        /msie/i.test(navigator.userAgent) && this.input.on({
            keypress: function(e) {
                e.keyCode === 13 && self._applyCommand(e);
            }
        });
    },

    /**
     * @param {Number|DOM} li
    */
    preselect: function (li) {
        var active_class = this.get('itemActiveClass');

        if(typeof li === 'number'){
            li = this.items.eq(li);
        }
        
        var data = li.data('data');
        var index = li.data('index');

        this.items.removeClass(active_class);
        li.addClass(active_class);

        this.selectedIndex = index;

        this.emit('preselect', {
            data    : data,
            index   : index,
            keyword : li.data('keyword'),
            element : li
        });
    },


    select: function (li) {
        if(typeof li === 'number'){
            li = this.items.eq(li);
        }

        this.emit('select', {
            data    : li.data('data'),
            index   : li.data('index'),
            keyword : li.data('keyword'),
            element : li
        });
    },


    _applyCommand: function (e) {
        if(!this.visible){
            return false;
        }

        var up;

        switch (e.keyCode) {
            case 37:
            case 39:
                break; // do what should do when press ←  →
            case 38:
                up = true;

            case 40:
                e.preventDefault();

                var index = this.selectedIndex + ( up ? -1 : 1 );

                if( index > -1 && index < this.items.length ){
                    this.preselect( this.items.eq(index) );
                }

                break; //down

            case 13:
                this.select( this.items.eq(this.selectedIndex) );
                break;
        }
    },

    // take an array to parse
    // @param {Array.<data>} arr
    // @param {Object} data, this variable is will be used by `itemRenderer`. by default, `data` may have 
    // - text: {string} 
    // - html: {string} if specified, 
    // - 
    render: function (keyword, arr) {
        var wrapper = this.wrapper;
        var renderer = this.get('itemRenderer');

        if (arr.length) {
            wrapper.empty();

            // create empty item set
            var items = $();

            arr.forEach(function (data, i) {
                data.index = i;
                data.keyword = keyword;

                var item = renderer(data);
                item.appendTo(wrapper).data({
                    index   : i,
                    keyword : keyword,
                    data    : data
                });

                items = items.add(item);
            });

            this.items = items;
            items = null;
        }

        // reset index
        this.selectedIndex = -1;
        this.emit('render');
    },

    show: function () {
        this.panel.css('visibility', 'visible');
        this.visible = true;
        this.emit('show');
    },

    hide: function () {
        this.panel.css('visibility', 'hidden');
        this.visible = false;
        this.emit('close');
    }

}, {

    // suggest panel
    panel: {
        // @param {string|DOMElement|$} v
        setter: function(v) {
            if(v){
                this.panel = $(v).eq(0);

            }else{
                this.panel = $('<ul class="suggest-panel">');
            }
        }
    },

    itemSelector: {
        value: 'li'
    },

    // the wrapper to hold suggest items
    itemWrapper: {
        setter: function(v) {
            var wrapper = this.panel.find(v);

            this.wrapper = wrapper.length ? wrapper.eq(0) : this.panel
        }
    },

    // the factory to generate dom element of items
    // @returns {$|DOMElement}
    itemRenderer: {
        // the default(built-in) renderer
        value: function(data) {
            var li = $('<li>');

            if(data.html){
                li.html(data.html);

            }else if(data.text){
                var keyword = data.keyword;
                var text = data.text;
                if( keyword && ~ text.indexOf(keyword) ){
                    text = text.replace( new RegExp(keyword, 'g'), '<span class="suggest-emphasize">' + keyword + '</span>' );
                }

                li.html(text);
            }

            return li.addClass('suggest-item');
        },

        validator: function(v) {
            return typeof v === 'function';
        }
    },

    itemActiveClass: {
        value: 'suggest-active'
    },

    // container to append panel into
    container: {
        getter: function(v) {
            return v || document.body;
        }
    }
});

