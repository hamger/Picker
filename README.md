# Picker
移动端的日期和地址选择器
## Demo
[点击这里可跳转到演示页面](https://hamger.github.io/demo/picker/picker.html)，请在移动端打开或者使用浏览器移动端调试工具打开。 
## 快速使用 
首先引入文件
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
          document.getElementById('date-input').value = arr;
      }
  });
```
使用地址选择器，在js文件中写入如下代码
```js
new SpacePicker({
      inputId: 'space-input', // 目标DOM元素ID
      data: city, // 符合格式的 json 数据
      success: function(arr) { // 回调函数
          console.log(arr);
          document.getElementById('space-input').value = arr;
      }
  });
```
关于如何使用你还可以参考 picker.html 文件。
## 日期选择器配置项
传入不同的配置项可以实现不同的效果
```js
new DatePicker({
      inputId: 'date-input3', // 目标DOM元素ID，必填
      type: 'dateTime', // 日期选择器的类型，可设置 date（年月日），time（分时），dateTime(年月日时分)，选填，默认值为 date
      begin_year: 2000, // 起始年份，选填，默认为前十年
      end_year: 2020, // 结束年份，选填，默认为后十年
      hasSuffix: 'no', // 是否添加时间单位，可设置 no（不添加），yes（添加），选填，默认值为 yes
      hasZero: 'no', // 一位数前是否加零，可设置 no（不添加），yes（添加），选填，默认值为 yes
      success: function(arr) { // 回调函数，必填，返回一个参数，该参数为表示时间的数组，如[2002,2,2]表示2002年2月2号
          console.log(arr);
          document.getElementById('date-input3').value = arr;
      }
  });
```
## 地址选择器配置项
地址选择器的配置项只有三个，如下
```js
new SpacePicker({
      inputId: 'space-input', // 目标DOM元素ID
      data: city, // 符合格式的 json 数据
      success: function(arr) { // 回调函数，必填，返回一个参数，该参数为表示地址的数组，如["广东", "湛江", "赤坎区"]
          console.log(arr);
          document.getElementById('space-input').value = arr;
      }
  });
```
但是需要注意传入的json数据的格式，格式请参考 city.js 文件中的数据格式。
