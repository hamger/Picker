/**
 * Created by Hanger on 2017/8/31.
 */
(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
        (global.SpacePicker = factory());
}(this, (function() {
    /**
     * 以 id 获取 DOM
     */
    function $id(id) {
        return document.getElementById(id);
    }
    /**
     * DOM 移除自身
     */
    function $removeSelf(dom) {
        dom.parentNode.removeChild(dom);
    }
    /**
     * 创建选择器构造函数
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

    /**
     * 定义构造函数的原型
     */
    SpacePicker.prototype = {
        // 明确构造器指向
        constructor: SpacePicker,
        /**
         * 定义初始化标签函数
         */
        initTab: function() {
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
        },
        /**
         * 定义初始化 UI 函数
         */
        initUI: function() {
            // 创建选择器的外包裹元素
            this.createContainer();
            // 初始化最高层的参数，最高层的关联数组在未来的操作中都无需更新
            this.relatedArr[0] = this.data;
            this.liNum[0] = this.relatedArr[0].length;
            this.spaceIndex[0] = 0;
            // 得到各列的关联数组
            this.getRelatedArr(this.relatedArr[0][0], 0);
            // 初始化子数据参数，子数据的关联数组会随着选中父数据的改变而变化
            this.updateChildData(0);
            // 初始化选择器内容
            this.renderContent();
        },
        /**
         * 定义初始化事件函数
         */
        initEvent: function() {
            var that = this;
            var wrap = that.wrap;
            var container = $id(that.container);

            // 点击目标DOM元素显示选择器
            $id(that.inputId).addEventListener('touchstart', function() {
                that.show(wrap, container);
            })

            // 点击保存按钮隐藏选择器并输出结果
            $id(that.sure).addEventListener('touchstart', function() {
                that.success(that.getResult());
                that.hide(wrap, container);
            })

            // 点击取消隐藏选择器
            $id(that.cancel).addEventListener('touchstart', function() {
                that.hide(wrap, container);
            })

            // 点击背景隐藏选择器
            wrap.addEventListener('touchstart', function(e) {
                if (e.target.id === that.wrapId) {
                    that.hide(wrap, container);
                }
            })
        },

        /**
         * 创建选择器外包裹元素
         */
        createContainer: function() {
            var div = document.createElement("div");
            div.id = this.wrapId;
            document.body.appendChild(div);
            this.wrap = $id(this.wrapId);
            this.wrap.classList.add('hg-picker-bg');
        },
        /**
        * 获取当前列后的关联数组
        * Explain : @obj 当前选中数据的子数据
            @i 当前操作列索引
        */
        getRelatedArr: function(obj, i) {
            if ('child' in obj && obj.child.length > 0) {
                this.relatedArr[i + 1] = obj.child
                this.renderCount++
                    this.getRelatedArr(obj.child[0], ++i)
            }
        },
        /**
        * 更新 ulCount 和子数据的参数
        * Explain : @i 当前操作列索引
            当前操作列的关联数组不需要更新，只需更新其子数据中的关联数组
            ulCount, liNum， spaceIndex, curDis
        */
        updateChildData: function(i) {
            this.ulCount = i + 1 + this.renderCount;
            for (var j = i + 1; j < this.ulCount; j++) {
                this.liNum[j] = this.relatedArr[j].length;
                this.spaceIndex[j] = 0;
                this.curDis[j] = 0;
            };
        },
        /**
         * 获取每列关联数据的 value 值
         * Return : Array
         * Explain : @arr 需要被取值的对象数组
         */
        getValue: function(arr) {
            var tempArr = [];
            for (var i = 0; i < arr.length; i++) {
                tempArr.push(arr[i].value);
            }
            return tempArr;
        },
        /**
         * 渲染时间选择器的内容
         */
        renderContent: function() {
            if (this.style && this.style.btnLocation === 'bottom') {
                var html = '<div  class="hg-picker-container" id="' + this.container + '">' +
                    '<div class="hg-picker-content" id="' + this.content + '">' +
                    '<div class="hg-picker-up-shadow"></div>' +
                    '<div class="hg-picker-down-shadow"></div>' +
                    '<div class="hg-picker-line"></div>' +
                    '</div>' +
                    '<div class="hg-picker-btn-box">' +
                    '<div class="hg-picker-btn" id="' + this.cancel + '">返回</div>' +
                    '<div class="hg-picker-btn" id="' + this.sure + '">确定</div>' +
                    '</div>' +
                    '</div>';
            } else {
                var html = '<div  class="hg-picker-container" id="' + this.container + '">' +
                    '<div class="hg-picker-btn-box">' +
                    '<div class="hg-picker-btn" id="' + this.cancel + '">返回</div>' +
                    '<div class="hg-picker-btn" id="' + this.sure + '">确定</div>' +
                    '</div>' +
                    '<div class="hg-picker-content" id="' + this.content + '">' +
                    '<div class="hg-picker-up-shadow"></div>' +
                    '<div class="hg-picker-down-shadow"></div>' +
                    '<div class="hg-picker-line"></div>' +
                    '</div>' +
                    '</div>';
            }
            this.wrap.innerHTML = html;
            for (var i = 0; i < this.ulCount; i++) {
                this.renderUl(i);
                this.spaceIndex[i] = 0;
                this.curDis[i] = 0 * this.liHeight;
                this.bindRoll(i);
            }
            this.setStyle();
            this.setUlWidth();
        },
        /**
         * 设置选择器样式
         */
        setStyle: function() {
            if (this.style) {
                var obj = this.style
                var container = $id(this.container);
                if (obj.width && obj.width !== '100%') {
                    container.style.width = obj.width;
                }
                if (!obj.location) {
                    if (obj.bottom) {
                        container.style.bottom = obj.bottom;
                    }
                    if (obj.top) {
                        container.style.top = obj.top;
                    }
                } else {
                    if (obj.location === 'bottom') { container.style.bottom = 0; }
                    if (obj.location === 'top') { container.style.top = 0; }
                    if (obj.location === 'center') {
                        container.style.top = '50%';
                        container.style.transform = "translate(-50%,-50%)";
                    }
                }
                if (obj.radius) {
                    container.style.borderRadius = obj.radius;
                }
            }
        },
        /**
         * 渲染 ul 元素
         */
        renderUl: function(i) {
            var parentNode = $id(this.content);
            var newUl = document.createElement('ul');
            newUl.setAttribute('id', this.wrapId + '-ul-' + i);
            parentNode.insertBefore(newUl, parentNode.children[parentNode.children.length - 3]);
            this.spaceUl[i] = $id(this.wrapId + '-ul-' + i);
            this.renderLi(i);
        },
        /**
         * 渲染 li 元素
         */
        renderLi: function(i) {
            this.spaceUl[i].innerHTML = ''
            var lis = '<li></li><li></li>'
            this.getValue(this.relatedArr[i]).forEach(function(val, index) {
                lis += '<li>' + val + '</li>'
            })
            lis += '<li></li><li></li>'
            this.spaceUl[i].innerHTML = lis
        },
        /**
         * 设置 ul 元素宽度
         */
        setUlWidth: function() {
            for (var i = 0; i < this.ulCount; i++) {
                this.spaceUl[i].style.width = (100 / this.ulCount).toFixed(2) + '%';
            }
        },
        /**
         * 绑定滑动事件
         */
        bindRoll: function(i) {
            var that = this
            that.spaceUl[i].addEventListener('touchstart', function() {
                that.touch(i);
            }, false);
            that.spaceUl[i].addEventListener('touchmove', function() {
                that.touch(i);
            }, false);
            that.spaceUl[i].addEventListener('touchend', function() {
                that.touch(i);
            }, true);
        },
        /**
         * 滚动改变位置
         */
        roll: function(i, time) {
            if (this.curDis[i] >= 0) {
                this.spaceUl[i].style.transform = 'translate3d(0,-' + this.curDis[i] + 'px, 0)';
                this.spaceUl[i].style.webkitTransform = 'translate3d(0,-' + this.curDis[i] + 'px, 0)';
            } else {
                this.spaceUl[i].style.transform = 'translate3d(0,' + Math.abs(this.curDis[i]) + 'px, 0)';
                this.spaceUl[i].style.webkitTransform = 'translate3d(0,' + Math.abs(this.curDis[i]) + 'px, 0)';
            }
            if (time) {
                this.spaceUl[i].style.transition = 'transform ' + time + 's ease-out';
                this.spaceUl[i].style.webkitTransition = '-webkit-transform ' + time + 's ease-out';
            }
        },
        /**
         * 时间选择器触摸事件
         */
        touch: function(i) {
            var event = event || window.event;
            event.preventDefault();
            switch (event.type) {
                case "touchstart":
                    this.startY = event.touches[0].clientY;
                    this.startTime = new Date()
                    this.curPos[i] = this.curDis[i]; // 记录当前位置
                    break;
                case "touchend":
                    this.endTime = new Date()
                    if (this.endTime - this.startTime < 150) { // 点击跳入下一项
                        this.curDis[i] = this.curPos[i] + this.liHeight;
                    }
                    this.fixate(i);
                    break;
                case "touchmove":
                    event.preventDefault();
                    this.moveY = event.touches[0].clientY;
                    this.curDis[i] = this.startY - this.moveY + this.curPos[i];
                    if (this.curDis[i] <= -1.5 * this.liHeight) {
                        this.curDis[i] = -1.5 * this.liHeight
                    }
                    if (this.curDis[i] >= (this.liNum[i] - 1 + 1.5) * this.liHeight) {
                        this.curDis[i] = (this.liNum[i] - 1 + 1.5) * this.liHeight
                    }
                    this.roll(i);
                    break;
            }
        },
        /**
         * 固定 ul 最终的位置、更新视图
         */
        fixate: function(i) {
            this.renderCount = 0;
            this.getPosition(i);
            this.getRelatedArr(this.relatedArr[i][this.spaceIndex[i]], i);
            this.updateChildData(i);
            this.updateView(i);
            for (var j = i; j < this.ulCount; j++) {
                this.roll(j, 0.2);
            };
        },
        /**
         * 获取定位数据
         */
        getPosition: function(i) {
            var index = 0;
            var liRow = Math.round((this.curDis[i] / this.liHeight).toFixed(2))
            if (liRow > this.liNum[i] - 1) { // 越下界置底
                this.curDis[i] = this.liHeight * (this.liNum[i] - 1)
                index = this.liNum[i] - 1
            } else if (liRow < 0) { // 越上界置顶
                this.curDis[i] = 0
                index = 0
            } else { // 中间归整
                this.curDis[i] = this.liHeight * liRow
                index = liRow
            }
            this.spaceIndex[i] = index
            this.curDis[i] = this.spaceIndex[i] * this.liHeight
        },
        /**
         * 更新内容区视图
         */
        updateView: function(i) {
            var curUlCount = $id(this.content).children.length - 3
            if (this.ulCount == curUlCount) { // 列数不变的情况
                for (var j = i + 1; j < this.ulCount; j++) {
                    this.renderLi(j)
                };
            } else if (this.ulCount > curUlCount) { // 列数增加的情况
                for (var j = i + 1; j < curUlCount; j++) {
                    this.renderLi(j)
                }
                for (var j = curUlCount; j < this.ulCount; j++) {
                    this.renderUl(j)
                    this.bindRoll(j)
                };
                this.setUlWidth()
            } else { // 列数减少的情况
                for (var j = i + 1; j < this.ulCount; j++) {
                    this.renderLi(j)
                }
                for (var j = this.ulCount; j < curUlCount; j++) {
                    $removeSelf(this.spaceUl[j])
                };
                this.setUlWidth()
            }
        },
        /**
         * 获取结果的数组
         */
        getResult: function() {
            var arr = []
            for (var i = 0; i < this.ulCount; i++) {
                arr.push(this.getValue(this.relatedArr[i])[this.spaceIndex[i]])
            }
            return arr
        },
        /**
         * 显示选择器
         */
        show: function(wrap, container) {
            wrap.classList.add('hg-picker-bg-show');
            container.style.display = 'block';
        },
        /**
         * 隐藏选择器
         */
        hide: function(wrap, container) {
            wrap.classList.remove('hg-picker-bg-show');
            container.style.display = 'none';
        }
    }

    return SpacePicker;
})))