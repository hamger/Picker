/**
 * Created by Hanger on 2017/8/31.
 */
(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
        (global.SpacePicker = factory());
}(this, (function() {
    /*
    Function : 以 id 获取 DOM
    */
    function $id(id) {
        return document.getElementById(id);
    }
    /*
    Function : DOM 移除自身
    */
    function $removeSelf(dom) {
        dom.parentNode.removeChild(dom);
    }
    /*
    Function : 创建选择器构造函数
    */
    function SpacePicker(config) {
        this.inputId = config.inputId; // 目标DOM元素ID，必填
        this.data = config.data; // json 数据，必填
        this.success = config.success; // 回调函数，必填
        this.style = config.style; // 选择器样式, 选填
        this.initTab(); // 初始化标签
        this.initUI(); // 初始化UI
        this.initEvent(); // 初始化事件
    }
    /*
    Function : 定义初始化标签函数
    */
    SpacePicker.prototype.initTab = function() {
        this.input = $id(this.inputId); // 目标元素
        this.wrapId = this.inputId + '-wrap'; // 选择器外包裹元素ID
        this.relatedArr = []; // 存放每列地址的关联数组
        this.spaceIndex = []; // 存放每列地址的索引
        this.liNum = []; // 每个ul有多少个可选li
        this.ulCount = 0; // 当前展示的列数
        this.renderCount = 0; // 将要渲染的列数
        this.liHeight = 40; // 每个li的高度
        this.spaceUl = []; // 每个ul元素
        this.curDis = []; // 每个ul当前偏离的距离
        this.curPos = []; // 记录 touchstart 时每个ul的竖向距离
        this.startY = 0; // touchstart的位置
        this.startTime = 0; // touchstart的时间
        this.endY = 0; // touchend的位置 
        this.endTime = 0; // touchend的时间 
        this.moveY = 0; // touchmove的位置
        this.container = this.wrapId + '-container'; // 选择器容器ID
        this.cancel = this.wrapId + '-cancel'; // 选择器取消按钮ID
        this.sure = this.wrapId + '-sure'; // 选择器确定按钮ID
        this.content = this.wrapId + '-content'; // 选择器内容容器ID
    };
    /*
    Function : 定义初始化 UI 函数
    */
    SpacePicker.prototype.initUI = function() {
        // 创建选择器的外包裹元素
        this.methods().createContainer();
        // 初始化最高层的参数，最高层的关联数组在未来的操作中都无需更新
        this.relatedArr[0] = this.data;
        this.liNum[0] = this.relatedArr[0].length;
        this.spaceIndex[0] = 0;
        // 得到各列的关联数组
        this.methods().getRelatedArr(this.relatedArr[0][0], 0);
        // 初始化子数据参数，子数据的关联数组会随着选中父数据的改变而变化
        this.methods().updateChildData(0);
        // 初始化选择器内容
        this.methods().renderContent();
    };
    /*
    Function : 定义初始化事件函数
    */
    SpacePicker.prototype.initEvent = function() {
        var that = this;
        var wrap = that.wrap;
        var container = $id(that.container);

        // 点击目标DOM元素显示选择器
        $id(that.inputId).addEventListener('touchstart', function() {
            that.methods().show(wrap, container);
        })

        // 点击保存按钮隐藏选择器并输出结果
        $id(that.sure).addEventListener('touchstart', function() {
            that.success(that.methods().getResult());
            that.methods().hide(wrap, container);
        })

        // 点击取消隐藏选择器
        $id(that.cancel).addEventListener('touchstart', function() {
            that.methods().hide(wrap, container);
        })

        // 点击背景隐藏选择器
        wrap.addEventListener('touchstart', function(e) {
            if (e.target.id == that.wrapId) {
                that.methods().hide(wrap, container);
            }
        })
    };
    /*
    Function : 定义初始化方法函数
    */
    SpacePicker.prototype.methods = function() {
        var that = this;
        return {
            /*
            Function : 创建选择器外包裹元素
            */
            createContainer: function() {
                var div = document.createElement("div");
                div.id = that.wrapId;
                document.body.appendChild(div);
                that.wrap = $id(that.wrapId);
                that.wrap.classList.add('hg-picker-bg');
            },
            /*
            Function : 获取当前列后的关联数组
            Explain  : @obj 当前选中数据的子数据
                @i 当前操作列索引
            */
            getRelatedArr: function(obj, i) {
                if ('child' in obj && obj.child.length > 0) {
                    that.relatedArr[i + 1] = obj.child
                    that.renderCount++
                        that.methods().getRelatedArr(obj.child[0], ++i)
                }
            },
            /*
            Function : 更新 ulCount 和子数据的参数
            Explain  : @i 当前操作列索引
                当前操作列的关联数组不需要更新，只需更新其子数据中的关联数组
                ulCount, liNum， spaceIndex, curDis
            */
            updateChildData: function(i) {
                that.ulCount = i + 1 + that.renderCount;
                for (var j = i + 1; j < that.ulCount; j++) {
                    that.liNum[j] = that.relatedArr[j].length;
                    that.spaceIndex[j] = 0;
                    that.curDis[j] = 0;
                };
            },
            /*
            Function : 获取每列关联数据的 value 值
            Return   : Array
            Explain  : @arr 需要被取值的对象数组
            */
            getValue: function(arr) {
                var tempArr = [];
                for (var i = 0; i < arr.length; i++) {
                    tempArr.push(arr[i].value);
                }
                return tempArr;
            },
            /*
            Function : 渲染时间选择器的内容
            */
            renderContent: function() {
                if (that.style && that.style.btnLocation === 'bottom') {
                    var html = '<div  class="hg-picker-container" id="' + that.container + '">' +
                        '<div class="hg-picker-content" id="' + that.content + '">' +
                        '<div class="hg-picker-up-shadow"></div>' +
                        '<div class="hg-picker-down-shadow"></div>' +
                        '<div class="hg-picker-line"></div>' +
                        '</div>' +
                        '<div class="hg-picker-btn-box">' +
                        '<div class="hg-picker-btn" id="' + that.cancel + '">返回</div>' +
                        '<div class="hg-picker-btn" id="' + that.sure + '">确定</div>' +
                        '</div>' +
                        '</div>';
                } else {
                    var html = '<div  class="hg-picker-container" id="' + that.container + '">' +
                        '<div class="hg-picker-btn-box">' +
                        '<div class="hg-picker-btn" id="' + that.cancel + '">返回</div>' +
                        '<div class="hg-picker-btn" id="' + that.sure + '">确定</div>' +
                        '</div>' +
                        '<div class="hg-picker-content" id="' + that.content + '">' +
                        '<div class="hg-picker-up-shadow"></div>' +
                        '<div class="hg-picker-down-shadow"></div>' +
                        '<div class="hg-picker-line"></div>' +
                        '</div>' +
                        '</div>';
                }
                that.wrap.innerHTML = html;
                for (var i = 0; i < that.ulCount; i++) {
                    that.methods().renderUl(i);
                    that.spaceIndex[i] = 0;
                    that.curDis[i] = 0 * that.liHeight;
                    that.methods().bindRoll(i);
                }
                that.methods().setStyle();
                that.methods().setUlWidth();
            },
            /*
            Function : 设置选择器样式
            */
            setStyle: function() {
                if (that.style) {
                    var obj = that.style
                    var container = $id(that.container);
                    if (obj.width) {
                        container.style.width = obj.width;
                        container.style.marginLeft = ((100 - parseFloat(obj.width.replace("%", ""))) / 2).toFixed(2) + '%';
                    }
                    if (obj.bottom) {
                        container.style.bottom = obj.bottom;
                    }
                    if (obj.radius) {
                        container.style.borderRadius = obj.radius;
                    }
                }
            },
            /*
            Function : 渲染 ul 元素
            */
            renderUl: function(i) {
                var parentNode = $id(that.content);
                var newUl = document.createElement('ul');
                newUl.setAttribute('id', that.wrapId + '-ul-' + i);
                parentNode.insertBefore(newUl, parentNode.children[parentNode.children.length - 3]);
                that.spaceUl[i] = $id(that.wrapId + '-ul-' + i);
                that.methods().renderLi(i);
            },
            /*
            Function : 渲染 li 元素
            */
            renderLi: function(i) {
                that.spaceUl[i].innerHTML = ''
                var lis = '<li></li><li></li>'
                that.methods().getValue(that.relatedArr[i]).forEach(function(val, index) {
                    lis += '<li>' + val + '</li>'
                })
                lis += '<li></li><li></li>'
                that.spaceUl[i].innerHTML = lis
            },
            /*
            Function : 设置 ul 元素宽度
            */
            setUlWidth: function() {
                for (var i = 0; i < that.ulCount; i++) {
                    that.spaceUl[i].style.width = (100 / that.ulCount).toFixed(2) + '%';
                }
            },
            /*
            Function : 绑定滑动事件
            */
            bindRoll: function(i) {
                that.spaceUl[i].addEventListener('touchstart', function() {
                    that.methods().touch(i);
                }, false);
                that.spaceUl[i].addEventListener('touchmove', function() {
                    that.methods().touch(i);
                }, false);
                that.spaceUl[i].addEventListener('touchend', function() {
                    that.methods().touch(i);
                }, true);
            },
            /*
            Function : 滚动改变位置
            */
            roll: function(i, time) {
                if (that.curDis[i] >= 0) {
                    that.spaceUl[i].style.transform = 'translate3d(0,-' + that.curDis[i] + 'px, 0)';
                    that.spaceUl[i].style.webkitTransform = 'translate3d(0,-' + that.curDis[i] + 'px, 0)';
                } else {
                    that.spaceUl[i].style.transform = 'translate3d(0,' + Math.abs(that.curDis[i]) + 'px, 0)';
                    that.spaceUl[i].style.webkitTransform = 'translate3d(0,' + Math.abs(that.curDis[i]) + 'px, 0)';
                }
                if (time) {
                    that.spaceUl[i].style.transition = 'transform ' + time + 's ease-out';
                    that.spaceUl[i].style.webkitTransition = '-webkit-transform ' + time + 's ease-out';
                }
            },
            /*
            Function : 时间选择器触摸事件
            */
            touch: function(i) {
                var event = event || window.event;
                event.preventDefault();
                switch (event.type) {
                    case "touchstart":
                        that.startY = event.touches[0].clientY;
                        that.startTime = new Date()
                        that.curPos[i] = that.curDis[i]; // 记录当前位置
                        break;
                    case "touchend":
                        that.endTime = new Date()
                        if (that.endTime - that.startTime < 150) { // 点击跳入下一项
                            that.curDis[i] = that.curPos[i] + that.liHeight;
                        }
                        that.methods().fixate(i);
                        break;
                    case "touchmove":
                        event.preventDefault();
                        that.moveY = event.touches[0].clientY;
                        that.curDis[i] = that.startY - that.moveY + that.curPos[i];
                        if (that.curDis[i] <= -1.5 * that.liHeight) {
                            that.curDis[i] = -1.5 * that.liHeight
                        }
                        if (that.curDis[i] >= (that.liNum[i] - 1 + 1.5) * that.liHeight) {
                            that.curDis[i] = (that.liNum[i] - 1 + 1.5) * that.liHeight
                        }
                        that.methods().roll(i);
                        break;
                }
            },
            /*
            Function : 固定 ul 最终的位置、更新视图
            */
            fixate: function(i) {
                that.renderCount = 0;
                that.methods().getPosition(i);
                that.methods().getRelatedArr(that.relatedArr[i][that.spaceIndex[i]], i);
                that.methods().updateChildData(i);
                that.methods().updateView(i);
                for (var j = i; j < that.ulCount; j++) {
                    that.methods().roll(j, 0.2);
                };
            },
            /*
            Function : 获取定位数据
            */
            getPosition: function(i) {
                var index = 0;
                var liRow = Math.round((that.curDis[i] / that.liHeight).toFixed(2))
                if (liRow > that.liNum[i] - 1) { // 越下界置底
                    that.curDis[i] = that.liHeight * (that.liNum[i] - 1)
                    index = that.liNum[i] - 1
                } else if (liRow < 0) { // 越上界置顶
                    that.curDis[i] = 0
                    index = 0
                } else { // 中间归整
                    that.curDis[i] = that.liHeight * liRow
                    index = liRow
                }
                that.spaceIndex[i] = index
                that.curDis[i] = that.spaceIndex[i] * that.liHeight
            },
            /*
            Function : 更新内容区视图
            */
            updateView: function(i) {
                var curUlCount = $id(that.content).children.length - 3
                if (that.ulCount == curUlCount) { // 列数不变的情况
                    for (var j = i + 1; j < that.ulCount; j++) {
                        that.methods().renderLi(j)
                    };
                } else if (that.ulCount > curUlCount) { // 列数增加的情况
                    for (var j = i + 1; j < curUlCount; j++) {
                        that.methods().renderLi(j)
                    }
                    for (var j = curUlCount; j < that.ulCount; j++) {
                        that.methods().renderUl(j)
                        that.methods().bindRoll(j)
                    };
                    that.methods().setUlWidth()
                } else { // 列数减少的情况
                    for (var j = i + 1; j < that.ulCount; j++) {
                        that.methods().renderLi(j)
                    }
                    for (var j = that.ulCount; j < curUlCount; j++) {
                        $removeSelf(that.spaceUl[j])
                    };
                    that.methods().setUlWidth()
                }
            },
            /*
            Function : 获取结果的数组
            */
            getResult: function() {
                var arr = []
                for (var i = 0; i < that.ulCount; i++) {
                    arr.push(that.methods().getValue(that.relatedArr[i])[that.spaceIndex[i]])
                }
                return arr
            },
            /*
            Function : 显示选择器
            */
            show: function(wrap, container) {
                wrap.classList.add('hg-picker-bg-show');
                container.style.display = 'block';
            },
            /*
            Function : 隐藏选择器
            */
            hide: function(wrap, container) {
                wrap.classList.remove('hg-picker-bg-show');
                container.style.display = 'none';
            }
        }
    }

    return SpacePicker;
})))