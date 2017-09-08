/**
 * Created by Hanger on 2017/8/31.
 */
(function(win, doc) {
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

    // 移除自身
    function $removeSelf(dom) {
        dom.parentNode.removeChild(dom);
    }

    // 创建构造函数
    function SpaceSelector(config) {
        this.inputId = config.inputId; // 目标DOM元素ID，必填
        this.data = config.data; // json 数据，必填
        this.success = config.success; // 回调函数，必填
        this.initTab(); // 初始化标签
        this.initUI(); // 初始化UI
        this.initEvent(); // 初始化事件
    }

    // 定义初始化标签
    SpaceSelector.prototype.initTab = function() {
        this.input = $id(this.inputId); // input元素
        this.containerId = this.inputId + '-container'; // 外部选择器容器ID
        this.container = {}; // 选择器容器
        this.relatedData = []; // 存放每列地址的关联数据
        this.displayedData = []; // 存放每列地址的展示数据
        this.spaceIndex = []; // 存放每列地址的索引
        this.liNum = []; // 每个ul有多少个可选li
        this.ulCount = 0; // 当前展示的列数
        this.renderCount = 0; // 将要渲染的列数
        this.ulWidth = 0; // 每个ul的宽度
        this.liHeight = 40; // 每个li的高度
        this.spaceUl = []; // 每个ul元素
        this.curDis = []; // 每个ul当前偏离的距离
        this.curPos = []; // 记录 touchstart 时每个ul的竖向距离
 		this.startY = 0; // touchstart的位置
		this.startTime = 0; // touchstart的时间
		this.endY = 0; // touchend的位置 
		this.endTime = 0; // touchend的时间 
		this.moveY = 0; // touchmove的位置

        this.bg = 'date-selector-bg-' + this.containerId // 选择器背景ID 
        this.inContainer = 'date-selector-container-' + this.containerId // 内部选择器容器ID
        this.cancel = 'date-selector-btn-cancel-' + this.containerId // 选择器取消按钮ID
        this.save = 'date-selector-btn-save-' + this.containerId // 选择器确定按钮ID
        this.content = 'date-selector-content-' + this.containerId // 选择器内容ID
    };

    // 定义初始化UI
    SpaceSelector.prototype.initUI = function() {
        this.methods().createContainer();
        this.relatedData[0] = this.data;
        this.methods().getData(this.relatedData[0], 0, 0);
        this.displayedData[0] = this.methods().getValue(this.relatedData[0]);
        this.liNum[0] = this.relatedData[0].length;
        this.methods().dealData(0);
        for (var i = 0; i < this.renderCount; i++) {
            this.spaceIndex[i] = 0
        };
        this.methods().renderSelector();
    };

    // 定义初始化事件
    SpaceSelector.prototype.initEvent = function() {
        var that = this;
        var bg = $id('date-selector-bg-' + that.containerId);
        var container = $id(that.inContainer);

        // 点击目标DOM元素显示选择器
        $id(that.inputId).addEventListener('touchstart', function() {
            that.methods().show(bg, container)
        })

        // 点击保存按钮隐藏选择器并输出结果
        $id(that.save).addEventListener('touchstart', function() {
            that.success(that.methods().getResult());
            that.methods().hide(bg, container)
        })

        // 点击取消隐藏选择器
        $id(that.cancel).addEventListener('touchstart', function() {
            that.methods().hide(bg, container)
        })

        // 点击背景隐藏选择器
       	bg.addEventListener('touchstart', function(e) {
            if (e.target.id == 'date-selector-bg-' + that.containerId) {
                that.methods().hide(bg, container)
            }
        })
    };

    // 定义初始化方法
    SpaceSelector.prototype.methods = function() {
        var that = this
        return {
            // 创建并放置外部选择器容器
            createContainer: function() {
                var div = document.createElement("div");
                div.id = that.containerId;
                document.body.appendChild(div);
                that.container = $id(that.containerId);
            },
            /*
	        Function	: 获取每列的对象数组
	        Return      : Null
	        Explain    	: @arr 当前列的对象数组
	        	@index 当前列被选中元素的索引
	        	@i 当前操作列索引
	        */
            getData: function(arr, index, i) {
                var obj = arr[index]
                if ('child' in obj && obj.child.length > 0) {
                	that.relatedData[i+1] = obj.child
                	that.renderCount++
                    that.methods().getData(obj.child, 0, ++i)
                }
            },
            // 处理与对象数据相关联的数据 
            dealData: function(i) {
            	that.ulCount = i + that.renderCount + 1
                for (var j = i + 1; j < that.ulCount; j++) {
                    that.displayedData[j] = that.methods().getValue(that.relatedData[j])
                    that.liNum[j] = that.relatedData[j].length
                };
                that.ulWidth = (100 / that.ulCount).toFixed(2)
            },
            /*
	        Function    : 获取对象数组的 value 值
	        Return      : Array
	        Explain 	: @arr 需要被解析的对象数组
	        */
            getValue: function(arr) {
                var tempArr = []
                for (var i = 0; i < arr.length; i++) {
                    tempArr.push(arr[i].value)
                }
                return tempArr;
            },
            // 渲染时间选择器内容
            renderSelector: function() {
                var html = '<div class="date-selector-bg" id="' + that.bg + '">' +
                    '<div  class="date-selector-container" id="' + that.inContainer + '">' +
                    '<div class="date-selector-btn-box">' +
                    '<div class="date-selector-btn" id="' + that.cancel + '">返回</div>' +
                    '<div class="date-selector-btn" id="' + that.save + '">确定</div>' +
                    '</div>' +
                    '<div class="date-selector-content" id="' + that.content + '">' +
                    '<div class="date-selector-up-shadow"></div>' +
                    '<div class="date-selector-down-shadow"></div>' +
                    '<div class="date-selector-line"></div>' +
                    '</div>';
                that.container.innerHTML = html
                for (var i = 0; i < that.ulCount; i++) {
                    that.methods().renderUl(i)
                    that.spaceIndex[i] = 0
                    that.curDis[i] = 0 * that.liHeight
                    that.methods().bindRoll(i)
                }
                that.methods().setWidth()
            },
            // 渲染 ul 列表
            renderUl: function(i) {
                var parentNode = $id(that.content);
                var newPickerDiv = document.createElement('div');
                newPickerDiv.setAttribute('class', 'date-selector');
                newPickerDiv.classList.add('class', "date-selector-" + that.containerId);
                newPickerDiv.innerHTML = '<ul id="date-selector-' + that.containerId + '-' + i + '"></ul>';
                parentNode.insertBefore(newPickerDiv, parentNode.children[parentNode.children.length - 3]);
                that.spaceUl[i] = $id('date-selector-' + that.containerId + '-' + i);
                that.methods().renderLi(i)
            },
            // 渲染 li 元素
            renderLi: function(i) {
                that.spaceUl[i].innerHTML = ''
                var lis = '<li></li><li></li>'
                that.displayedData[i].forEach(function(val, index) {
                    lis += '<li>' + val + '</li>'
                });
                lis += '<li></li><li></li>'
                that.spaceUl[i].innerHTML = lis
            },
            // 设置 ul 宽度
            setWidth: function() {
                for (var i = 0; i < that.ulCount; i++) {
                    $class("date-selector-" + that.containerId)[i].style.width = that.ulWidth + '%';
                };
            },
            // 绑定滑动事件 
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
            // 滚动改变位置 
            roll: function(i, time) {
                if (that.curDis[i] >= 0) {
					that.spaceUl[i].style.transform =  'translate3d(0,-' + that.curDis[i] + 'px, 0)';
					that.spaceUl[i].style.webkitTransform =  'translate3d(0,-' + that.curDis[i] + 'px, 0)';
				} else {
					that.spaceUl[i].style.transform = 'translate3d(0,' +  Math.abs(that.curDis[i]) + 'px, 0)';
					that.spaceUl[i].style.webkitTransform = 'translate3d(0,' +  Math.abs(that.curDis[i]) + 'px, 0)';
				}
				if (time) {
					that.spaceUl[i].style.transition = 'transform ' + time + 's ease-out';
					that.spaceUl[i].style.webkitTransition = '-webkit-transform ' + time + 's ease-out';
				}
            },
            // 时间选择器触摸事件
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
            // 确定 ul 最终的位置、更新数据
            fixate: function(i) {
                that.renderCount = 0;
                that.methods().getPosition(i);
                that.methods().getData(that.relatedData[i], that.spaceIndex[i], i);
                that.methods().dealData(i);
                that.methods().updateUl(i);
                that.methods().getCurDis();
                for (var j = i; j < that.ulCount; j++) {
                	that.methods().roll(j, 0.2);
                };
            },
            // 获取每列的竖向位置
            getCurDis:function () {
            	for (var i = 0; i < that.ulCount; i++) {
            	 	that.curDis[i] = that.spaceIndex[i] * that.liHeight
        		};	
            },
            // 获取定位数据
            getPosition: function(i) {
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
                that.spaceIndex[i] = index
            },
            // 更新 ul 列表中的数据
            updateUl: function(i) {
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
                    that.methods().setWidth()
                } else { // 列数减少的情况
                    for (var j = i + 1; j < that.ulCount; j++) {
                        that.methods().renderLi(j)
                    }
                    for (var j = that.ulCount; j < curUlCount; j++) {
                        $removeSelf(that.spaceUl[j].parentNode)
                    };
                    that.methods().setWidth()
                }
                for (var k = i + 1; k < that.ulCount; k++) {
                    that.spaceIndex[k] = 0
                };

            },
            // 获取结果的数组
            getResult: function() {
                var arr = []
                for (var i = 0; i < that.ulCount; i++) {
                    arr.push(that.displayedData[i][that.spaceIndex[i]])
                }
                return arr
            },
            // 显示选择器
            show: function(bg, container) {
                bg.classList.add('date-selector-bg-up');
                container.classList.add('date-selector-container-up');
            },
            // 隐藏选择器
            hide: function(bg, container) {
                bg.classList.remove('date-selector-bg-up');
                container.classList.remove('date-selector-container-up');
            }
        }
    }

    // 暴露接口
    if (typeof exports == "object") {
        module.exports = SpaceSelector;
    } else if (typeof define == "function" && define.amd) {
        define([], function() {
            return SpaceSelector;
        })
    } else {
        win.SpaceSelector = SpaceSelector;
    }
})(window, document);
