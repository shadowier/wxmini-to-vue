# 小程序页面（组件）转Vue组件

☄️一个微信小程序页面组件转为Vue组件的库

<p align="center">
    <img alt="GitHub code size in bytes" src="https://img.shields.io/github/languages/code-size/notbucai/wxmini-to-vue">
    <img alt="GitHub issues" src="https://img.shields.io/github/issues/notbucai/wxmini-to-vue">
    <img alt="GitHub" src="https://img.shields.io/github/license/notbucai/wxmini-to-vue">
    <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/notbucai/wxmini-to-vue">
</p>


## 🤪 Installing

```bash
$ npm install wxmini-to-vue
```

## 🤔 Example

```javascript
const path = require('path')
// 导入 wxmini-to-vue
const WTV = require('wxmini-to-vue')
// 实例化
const wtv = new WTV()
// 入口路径
const entryPath = path.resolve(__dirname, './path')
// 存放位置
const outputPath = path.resolve(__dirname, './o/path')
// 执行转换
wtv.transform(entryPath, outputPath)

// 执行完成后会在 [outputPath] 中存放
```

## Api

**wtv.transform(entryPath, outputPath)**

```javascript
// 入口路径
const entryPath = path.resolve(__dirname, './path')
// 存放位置
const outputPath = path.resolve(__dirname, './o/path')
// 执行转换
wtv.transform(entryPath, outputPath)
```

## 🥳 Introduce

### 小程序js -> script
```
babel code to ast

1. 将wxApi替换成 一些自定义的方式
    例如：
    wx.showToast => this.$toast
    wx.getStorageSync => this.$store2
    wx.setStorageSync => this.$store2

2. ..其他处理 暂不细说
```
### 小程序wxml -> template
```
使用 htmlparser2 将code 转换成 ast

1. 标签转换
2. 模版转换
```
### 小程序wxss -> style
```
使用 csstree 将code 转换成 ast

1. 标签转换
2. 单位转换
```