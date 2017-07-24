/**
 * Created by Hanger on 2017/7/18.
 */
(function (wid, doc) {
	var win = wid;
	var doc = doc;

	// 以id获取dom元素
	function $id(id) {
		return doc.getElementById(id);
	}

	// 以class获取DOM元素
	function $class(name) {
		return doc.getElementsByClassName(name);
	}

	// 移除子元素
	function $removeChild(dom) {
		var children = dom.children;
		for (var i = 0, len = children.length; i < len; i++) {
			dom.removeChild(children[0])
		}
	}

	// 创建构造函数
	function DateSelector(config) {
		this.inputId = config.inputId; // 目标 input 元素，必填
		this.type = config.type || 'date'; // 选择器类型，选填
		this.begin_year = config.begin_year || new Date().getFullYear() - 10; // 起始年份，选填
		this.end_year = config.end_year || new Date().getFullYear() + 10; // 结束年份，选填
		this.hasSuffix = config.hasSuffix || 'yes'; // 是否添加时间单位，选填
		this.hasZero = config.hasZero || 'yes'; // 单位数是否显示两位，选填
		this.success = config.success; // 回调函数，必填
		this.initTab(); // 初始化标签
		this.initUI(); // 初始化UI
		this.initEvent(); // 初始化事件
	}

	// 定义初始化标签
	DateSelector.prototype.initTab = function () {
		this.recent_time = [new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate(), new Date().getHours(), new Date().getMinutes()]; // 当天的时间
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
		this.suffix = ['年','月','日','时','分'] // 储存各项时间后缀的数组
		if(this.hasSuffix == 'no'){
			this.suffix =  ['','','','','']
		}
		this.input = $id(this.inputId); // input元素
		this.containerId = this.inputId + '-container'; // 选择器容器的ID
		this.container = {}; // 选择器容器
		this.ulCount = 3; // 展示的列数
		this.liHeight = 40; // 每个li的高度
		this.dateUl = []; // 每个ul元素
		this.liNum = [this.end_year - this.begin_year + 1, 12, 30, 24, 60]; // 每个ul有多少个li
		this.curDis = []; // 每个ul当前偏离的距离
		this.curPos = []; // touchstart时每个ul偏离的距离
		this.startY = 0; // touchstart的位置
		this.startTime = 0; // touchstart的时间
		this.endY = 0; // touchend的位置 
		this.endTime = 0; // touchend的时间 
		this.move = {
			Y: 0, // touchmove的位置
			time: 0, // touchmove 每300毫秒后的时间
			curY: 0 // touchmove 每300毫秒后的位置
		};
		this.resultArr = this.recent_time; // 储存输入结果
	};

	// 定义初始化UI
	DateSelector.prototype.initUI = function () {
		this.methods().createContainer();
		this.methods().judgeType();
		this.methods().fillHtml();
		this.methods().initLocation();
	};

	// 定义初始化事件
	DateSelector.prototype.initEvent = function () {
		var that = this;
		var bg = $id('date-selector-bg-' + that.containerId);
		var container = $id('date-selector-container-' + that.containerId);
		var body = doc.body;
		
		// 点击目标 input 元素显示选择器
		$id(that.inputId).addEventListener('touchstart', function () {
			that.methods().show(bg, container)
		})

		// 点击保存按钮隐藏选择器并输出结果
		$id('date-selector-btn-save-' + that.containerId).addEventListener('touchstart', function () {
			that.success( that.methods().result(that.resultArr));
			that.methods().hide(bg, container)
		})

		// 点击取消隐藏选择器
		$id('date-selector-btn-cancel-' + that.containerId).addEventListener('touchstart', function () {
			that.methods().hide(bg, container)
		})

		// 点击背景隐藏选择器
		$id('date-selector-bg-' + that.containerId).addEventListener('touchstart', function (e) {
			if (e.target.id == 'date-selector-bg-' + that.containerId) {
				that.methods().hide(bg, container)
			}
		})
		
		// 为每个 ul 元素绑定 touch 事件
		that.dateUl.forEach(function (val, index) {
			if (val) {
				val.addEventListener('touchstart', function () {
					that.methods().touch(index);
				}, false);
				val.addEventListener('touchmove', function () {
					that.methods().touch(index);
				}, false);
				val.addEventListener('touchend', function () {
					that.methods().touch(index);
				}, true);
			}
		});
	};

	// 定义初始化方法
	DateSelector.prototype.methods = function () {
		var that = this
		return {
			// 创建并放置容器
			createContainer: function () {
				var div = document.createElement("div");
				div.id = that.containerId;
				document.body.appendChild(div);
				that.container = $id(that.containerId);
			},
			// 根据类型决定 ul 个数和储存的时间项
			judgeType: function () {
				switch (that.type) {
					case 'date':
						that.ulCount = 3;
						that.dateTime = [that.yearArr, that.monthArr, that.methods().calcDays(that.recent_time[0], that.recent_time[1] - 1), undefined, undefined]
						break;
					case 'time':
						that.ulCount = 2;
						that.dateTime = [undefined, undefined, undefined, that.hourArr, that.minuteArr]
						break;
					case 'dateTime':
						that.ulCount = 5;
						that.dateTime = [that.yearArr, that.monthArr, that.methods().calcDays(that.recent_time[0], that.recent_time[1] - 1), that.hourArr, that.minuteArr]
						break;
					default:
						throw Error('Please input a right type of the selector.')
				}
			},
			// 渲染时间选择器内容
			fillHtml: function () {
				var len = that.dateTime.length;
				var html = '<div class="date-selector-bg" id="date-selector-bg-' + that.containerId + '">' +
					'<div  class="date-selector-container" id="date-selector-container-' + that.containerId + '">' +
					'<div class="date-selector-btn-box">' +
					'<div class="date-selector-btn" id="date-selector-btn-cancel-' + that.containerId + '">返回</div>' +
					'<div class="date-selector-btn" id="date-selector-btn-save-' + that.containerId + '">确定</div>' +
					'</div>' +
					'<div class="date-selector-content">';
				for (var i = 0; i < len; i++) {
					if (that.dateTime[i]) {
						html += that.methods().renderList(i)
					}
				}
				html += '<div class="date-selector-up-shadow"></div>' +
					'<div class="date-selector-down-shadow"></div>' +
					'<div class="date-selector-line"></div>' +
					'</div>';
				that.container.innerHTML = html
				for (var i = 0; i < len; i++) {
					if (that.dateTime[i]) {
						that.dateUl[i] = $id('date-selector-' + that.containerId + '-' + i);
					}
				}
				for (var i = 0; i < that.ulCount; i++) {
					$class("date-selector-" + that.containerId)[i].style.width = (100 / that.ulCount).toFixed(2) + '%';
				}
			},
			// 渲染 li 列表
			renderList: function (i) {
				var list = '<div class="date-selector date-selector-'+ that.containerId +'">' +
					'<ul id="date-selector-' + that.containerId + '-' + i + '"><li></li><li></li>';
				that.dateTime[i].forEach(function (val, index) {
					if(that.hasZero == 'yes'){
						val = that.methods().addZero(val)
					}
					list += '<li>' + val + that.suffix[i] + '</li>'
				});
				list += '<li></li><li></li></ul></div>';
				return list
			},
			// 初始化当前时间的位置
			initLocation: function () {
				that.dateTime.forEach(function (val, index) {
					if (val) {
						if (index == 0) {
							that.curDis[index] = (that.recent_time[index] - that.begin_year) * that.liHeight
						} else if (index == 1 || index == 2) {
							that.curDis[index] = (that.recent_time[index] - 1) * that.liHeight
						} else {
							that.curDis[index] = (that.recent_time[index] - 0) * that.liHeight
						}
						that.methods().changedLocation(index)
					}
				})
			},
			// 改变时间的位置 
			changedLocation: function (i, time) {
				if (that.curDis[i] >= 0) {
					that.dateUl[i].style.transform = 'translateY(-' + that.curDis[i] + 'px)';
					that.dateUl[i].style.webkitTransform = 'translateY(-' + that.curDis[i] + 'px)';
				} else {
					that.dateUl[i].style.transform = 'translateY(' + Math.abs(that.curDis[i]) + 'px)';
					that.dateUl[i].style.webkitTransform = 'translateY(' + Math.abs(that.curDis[i]) + 'px)';
				}
				if (time) {
					that.dateUl[i].style.transition = 'transform ' + time + 's ease-out';
					that.dateUl[i].style.webkitTransition = '-webkit-transform ' + time + 's ease-out';
				}
			},
			// 时间选择器触摸事件
			touch: function (i) {
				var event = event || window.event;
				event.preventDefault();
				switch (event.type) {
					case "touchstart":
						that.startY = event.touches[0].clientY;
						that.move.time = that.startTime = Date.now()
						that.curPos[i] = that.curDis[i];
						break;
					case "touchend":
						that.endY = event.changedTouches[0].clientY;
						that.endTime = Date.now()
						var time = 0.3;
						if (that.endTime - that.startTime < 150) { // 点击跳入下一项
							that.curDis[i] = that.curDis[i] + that.liHeight;
						} else { // 体现滑动惯性
							var offset = that.move.curY - that.endY;
							var v = (offset / (that.endTime - that.move.time)) / 2;
							that.curDis[i] = offset + that.curDis[i] + v * time;
						}
						that.methods().changedLocation(i, time);
						that.methods().position(i);
						break;
					case "touchmove":
						event.preventDefault();
						that.move.Y = event.touches[0].clientY;
						that.curDis[i] = that.startY - that.move.Y + that.curPos[i];
						if (that.curDis[i] <= -1.5 * that.liHeight) {
							that.curDis[i] = -1.5 * that.liHeight
						}
						if (that.curDis[i] >= (that.liNum[i] - 1 + 1.5) * that.liHeight) {
							that.curDis[i] = (that.liNum[i] - 1 + 1.5) * that.liHeight
						}
						that.methods().changedLocation(i);
						var now = Date.now()
						if (now - that.move.time > 300) { // 每隔300毫秒记录一次当前的位置和时间
							that.move.time = now;
							that.move.curY = that.move.Y
						}
						break;
				}
			},
			// 确定 ul 最终的位置并取得结果
			position: function (i) {
				var index = 0;
				var liRow = Math.round((that.curDis[i] / that.liHeight).toFixed(3))
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
				that.methods().changedLocation(i, 0.3)
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
			changedDay: function(){
				if(that.methods().calcDays(that.resultArr[0],that.resultArr[1]-1).length != that.resultArr[2].length){
					that.methods().renderDays(that.methods().calcDays(that.resultArr[0],that.resultArr[1]-1))
					if(!(that.preDay in that.dayArr)){ // 如果前一次操作的日期不在当前的日期列表中(比如31号不在小月，30号不在2月)，进行置底
						that.curDis[2] = that.liHeight * (that.liNum[2] - 1)
						that.methods().changedLocation(2)
					}
				}
			},
			// 改变列表 li 个数并返回日期的数组
			calcDays: function (year, month) {
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
			isLeapYear: function (year) {
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
			renderDays: function (arr) {
				$removeChild(that.dateUl[2])
				var list = '<li></li><li></li>';
				arr.forEach(function (val, index) {
					if(that.hasZero == 'yes'){
						val = that.methods().addZero(val)
					}
					list += '<li>' + val + that.suffix[2] + '</li>'
				});
				list += '<li></li><li></li>'
				that.dateUl[2].innerHTML = list
			},
			// 根据 type 类型返回结果 
			result: function (arr) {
				var arr2 = []
				switch (that.type) {
					case 'date':
						for(var i =0;i<3;i++){
							arr2.push(arr[i])
						}
						break;
					case 'time':
						for(var i =3;i<5;i++){
							arr2.push(arr[i])
						}
						break;
					case 'dateTime':
						for(var i =0;i<5;i++){
							arr2.push(arr[i])
						}
						break;
				}
				return arr2
			},
			// 单位数显示为两位
			addZero:function(num){
				if(num < 10){
					num = '0' + num 
				}
				return num
			},
			// 显示选择器
			show: function (bg, container) {
				bg.classList.add('date-selector-bg-up');
				container.classList.add('date-selector-container-up');
			},
			// 隐藏选择器
			hide: function (bg, container) {
				bg.classList.remove('date-selector-bg-up');
				container.classList.remove('date-selector-container-up');
			}
		}
	}

	// 暴露接口
	if (typeof exports == "object") {
		module.exports = DateSelector;
	} else if (typeof define == "function" && define.amd) {
		define([], function () {
			return DateSelector;
		})
	} else {
		win.DateSelector = DateSelector;
	}
})(window, document);