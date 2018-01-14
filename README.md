# Picker
移动端的日期和地址选择器


[![npm](https://img.shields.io/npm/v/npm.svg)]()
## Demo
[点击这里可跳转到演示页面](https://hamger.github.io/demo/picker/picker.html)，请在移动端打开或者使用浏览器移动端调试工具打开。 
## 快速使用 
首先引入文件，你也可以通过`npm i hg-datepicker`下载`datePicker.js`，通过`npm i hg-spacepicker`下载`spacePicker.js`
```html
<!-- 日期和地址选择器公共css样式 -->
<link rel="stylesheet" type="text/css" href="./picker.css" />
<!-- 使用日期选择器需要引入的js文件 -->
<script src="./datePicker.js"></script>
<!-- 使用地址选择器需要引入的js文件 -->
<script src="./spacePicker.js"></script>
```
使用日期选择器，在js文件中写入如下代码
```js
new DatePicker({
    inputId: 'date-input', // 目标DOM元素ID
    success: function(arr) { // 回调函数
        console.log(arr);
    }
});
```
使用地区选择器，在js文件中写入如下代码
```js
new SpacePicker({
    inputId: 'space-input', // 目标DOM元素ID
    data: city, // 符合格式的 json 数据，参考 city.js 文件
    success: function(arr) { // 回调函数
        console.log(arr);
    }
});
```
关于如何使用你还可以参考`picker.html`文件。
## 选择器配置项
日期选择器配置项说明详见[日期选择器使用文档](https://github.com/hamger/Picker/blob/master/datePicker/README.md)

地区选择器配置项说明详见[地区选择器使用文档](https://github.com/hamger/Picker/blob/master/spacePicker/README.md)
