/**
 * Created by Hanger on 2017/7/18.
 */
(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
        (global.DatePicker = factory());
}(this, (function() {
    // 以id获取dom元素
    function $id(id) {
        return document.getElementById(id);
    }

    // 移除子元素
    function $removeChild(dom) {
        var children = dom.children;
        for (var i = 0, len = children.length; i < len; i++) {
            dom.removeChild(children[0])
        }
    }

    // 创建构造函数
    function DatePicker(config) {
        this.inputId = config.inputId; // 目标 input 元素，必填
        this.type = config.type || 'date'; // 选择器类型，选填
        this.begin_year = config.begin_year || new Date().getFullYear() - 10; // 起始年份，选填
        this.end_year = config.end_year || new Date().getFullYear() + 10; // 结束年份，选填
        this.style = config.style; // 选择器样式, 选填
        this.hasSuffix = config.hasSuffix || 'yes'; // 是否添加时间单位，选填
        this.hasZero = config.hasZero || 'yes'; // 一位数是否显示两位，选填
        this.success = config.success; // 回调函数，必填
        this.initTab(); // 初始化标签a
        this.initUI(); // 初始化UI
        this.initEvent(); // 初始化事件
    }

    // 定义初始化标签
    DatePicker.prototype.initTab = function() {
        // 当前的时间
        this.recent_time = [
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            new Date().getDate(),
            new Date().getHours(),
            new Date().getMinutes()
        ];
        this.yearArr = []; // 贮存年份的数组
        for (var i = this.begin_year; i <= this.end_year; i++) {
            this.yearArr.push(i)
        }
        this.monthArr = []; // 贮存月份的数组
        for (var i = 1; i <= 12; i++) {
            this.monthArr.push(i)
        }
        this.dayNumArr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // 贮存每月天数的数组
        this.dayArr = []; // 贮存日期的数组
        this.preDay = 0; // 前一次操作的日期
        this.hourArr = []; // 贮存小时的数组
        for (var i = 0; i <= 23; i++) {
            this.hourArr.push(i)
        }
        this.minuteArr = []; // 贮存分钟的数组
        for (var i = 0; i <= 59; i++) {
            this.minuteArr.push(i)
        }
        this.dateTime = []; // 储存各项时间的数组
        this.suffix = ['年', '月', '日', '时', '分'] // 储存各项时间后缀的数组
        if (this.hasSuffix == 'no') {
            this.suffix = ['', '', '', '', '']
        }
        this.input = $id(this.inputId); // 目标元素
        this.wrapId = this.inputId + '-wrap'; // 选择器外包裹元素ID
        this.ulCount = 3; // 展示的列数
        this.liHeight = 40; // 每个li的高度
        this.dateUl = []; // 每个ul元素
        this.liNum = [this.end_year - this.begin_year + 1, 12, 30, 24, 60]; // 每个ul有多少个可选li
        this.curDis = []; // 每个ul当前偏离的距离
        this.curPos = []; // touchstart时每个ul偏离的距离
        this.startY = 0; // touchstart的位置
        this.startTime = 0; // touchstart的时间
        this.endY = 0; // touchend的位置 
        this.endTime = 0; // touchend的时间 
        this.moveY = 0; // touchmove的位置
        this.resultArr = this.recent_time; // 储存输入结果
        this.container = this.wrapId + '-container'; // 选择器容器ID
        this.cancel = this.wrapId + '-cancel'; // 选择器取消按钮ID
        this.sure = this.wrapId + '-sure'; // 选择器确定按钮ID
    };

    // 定义初始化UI
    DatePicker.prototype.initUI = function() {
        this.methods().createContainer();
        this.methods().judgeType();
        this.methods().renderpicker();
        this.methods().initLocation();
    };

    // 定义初始化事件
    DatePicker.prototype.initEvent = function() {
        var that = this;
        var wrap = that.wrap;
        var container = $id(that.container);

        // 点击目标元素显示选择器
        $id(that.inputId).addEventListener('touchstart', function() {
            that.methods().show(wrap, container)
        })

        // 点击保存按钮隐藏选择器并输出结果
        $id(that.sure).addEventListener('touchstart', function() {
            that.success(that.methods().result(that.resultArr));
            that.methods().hide(wrap, container)
        })

        // 点击取消隐藏选择器
        $id(that.cancel).addEventListener('touchstart', function() {
            that.methods().hide(wrap, container)
        })

        // 点击背景隐藏选择器
        wrap.addEventListener('touchstart', function(e) {
            if (e.target.id == that.wrapId) {
                that.methods().hide(wrap, container)
            }
        })

        // 为每个 ul 元素绑定 touch 事件
        that.dateUl.forEach(function(val, index) {
            if (val) {
                val.addEventListener('touchstart', function() {
                    that.methods().touch(index);
                }, false);
                val.addEventListener('touchmove', function() {
                    that.methods().touch(index);
                }, false);
                val.addEventListener('touchend', function() {
                    that.methods().touch(index);
                }, true);
            }
        });
    };

    // 定义初始化方法
    DatePicker.prototype.methods = function() {
        var that = this
        return {
            // 创建选择器外包裹元素
            createContainer: function() {
                var div = document.createElement("div");
                div.id = that.wrapId;
                // 放在 body 中最后的位置
                document.body.appendChild(div);
                // 每一目标元素对应一个唯一的选择器外包裹元素
                that.wrap = $id(that.wrapId);
                that.wrap.classList.add('hg-picker-bg');
            },
            // 根据类型决定 ul 个数和储存的时间项
            judgeType: function() {
                var dayArr = that.methods().calcDays(that.recent_time[0], that.recent_time[1] - 1);
                switch (that.type) {
                    case 'date':
                        that.ulCount = 3;
                        that.dateTime = [that.yearArr, that.monthArr, dayArr, undefined, undefined];
                        break;
                    case 'time':
                        that.ulCount = 2;
                        that.dateTime = [undefined, undefined, undefined, that.hourArr, that.minuteArr];
                        break;
                    case 'dateTime':
                        that.ulCount = 5;
                        that.dateTime = [that.yearArr, that.monthArr, dayArr, that.hourArr, that.minuteArr];
                        break;
                    default:
                        throw Error('Please set a right type of hg-picker.');
                }
            },
            // 渲染时间选择器内容
            renderpicker: function() {
                var len = that.dateTime.length;
                if (that.style && that.style.btnLocation === 'bottom') {
                    var html = '<div  class="hg-picker-container" id="' + that.container + '">' +
                        '<div class="hg-picker-content">';
                    for (var i = 0; i < len; i++) {
                        if (that.dateTime[i]) {
                            html += that.methods().renderList(i)
                        }
                    }
                    html += '<div class="hg-picker-up-shadow"></div>' +
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
                        '<div class="hg-picker-content">';
                    for (var i = 0; i < len; i++) {
                        if (that.dateTime[i]) {
                            html += that.methods().renderList(i)
                        }
                    }
                    html += '<div class="hg-picker-up-shadow"></div>' +
                        '<div class="hg-picker-down-shadow"></div>' +
                        '<div class="hg-picker-line"></div>' +
                        '</div>' +
                        '</div>';
                }
                that.wrap.innerHTML = html;
                for (var i = 0; i < len; i++) {
                    if (that.dateTime[i]) {
                        that.dateUl[i] = $id(that.wrapId + '-ul-' + i);
                        that.dateUl[i].style.width = (100 / that.ulCount).toFixed(2) + '%';
                    }
                }
                that.methods().setStyle();
            },
            /*
            Function : 设置选择器样式
            */
            setStyle: function() {
                if (that.style) {
                    var obj = that.style;
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
            // 渲染 li 列表
            renderList: function(i) {
                var list = '<ul id="' + that.wrapId + '-ul-' + i + '"><li></li><li></li>';
                that.dateTime[i].forEach(function(val, index) {
                    if (that.hasZero == 'yes') {
                        val = that.methods().addZero(val);
                    }
                    list += '<li>' + val + that.suffix[i] + '</li>';
                });
                list += '<li></li><li></li></ul>';
                return list;
            },
            // 初始化当前时间的位置
            initLocation: function() {
                that.dateTime.forEach(function(val, index) {
                    if (val) {
                        if (index == 0) {
                            that.curDis[index] = (that.recent_time[index] - that.begin_year) * that.liHeight
                        } else if (index == 1 || index == 2) {
                            that.curDis[index] = (that.recent_time[index] - 1) * that.liHeight
                        } else {
                            that.curDis[index] = (that.recent_time[index] - 0) * that.liHeight
                        }
                        that.methods().roll(index)
                    }
                })
            },
            // 改变时间的位置 
            roll: function(i, time) {
                if (that.curDis[i] >= 0) {
                    that.dateUl[i].style.transform = 'translate3d(0,-' + that.curDis[i] + 'px, 0)';
                    that.dateUl[i].style.webkitTransform = 'translate3d(0,-' + that.curDis[i] + 'px, 0)';
                } else {
                    that.dateUl[i].style.transform = 'translate3d(0,' + Math.abs(that.curDis[i]) + 'px, 0)';
                    that.dateUl[i].style.webkitTransform = 'translate3d(0,' + Math.abs(that.curDis[i]) + 'px, 0)';
                }
                if (time) {
                    that.dateUl[i].style.transition = 'transform ' + time + 's ease-out';
                    that.dateUl[i].style.webkitTransition = '-webkit-transform ' + time + 's ease-out';
                }
            },
            // 时间选择器触摸事件
            touch: function(i) {
                var event = event || window.event;
                event.preventDefault();
                switch (event.type) {
                    case "touchstart":
                        that.startY = event.touches[0].clientY;
                        that.startTime = new Date();
                        that.curPos[i] = that.curDis[i];
                        break;
                    case "touchend":
                        that.endTime = new Date();
                        if (that.endTime - that.startTime < 150) { // 点击跳入下一项
                            that.curDis[i] = that.curPos[i] + that.liHeight;
                        }
                        that.methods().fixate(i);
                        that.methods().roll(i, 0.2);
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
            // 确定 ul 最终的位置并取得结果
            fixate: function(i) {
                var index = 0;
                var liRow = Math.round((that.curDis[i] / that.liHeight).toFixed(2))
                if (liRow > that.liNum[i] - 1) {
                    that.curDis[i] = that.liHeight * (that.liNum[i] - 1)
                    index = that.liNum[i] - 1
                } else if (liRow < 0) {
                    that.curDis[i] = 0
                    index = 0
                } else {
                    that.curDis[i] = that.liHeight * liRow
                    index = liRow
                }
                that.preDay = that.resultArr[2]
                switch (i) {
                    case 0:
                        that.resultArr[i] = that.yearArr[index];
                        that.methods().changedDay();
                        break;
                    case 1:
                        that.resultArr[i] = index + 1;
                        that.methods().changedDay();
                        break;
                    case 2:
                        that.resultArr[i] = index + 1;
                        break;
                    case 3:
                        that.resultArr[i] = index;
                        break;
                    case 4:
                        that.resultArr[i] = index;
                        break;
                }
            },
            // 根据当前年月改变日期列表
            changedDay: function() {
                if (that.methods().calcDays(that.resultArr[0], that.resultArr[1] - 1).length != that.resultArr[2].length) {
                    that.methods().renderDays(that.methods().calcDays(that.resultArr[0], that.resultArr[1] - 1))
                    // 如果前一次操作的日期不在当前的日期列表中(比如31号不在小月，30号不在2月)，进行置底
                    if (!(that.preDay in that.dayArr)) {
                        that.curDis[2] = that.liHeight * (that.liNum[2] - 1)
                        that.methods().roll(2)
                        that.methods().fixate(2)
                    }
                }
            },
            // 改变列表 li 个数并返回日期的数组
            calcDays: function(year, month) {
                that.dayArr = []
                if (that.methods().isLeapYear(year)) {
                    that.dayNumArr[1] = 29
                } else {
                    that.dayNumArr[1] = 28
                }
                for (var i = 1; i <= that.dayNumArr[month]; i++) {
                    that.dayArr.push(i)
                }
                that.liNum[2] = that.dayNumArr[month]
                return that.dayArr
            },
            // 判断是否是闰年
            isLeapYear: function(year) {
                var cond1 = year % 4 == 0;
                var cond2 = year % 100 != 0;
                var cond3 = year % 400 == 0;
                var cond = cond1 && cond2 || cond3;
                if (cond) {
                    return true;
                } else {
                    return false;
                }
            },
            // 渲染日期的列表                                                                                                                          
            renderDays: function(arr) {
                // $removeChild(that.dateUl[2])
                that.dateUl[2].innerHTML = ''
                var list = '<li></li><li></li>';
                arr.forEach(function(val, index) {
                    if (that.hasZero == 'yes') {
                        val = that.methods().addZero(val)
                    }
                    list += '<li>' + val + that.suffix[2] + '</li>'
                });
                list += '<li></li><li></li>'
                that.dateUl[2].innerHTML = list
            },
            // 根据 type 类型返回结果 
            result: function(arr) {
                var arr2 = []
                switch (that.type) {
                    case 'date':
                        for (var i = 0; i < 3; i++) {
                            arr2.push(arr[i])
                        }
                        break;
                    case 'time':
                        for (var i = 3; i < 5; i++) {
                            arr2.push(arr[i])
                        }
                        break;
                    case 'dateTime':
                        for (var i = 0; i < 5; i++) {
                            arr2.push(arr[i])
                        }
                        break;
                }
                return arr2
            },
            // 一位数显示为两位
            addZero: function(num) {
                if (num < 10) {
                    num = '0' + num
                }
                return num
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

    return DatePicker;
})))