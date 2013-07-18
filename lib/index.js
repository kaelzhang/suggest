/**
 * @module  suggest
 * @author  Jiayi.Xu
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

var Class = require('class');
var $ = require('jquery');
    
var WIN = window;
var DOC = WIN.document;

module.exports = suggest;

function suggest(input, options) {
    return new Suggest(input, options);  
};


/*

这段内容放到外面的组件里去，suggest本身不处理select range的事情

function selectRange(target, start, end) {
target = target.el(0);
if (D.UA.ie) {
var range = target.createTextRange();
range.collapse(true);
range.moveEnd('character', end);
range.moveStart('character', start);
range.select();
} else {
target.focus();
target.setSelectionRange(start, end);
}
return target;
}
*/

var Suggest = Class({

    Implements: 'attrs events',
    initialize: function (input, options) {
        var self = this;

        self.set(options);

        var ul = self.ul = $.create('ul').addClass(o.className).inject($(o.parent));

        self.selectedIndex = null;
        self.input = $(input);

        self.cache = {};
        self.value = null;
        self.visible = false;

        self.close();

        Live.on(ul, 'mouseenter', 'li', function (e) {
            self.preselect($(this));
        });

        Live.on(ul, 'click', 'li', function (e) {
            self.select($(this));
        });

        D.bind('command', self);
        $(DOC.body).on('click', function(e) {
            self.close();
        });
        self.input.on('click',function(e){
            e.stop();
        });
        self.input.on('keydown', self.command);
        self.input.on('keypress',function(e){
            if(e.code == 13 && D.UA.ie == 6){
                self.command(e);
            }
        });
    },

    // up, down , left , right ,enter
    isCommand: function (e) {
        return ~ [37, 38, 39, 40, 13].indexOf(e.code);
    },

    /**
     * @param arg1 {Number|DOM}
    */
    preselect: function (arg1) {
    
        var self = this,li,liel,idx,
            input = self.input,
            o = self.get(STR_OPTIONS),
            activeClass = o.activeClass,
            lis = self.ul.children('li');
            
            
        if (D.isNumber(arg1)) {
            li = this.ul.children('li').get(arg1);
            idx = arg1;
            if(!li.count()){return;}        
        } else if (arg1 instanceof $) {
            li = arg1;
            liel = li.el(0);
            lis.forEach(function(e,i){
                if(liel == e){
                    idx = i;
                }
            });
        } else {                
            throw 'arg[0] parsed to preselect must be a number of an instance of DOM';
        }
        
        self.fire('preselect', {
            value: li.data('key'),
            raw : li.data('raw')
        });

        /* do the same work in the preselect event
        if (key) {
        input.val(key);
        selectRange(input, key.toLowerCase().indexOf(self.value) == -1 ? 0 : self.value.length, input.val().length);
        } 
        */

        lis.removeClass(activeClass);
        li.addClass(activeClass);
        self.selectedIndex  = idx;
    },


    select: function (li) {
        var self = this,
        input = self.input,
        val = input.val();
        //self.onSelection.call(self, li.data('key'));
        self.fire('selection', {
            value: li.data('key'),
            raw:li.data('raw')
        });

        // selectRange(input, val.length, val.length); // do the work in the selection event
        self.close();
    },


    command: function (e) {
        var self = this,
            currentList = self.cache[self.value],
            selectedIndex = self.selectedIndex,
            lis,
            lastIndex;
        if (currentList && self.visible) {
            lis = self.ul.children('li');
            lastIndex = currentList.length - 1;
        
            switch (e.code) {
                case 37:
                case 39:
                    break; // do what should do when press ←  →
                case 38:
                case 40:
                    if (self.visible) {
                        e.prevent();
                        var up = (e.code == 38);

                        if (up) {
                            self.selectedIndex = selectedIndex = (selectedIndex === null) ? lastIndex : (selectedIndex === 0) ? 0 : selectedIndex - 1;
                        } else {
                            self.selectedIndex = selectedIndex = (selectedIndex === null) ? 0 : (selectedIndex === lastIndex) ? lastIndex : selectedIndex + 1;
                        }
                        self.preselect(lis.get(selectedIndex));

                    }
                    break; //down
                case 13:
                    self.select(lis.get(selectedIndex));
                    break;
            }
        }
    },


    // take an array to parse
    take: function (v, arr, nocache) {
        var self = this,
            ul = self.ul,
            o = self.get(STR_OPTIONS),
            render = o.render,
            val = v.trim();
    
        // if the old value,just show it
        if (self.value === val && !nocache) {
            //console.log(self.value, val);
        } else { // new value
            if (!nocache) {
                self.value = val;
                self.cache[val] = arr;
            }
            if (!arr.length) { // no data , then close it
                self.close();
            } else { // or has data, render it 
                ul.empty();
                arr.forEach(function (item) {
                    var tmpdiv = $.create('div'),
                    rendered = render(item, val),
                    html = rendered.html,
                    text = rendered.text,
                    li;

                    tmpdiv.html(html);
                    li = tmpdiv.child();
                    li.data('key', text);
                    li.data('raw', item);
                    li.inject(ul);
                });
            }
        }

        self.fire('take');
        /* delegate events, moved to init */

        // $('body').on('click', closeHandler);     
    },


    show: function () {
        var self = this;
        self.ul.css('visibility', 'visible');
        self.visible = true;
        self.fire('show');
    },


    close: function () {
        var self = this;
        self.ul.css('visibility', 'hidden');
        self.visible = false;
        self.fire('close');
    }

}, {
    className: '',
    activeClass: 'active',
    parent: 'body'

});


suggest.Suggest = Suggest;