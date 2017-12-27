# spacePicker
移动端的地区选择器
## Demo
[点击这里可跳转到演示页面](https://hamger.github.io/demo/picker/picker.html)，请在移动端打开或者使用浏览器移动端调试工具打开。 
## 快速使用 
首先引入文件，你也通过`npm i hg-spacepicker`下载
```html
<!-- 日期和地址选择器公共css样式 -->
<link rel="stylesheet" type="text/css" href="./picker.css" />
<!-- 使用日期选择器需要引入的js文件 -->
<script src="./spacePicker.js"></script>
```
实例化日期选择器`new SpacePicker(option)`
```js
new SpacePicker({
    inputId: 'space-input', // 目标DOM元素ID
    success: function(arr) { // 回调函数
        console.log(arr);
    }
});
```
## 日期选择器配置项
`option`是一个配置项的对象，可以接受如下参数：

key | value | description
--------|------|-----
inputId | <string> | 目标DOM元素ID，必填
data | <array> | 符合格式的 json 数据，必填
showKey | <string> | 展示数据的键名，默认`value`
childKey | <string> | 子数据的键名，默认`child`
success | <function>  |  确定后的回调函数，返回一个结果数组，必填
cancel | <function>  |  点击取消按钮或者背景后的回调函数，选填
title | <string> | 选择器标题，默认为空
sureText | <string> | 确定按钮文本，默认为“确定”
cancelText | <string> | 取消按钮文本，默认为“取消”
f | <number> | 惯性滚动阈值（正数, 单位 px/ms），默认 `0.85`
a | <number> | 惯性滚动加速度（正数, 单位 px/(ms * ms)），默认 `0.001`
style | <object> | 包含样式配置的对象

`style`对象可以接受如下参数：
key | value | description
--------|------|-----
liHeight | <number> | 每一个选择栏的高度（px），默认 `40`
btnHeight | <number> | 按钮栏的高度（px），默认 `40`
btnOffset | <string> | 按钮离边框的距离，默认 `20px`
width | <string> | 选择器的宽度，默认 `100%`
left | <string> | 选择器的左边缘与左侧屏幕的距离，默认 `0px`
right | <string> | 选择器的右边缘与右侧屏幕的距离，默认不设置
top | <string> | 选择器的上边缘与顶部屏幕的距离，默认不设置
bottom | <string> | 选择器的下边缘与底部屏幕的距离，默认 `0px`
location | `top` \| `bottom` \| `center` | 选择器垂直方向的位置，优先级高于`top`和`bottom`，默认不设置
radius | <string> | 选择器的圆角设置，默认不设置
titleColor | <string> | 选择器标题的字体颜色
sureBtnColor | <string> | 选择器确定按钮的字体颜色
abolishBtnColor | <string> | 选择器取消按钮的字体颜色
btnBgColor | <string> | 选择器按钮栏的背景颜色
contentColor | <string> | 选择器选择区域的文字颜色
contentBgColor | <string> | 选择器选择区域的背景颜色
upShadowColor | <string> | 选择器顶部朦层颜色
downShadowColor | <string> | 选择器底部朦层颜色
lineColor | <string> | 选择器分隔线颜色
