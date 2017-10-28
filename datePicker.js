/**
 * Created by Hanger on 2017/7/18.
 */
(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
        (global.DatePicker = factory());
}(this, (function() {
    /**
     * 以 id 获取 DOM
     */
    function $id(id) {
        return document.getElementById(id);
    }

    /**
     * 获取从 start 到 end 的数组
     * Return : Array
     */
    function getArr(start, end) {
        var arr = []
        for (var i = start; i <= end; i++) {
            arr.push(i)
        }
        return arr
    }

    /**
     * 创建构造函数
     */
    function DatePicker(config) {
        this.inputId = config.inputId; // 目标 input 元素，必填
        this.type = config.type || 'date'; // 选择器类型，选填
        this.title = config.title || ''; // 选择器标题，选填
        this.sureText = config.sureText || '确定'; // 确定按钮文本，选填
        this.cancelText = config.cancelText || '取消'; // 取消按钮文本，选填
        // 初始化开始、结束、初始显示时间, 选填
        if (this.type === 'time') {
            if (config.start) {
                if (config.start.length < 2) throw Error('配置项 start 不完整');
                this.start = [undefined, undefined, undefined, config.start[0], config.start[1]];
            } else {
                this.start = [undefined, undefined, undefined, 0, 0];
            }
            if (config.end) {
                if (config.end.length < 2) throw Error('配置项 end 不完整');
                this.end = [undefined, undefined, undefined, config.end[0], config.end[1]];
            } else {
                this.end = [undefined, undefined, undefined, 23, 59];
            }
            if (config.firstTime) {
              if (config.firstTime.length < 2) throw Error('配置项 firstTime 不完整');
                this.firstTime = [undefined, undefined, undefined, config.firstTime[0], config.firstTime[1]];
            } else {
                this.firstTime = [undefined, undefined, undefined, new Date().getHours(), new Date().getMinutes()];
            }
        } else {
            this.start = config.start || [
                new Date().getFullYear() - 4,
                new Date().getMonth() + 1,
                new Date().getDate(),
                new Date().getHours(),
                new Date().getMinutes()
            ];
            this.end = config.end || [
                new Date().getFullYear() + 4,
                new Date().getMonth() + 1,
                new Date().getDate(),
                new Date().getHours(),
                new Date().getMinutes()
            ];
            this.firstTime = config.firstTime || [
                new Date().getFullYear(),
                new Date().getMonth() + 1,
                new Date().getDate(),
                new Date().getHours(),
                new Date().getMinutes()
            ];
        }
        this.style = config.style; // 选择器样式, 选填
        this.hasSuffix = config.hasSuffix || 'yes'; // 是否添加时间单位，选填
        this.hasZero = config.hasZero || 'yes'; // 一位数是否显示两位，选填
        this.success = config.success; // 成功的回调函数，必填
        this.cancel = config.cancel || null; // 取消按钮回调函数，选填
        this.check(); // 检查配置项是否合法
        this.initTab(); // 初始化标签
        this.initUI(); // 初始化UI
        this.initEvent(); // 初始化事件
    }

    /**
     * 定义构造函数的原型
     */
    DatePicker.prototype = {
        // 明确构造器指向
        constructor: DatePicker,
        // 检查配置项是否合法
        check: function() {
            function isNumberArr(arr) {
                if (arr instanceof Array) {
                    return arr.every(function(val) {
                        return (typeof(val) === "number" || typeof(val) === "undefined");
                    });
                } else {
                    return false;
                }
            }
            if (!this.inputId) throw Error('配置项 inputId 不能为空.');
            if (!this.success) throw Error('配置项 success 不能为空.');
            if (this.hasSuffix !== 'yes' && this.hasSuffix !== 'no') throw Error('配置项 hasSuffix 不合法.');
            if (this.hasZero !== 'yes' && this.hasZero !== 'no') throw Error('配置项 hasZero 不合法.');
            if (this.type !== 'time' && this.type !== 'dateTime' && this.type !== 'date') throw Error('配置项 type 不合法.');
            if (!isNumberArr(this.start)) throw Error('配置项 start 不合法');
            if (!isNumberArr(this.end)) throw Error('配置项 end 不合法');
            if (!isNumberArr(this.firstTime)) throw Error('配置项 firstTime 不合法');
            switch (this.type) {
                case 'date':
                    if(this.start.length < 3) throw Error('配置项 start 不完整');
                    if(this.end.length < 3) throw Error('配置项 end 不完整');
                    if(this.firstTime.length < 3) throw Error('配置项 firstTime 不完整');
                    var start = new Date(this.start[0] + '/' + this.start[1] + '/' + this.start[2]).getTime()
                    var end = new Date(this.end[0] + '/' + this.end[1] + '/' + this.end[2]).getTime()
                    var first = new Date(this.firstTime[0] + '/' + this.firstTime[1] + '/' + this.firstTime[2]).getTime()
                    if (start > end) throw Error('开始时间不能大于结束时间.');
                    if (first > end) { this.firstTime = this.end };
                    if (first < start) { this.firstTime = this.start };
                    break;
                case 'time':
                    function tf(i) {
                        return (i < 10 ? '0' : '') + i
                    };
                    var startStr = this.start[3] + tf(this.start[4]);
                    var start = parseInt(startStr);
                    var endStr = this.end[3] + tf(this.end[4]);
                    var end = parseInt(endStr);
                    var firstStr = this.firstTime[3] + tf(this.firstTime[4]);
                    var first = parseInt(firstStr);
                    if (start > end) throw Error('开始时间不能大于结束时间.');
                    if (first > end) { this.firstTime = this.end };
                    if (first < start) { this.firstTime = this.start };
                    break;
                case 'dateTime':
                    if(this.start.length < 5) throw Error('配置项 start 不完整');
                    if(this.end.length < 5) throw Error('配置项 end 不完整');
                    if(this.firstTime.length < 5) throw Error('配置项 firstTime 不完整');
                    var start = new Date(this.start[0] + '/' + this.start[1] + '/' + this.start[2] +
                        ' ' + this.start[3] + ':' + this.start[4]).getTime();
                    var end = new Date(this.end[0] + '/' + this.end[1] + '/' + this.end[2] +
                        ' ' + this.end[3] + ':' + this.end[4]).getTime();
                    var first = new Date(this.firstTime[0] + '/' + this.firstTime[1] + '/' + this.firstTime[2] +
                        ' ' + this.firstTime[3] + ':' + this.firstTime[4]).getTime();
                    if (start > end) throw Error('开始时间不能大于结束时间.');
                    if (first > end) { this.firstTime = this.end };
                    if (first < start) { this.firstTime = this.start };
                    break;
            }
        },
        /**
         * 定义初始化标签函数
         */
        initTab: function() {
            this.previousTime = []; // 储存前一次操作的时间
            this.yearArr = []; // 储存年份的数组
            this.monthArr = []; // 储存月份的数组
            this.dayArr = []; // 储存日期的数组
            this.dayNumArr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // 储存每月天数的数组
            this.hourArr = []; // 储存小时的数组
            this.minuteArr = []; // 储存分钟的数组
            this.dateArr = []; // 储存各项时间的数组
            this.dateIndex = []; // 储存当前各项时间索引的数组
            this.suffix = this.hasSuffix === 'yes' ? ['年', '月', '日', '时', '分'] : ['', '', '', '', '']; // 储存各项时间后缀的数组
            this.input = $id(this.inputId); // 目标元素
            this.wrapId = this.inputId + '-wrap'; // 选择器外包裹元素ID
            this.ulCount = 0; // 展示的列数
            this.liHeight = 40; // 每个li的高度
            this.dateUl = []; // 每个ul元素
            this.liNum = []; // 每个ul中有多少个可选li
            this.curDis = []; // 每个ul当前偏离的距离
            this.curPos = []; // touchstart时每个ul偏离的距离
            this.startY = 0; // touchstart的位置
            this.startTime = 0; // touchstart的时间
            this.endY = 0; // touchend的位置 
            this.endTime = 0; // touchend的时间 
            this.moveY = 0; // touchmove的位置
            this.container = this.wrapId + '-container'; // 选择器容器ID
            this.abolish = this.wrapId + '-abolish'; // 选择器取消按钮ID
            this.sure = this.wrapId + '-sure'; // 选择器确定按钮ID
        },
        /**
         * 定义初始化 UI 函数
         */
        initUI: function() {
            this.previousTime = this.firstTime;
            switch (this.type) {
                case 'date':
                    for (var i = 0; i < 3; i++) {
                        this.calculateArr(i);
                        this.calculateDis(i);
                    }
                    break;
                case 'time':
                    for (var i = 3; i < 5; i++) {
                        this.calculateArr(i);
                        this.calculateDis(i);
                    }
                    break;
                case 'dateTime':
                    for (var i = 0; i < 5; i++) {
                        this.calculateArr(i);
                        this.calculateDis(i);
                    }
                    break;
            }
            this.initDateArr();
            this.initUlCount();
            this.initLiNum();
            this.createContainer();
            this.renderpicker();
            for (var i = 0; i < this.dateArr.length; i++) {
                this.roll(i);
            }
        },
        /**
         * 定义初始化事件函数
         */
        initEvent: function() {
            var that = this;
            var wrap = that.wrap;
            var container = $id(that.container);

            // 点击目标元素显示选择器
            $id(that.inputId).addEventListener('click', function() {
                that.show(wrap, container)
            })

            // 点击保存按钮隐藏选择器并输出结果
            $id(that.sure).addEventListener('click', function() {
                var resuArr = [
                    that.curDate(0),
                    that.curDate(1),
                    that.curDate(2),
                    that.curDate(3),
                    that.curDate(4)
                ]
                that.success(that.result(resuArr));
                that.hide(wrap, container)
            })

            // 点击取消隐藏选择器
            $id(that.abolish).addEventListener('click', function() {
                that.cancel && that.cancel()
                that.hide(wrap, container)
            })

            // 点击背景隐藏选择器
            wrap.addEventListener('click', function(e) {
                if (e.target.id === that.wrapId) {
                    that.hide(wrap, container)
                }
            })

            // 为每个 ul 元素绑定 touch 事件
            that.dateUl.forEach(function(val, index) {
                if (val) {
                    val.addEventListener('touchstart', function() {
                        that.touch(index);
                    }, false);
                    val.addEventListener('touchmove', function() {
                        that.touch(index);
                    }, false);
                    val.addEventListener('touchend', function() {
                        that.touch(index);
                    }, true);
                }
            });
        },
        /**
         * 计算并返回当前项显示的数组
         */
        calculateArr: function(i) {
            switch (i) {
                case 0:
                    this.yearArr = getArr(this.start[0], this.end[0]);
                    break;
                case 1:
                    this.monthArr = []
                    if (this.curDate(i - 1) === this.start[0]) {
                        if (this.start[0] === this.end[0]) {
                            this.monthArr = getArr(this.start[1], this.end[1])
                        } else {
                            this.monthArr = getArr(this.start[1], 12)
                        }
                    } else if (this.curDate(i - 1) === this.end[0]) {
                        if (this.start[0] === this.end[0]) {
                            this.monthArr = getArr(this.start[1], this.end[1])
                        } else {
                            this.monthArr = getArr(1, this.end[1])
                        }
                    } else {
                        this.monthArr = getArr(1, 12)
                    }
                    break;
                case 2:
                    this.dayArr = []
                        // 如果是闰年，2月改为29天
                    if (this.isLeapYear(this.curDate(i - 2))) {
                        this.dayNumArr[1] = 29
                    } else {
                        this.dayNumArr[1] = 28
                    }
                    if (this.curDate(i - 2) === this.start[0] && this.curDate(i - 1) === this.start[1]) {
                        if (this.start[0] === this.end[0] && this.start[1] === this.end[1]) {
                            this.dayArr = getArr(this.start[2], this.end[2])
                        } else {
                            this.dayArr = getArr(this.start[2], this.dayNumArr[this.curDate(i - 1) - 1])
                        }
                    } else if (this.curDate(i - 2) === this.end[0] && this.curDate(i - 1) === this.end[1]) {
                        if (this.start[0] === this.end[0] && this.start[1] === this.end[1]) {
                            this.dayArr = getArr(this.start[2], this.end[2])
                        } else {
                            this.dayArr = getArr(1, this.end[2])
                        }
                    } else {
                        this.dayArr = getArr(1, this.dayNumArr[this.curDate(i - 1) - 1])
                    }
                    break;
                case 3:
                    this.hourArr = getArr(0, 23);
                    break;
                case 4:
                    this.minuteArr = getArr(0, 59);
                    break;
            }
        },
        getCurArr: function(i) {
            var curArr = []
            switch (i) {
                case 0:
                    curArr = this.yearArr;
                    break;
                case 1:
                    curArr = this.monthArr;
                    break;
                case 2:
                    curArr = this.dayArr;
                    break;
                case 3:
                    curArr = this.hourArr;
                    break;
                case 4:
                    curArr = this.minuteArr;
                    break;
            }
            return curArr
        },
        curDate: function(i) {
            var curDate
                // this.dateArr 还没有被赋值的情况
            if (this.dateArr.length === 0) {
                curDate = this.firstTime[i]
            } else {
                if (this.dateArr[i] === undefined) {
                    curDate = undefined
                } else {
                    curDate = this.dateArr[i][this.dateIndex[i]]
                }
            }
            return curDate
        },
        /**
         * 计算并返回当前项所在的位置
         */
        calculateDis: function(i) {
            var curArr = this.getCurArr(i);
            if (this.previousTime[i] > curArr[curArr.length - 1]) {
                this.dateIndex[i] = curArr.length - 1;
            } else if (this.previousTime[i] < curArr[0]) {
                this.dateIndex[i] = 0;
            } else {
                var that = this;
                curArr.some(function(val, index) {
                    if (val === that.previousTime[i]) {
                        that.dateIndex[i] = index;
                        return
                    }
                })
            }
            this.curDis[i] = this.liHeight * this.dateIndex[i]
        },
        /**
         * 根据选择器类型确定 dateArr
         */
        initDateArr: function() {
            switch (this.type) {
                case 'date':
                    this.dateArr = [this.yearArr, this.monthArr, this.dayArr];
                    break;
                case 'time':
                    this.dateArr = [undefined, undefined, undefined, this.hourArr, this.minuteArr];
                    break;
                case 'dateTime':
                    this.dateArr = [this.yearArr, this.monthArr, this.dayArr, this.hourArr, this.minuteArr];
                    break;
                default:
                    throw Error('Please set a right type of hg-picker.');
            }
        },
        /**
         * 判断需要的渲染的 ul 元素个数
         */
        initUlCount: function() {
            for (var i = 0; i < this.dateArr.length; i++) {
                if (this.dateArr[i] !== undefined) {
                    this.ulCount++
                }
            }
        },
        /**
         * 判断每个 ul 中有多少个 li 选项
         */
        initLiNum: function(index) {
            if (index) {
                if (this.dateArr[index] !== undefined) {
                    this.liNum[index] = this.dateArr[index].length
                }
            } else {
                for (var i = 0; i < this.dateArr.length; i++) {
                    if (this.dateArr[i] !== undefined) {
                        this.liNum[i] = this.dateArr[i].length
                    }
                }
            }
        },
        /**
         * 创建选择器外包裹元素
         */
        createContainer: function() {
            var div = document.createElement("div");
            div.id = this.wrapId;
            // 放在 body 中最后的位置
            document.body.appendChild(div);
            // 每一目标元素对应一个唯一的选择器外包裹元素
            this.wrap = $id(this.wrapId);
            this.wrap.classList.add('hg-picker-bg');
        },
        /**
         * 渲染选择器
         */
        renderpicker: function() {
            var len = this.dateArr.length;
            if (this.style && this.style.btnLocation === 'bottom') {
                var html = '<div  class="hg-picker-container" id="' + this.container + '">' +
                    '<div class="hg-picker-content">';
                for (var i = 0; i < len; i++) {
                    if (this.dateArr[i] !== undefined) {
                        html += this.renderUl(i)
                    }
                }
                html += '<div class="hg-picker-up-shadow"></div>' +
                    '<div class="hg-picker-down-shadow"></div>' +
                    '<div class="hg-picker-line"></div>' +
                    '</div>' +
                    '<div class="hg-picker-btn-box">' +
                    this.title +
                    '<div class="hg-picker-btn" id="' + this.abolish + '">' + this.cancelText + '</div>' +
                    '<div class="hg-picker-btn" id="' + this.sure + '">' + this.sureText + '</div>' +
                    '</div>' +
                    '</div>';
            } else {
                var html = '<div  class="hg-picker-container" id="' + this.container + '">' +
                    '<div class="hg-picker-btn-box">' +
                    this.title +
                    '<div class="hg-picker-btn" id="' + this.abolish + '">' + this.cancelText + '</div>' +
                    '<div class="hg-picker-btn" id="' + this.sure + '">' + this.sureText + '</div>' +
                    '</div>' +
                    '<div class="hg-picker-content">';
                for (var i = 0; i < len; i++) {
                    if (this.dateArr[i] !== undefined) {
                        html += this.renderUl(i)
                    }
                }
                html += '<div class="hg-picker-up-shadow"></div>' +
                    '<div class="hg-picker-down-shadow"></div>' +
                    '<div class="hg-picker-line"></div>' +
                    '</div>' +
                    '</div>';
            }

            this.wrap.innerHTML = html;
            for (var i = 0; i < len; i++) {
                if (this.dateArr[i] !== undefined) {
                    this.dateUl[i] = $id(this.wrapId + '-ul-' + i);
                    this.dateUl[i].style.width = (100 / this.ulCount).toFixed(2) + '%';
                    this.renderLi(i);
                }
            }
            this.setStyle();
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
         * Return : String
         */
        renderUl: function(i) {
            var list = '<ul id="' + this.wrapId + '-ul-' + i + '"></ul>';
            return list;
        },
        /**
         * 渲染 li 元素
         */
        renderLi: function(i) {
            var that = this;
            that.dateUl[i].innerHTML = '';
            var lis = '<li></li><li></li>';
            that.dateArr[i].forEach(function(val, index) {
                val = that.addZero(val);
                lis += '<li>' + val + that.suffix[i] + '</li>';
            });
            lis += '<li></li><li></li>'
            that.dateUl[i].innerHTML = lis;
        },
        /**
         * 改变时间的显示位置
         */
        roll: function(i, time) {
            if (this.curDis[i] || this.curDis[i] === 0) {
                if (this.curDis[i] >= 0) {
                    this.dateUl[i].style.transform = 'translate3d(0,-' + this.curDis[i] + 'px, 0)';
                    this.dateUl[i].style.webkitTransform = 'translate3d(0,-' + this.curDis[i] + 'px, 0)';
                } else {
                    this.dateUl[i].style.transform = 'translate3d(0,' + Math.abs(this.curDis[i]) + 'px, 0)';
                    this.dateUl[i].style.webkitTransform = 'translate3d(0,' + Math.abs(this.curDis[i]) + 'px, 0)';
                }
                if (time) {
                    this.dateUl[i].style.transition = 'transform ' + time + 's ease-out';
                    this.dateUl[i].style.webkitTransition = '-webkit-transform ' + time + 's ease-out';
                }
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
                    this.startTime = new Date();
                    this.curPos[i] = this.curDis[i];
                    this.previousTime[i] = this.curDate(i);
                    break;
                case "touchend":
                    this.endTime = new Date();
                    if (this.endTime - this.startTime < 150) { // 点击跳入下一项
                        this.curDis[i] = this.curPos[i] + this.liHeight;
                    }
                    this.fixate(i);
                    switch (i) {
                        case 0:
                            this.changeDate(i + 1);
                            this.changeDate(i + 2);
                            break;
                        case 1:
                            this.changeDate(i + 1);
                            break;
                    }
                    this.roll(i, 0.2);
                    console.log(this.end)
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
         * 确定 ul 最终的位置并储存结果
         */
        fixate: function(i) {
            var liRow = Math.round((this.curDis[i] / this.liHeight).toFixed(2))
            if (liRow > this.liNum[i] - 1) {
                this.dateIndex[i] = this.liNum[i] - 1
            } else if (liRow < 0) {
                this.dateIndex[i] = 0
            } else {
                this.dateIndex[i] = liRow
            }
            this.curDis[i] = this.liHeight * this.dateIndex[i]
        },
        /**
         * 边界判断
         * Explain : @i 判断边界的列索引
         *  如果已经到边界则改变视图
         */
        changeDate: function(i) {
            this.calculateArr(i);
            this.calculateDis(i);
            this.dateArr[i] = this.getCurArr(i);
            this.initLiNum(i);
            this.renderLi(i);
            this.roll(i);
        },
        /**
         * 判断是否是闰年
         */
        isLeapYear: function(year) {
            var cond1 = year % 4 === 0;
            var cond2 = year % 100 !== 0;
            var cond3 = year % 400 === 0;
            var cond = cond1 && cond2 || cond3;
            if (cond) {
                return true;
            } else {
                return false;
            }
        },
        /**
         * 返回最终结果的数组
         * Return : Array
         */
        result: function(arr) {
            var arr2 = []
            for (var i = 0; i < this.dateArr.length; i++) {
                if (this.dateArr[i] !== undefined) {
                    arr2.push(arr[i])
                }
            }
            return arr2
        },
        /**
         * 加零，一位数显示为两位
         */
        addZero: function(num) {
            if (this.hasZero === 'yes') {
                if (num < 10) {
                    num = '0' + num
                }
            }
            return num
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
    };

    return DatePicker;
})))
