// @ts-nocheck
/*
 * @Author: bucai
 * @Date: 2021-02-04 10:40:24
 * @LastEditors: bucai
 * @LastEditTime: 2021-02-04 16:09:25
 * @Description:
 */

const parser = require("@babel/parser");
const generator = require("@babel/generator").default;
const traverse = require('@babel/traverse').default
const bTypes = require('@babel/types')
const defaultConfig = require('../config/default');

/**
 * 小程序js转换
 * @param {*} code
 * @param {*} options
 */
module.exports = (code, options = defaultConfig) => {
  options.wxApiMap = options.wxApiMap || options.wxApiMap;

  const ast = parser.parse(code, {})
  traverse(ast, {
    Identifier (path) {
      const node = path.node;
      const nType = node.type;
      // BUG: 改变声明周期，这里会存在如果不是顶级（export default { **** }）的元素会导致更改错误的名称出现异常
      if (nType === "Identifier" && node.name === "onLoad") {
        // 替换
        node.name = "created";
        path.replaceWith(node);
      }
    },
    ObjectProperty (path) {
      // BUG: 代码 已经存在 export default 的问题
      const node = path.node;
      // 对顶级的data做一个处理
      if (node.rootProperty && node.key.name == "data" && node.value.type == "ObjectExpression") {
        // 如果是顶级对的属性
        // 替换成一个data的函数
        const node_new = bTypes.objectMethod(
          "method",
          node.key,
          [],
          bTypes.blockStatement([
            bTypes.returnStatement(node.value) // 作为返回值
          ])
        );
        path.replaceWith(node_new);
      }
    },
    ExpressionStatement (path) {
      const node = path.node;
      const nExpression = node.expression;
      // BUG: 代码 已经存在 export default 的问题
      if (nExpression.type === "CallExpression" && ["Component", "Page"].includes(nExpression.callee.name)) {
        // 拿到传入的对象
        const data = nExpression.arguments[0];
        const node_new = bTypes.exportDefaultDeclaration(data);
        // 替换掉他
        path.replaceWith(node_new);
      }
    },
    ExportDefaultDeclaration (path) {
      // BUG: 同上有bug
      // 这里执行是由于之前 ExpressionStatement 制造的
      if (path.node.isAction) return;
      const declaration = path.node.declaration;
      const properties = declaration.properties;
      // 一级数据
      const rootProperty = properties
        .filter((n) => {
          return ["data", "onLoad"].includes(n.key.name);
        })
        .map((node) => {
          // 标记一下
          node.rootProperty = true;
          return node;
        });
      const otherProperty = properties.filter((n) => {
        return !["data", "onLoad"].includes(n.key.name);
      });
      // 提出来
      const node_new = bTypes.exportDefaultDeclaration(
        bTypes.objectExpression([
          ...rootProperty,
          bTypes.objectProperty(bTypes.identifier("methods"), bTypes.objectExpression(otherProperty))
        ])
      );
      node_new.isAction = true;
      path.replaceWith(node_new);
    },
    CallExpression (path) {
      const node = path.node;
      const callee = node.callee;
      const _arguments = node.arguments;
      if (callee.property && ["setData"].includes(callee.property.name)) {
        // 对 setData 进行处理
        // 获取两个参数 分别是: callee.object 和 callee.arguments
        // 根据callee.object区分this 和 that // 没啥用 直接用他作为this参数就完事了 （不愧是我）
        // const isThisExpression = bTypes.isThisExpression(callee.object)
        const thisObject = callee.object;
        // BUG: 参数多个情况可能有个回调函数
        const [dataObjectExpression, callback] = _arguments;
        const dataProperties = dataObjectExpression.properties;
        function memberExpressionMerge (array) {
          const nextArray = array.filter((_, i) => i < array.length - 1);
          const _object = nextArray.length == 1 ? nextArray[0] : memberExpressionMerge(nextArray);
          const _property = array[array.length - 1];
          return bTypes.memberExpression(_object, _property);
        }
        if (!Array.isArray(dataProperties)) return;
        const memberExpressionList = dataProperties.map((dataItem) => {
          const key = dataItem.key;
          const value = dataItem.value;
          // 对key 做一个解析 正常情况可能出现 ['a', 'a.b']这两种情况
          const leftArr = (key.name || key.value || "").split(".").map((name) => {
            return bTypes.identifier(name);
          });
          // this
          leftArr.unshift(thisObject);
          const left = memberExpressionMerge(leftArr);
          const right = value;
          return bTypes.assignmentExpression("=", left, right);
        });
        path.replaceWithMultiple(memberExpressionList);
      } else if (callee.object && callee.object.name === "wx") {
        const property = callee.property;
        const _arguments = node.arguments || [];
        // '$toast'
        // 一个一个来 先处理这样简单的处理
        if (Object.keys(options.wxApiMap).includes(property.name)) {
          // BUG: 转换成 this.$toast 作用域可能会出一点问题 目前可能得转换后手工去操作
          // 目前直接替换
          const _args = (_arguments).map(item => {
            const is = bTypes.isObjectExpression(item);
            if (is) {
              // 如果参数是一个对象就进行一个参数名替换 如 title 替换成 message
              item.properties = item.properties.filter(propertiesItem => {
                // TODO: 过滤一些无效的参数
                return true;
              }).map(propertiesItem => {
                const key = propertiesItem.key;
                const value = propertiesItem.value;
                key.name = {
                  title: 'message',
                  url: 'path',
                }[key.name] || key.name;

                return propertiesItem;
              });
              if (property.name === 'showModal') {
                item.properties = item.properties.map(propertiesItem => {
                  const key = propertiesItem.key;
                  key.name = {
                    message: 'title',
                    content: 'message',
                    confirmText: 'confirmButtonText',
                    cancelText: 'cancelButtonText',
                    confirmColor: 'confirmButtonColor',
                    cancelColor: 'cancelButtonColor',
                    success: 'confirm',
                  }[key.name] || key.name;

                  return propertiesItem;
                })
                const showCancelItem = item.properties.find(item => item.key.name === 'showCancel')
                if (showCancelItem) {
                  showCancelItem.key.name = 'showCancelButton'
                } else {
                  // 创建一个
                  item.properties.unshift(bTypes.objectProperty(bTypes.identifier('showCancelButton'), bTypes.booleanLiteral(true)))
                }
              }
              return item;
            }
            return item;
          });
          // 这里应该可能存在多层的问题 如 this.$toast.clear()
          const node_new = bTypes.callExpression(bTypes.memberExpression(bTypes.thisExpression(), bTypes.Identifier(options.wxApiMap[property.name] || property.name)), _args)
          path.replaceWith(node_new)
        }
      }
    },
    MemberExpression (path) {
      const node = path.node
      const { object: _object, property: _property } = node;
      // 如果【xx】.data xx是this的话 就将当前node替换成this 如果不是就检查一下xx是不是 this的应用
      if (
        (!node.computed && bTypes.isIdentifier(_property) && _property.name === 'data') // 匹配 this.data 并过滤掉 this[data]
        ||
        (node.computed && bTypes.isStringLiteral(_property) && _property.value === 'data') // 匹配 this['data']
      ) {
        const thisExpression = _object;
        let isThis = bTypes.isThisExpression(thisExpression);
        // 检测作用域
        if (bTypes.isIdentifier(_object)) {
          const expressionThisName = thisExpression.name;
          let currentPath = path;
          // 通过不停的遍历父亲元素来达到寻找引用关系的目的
          // BUG: 如果是存在兄弟元素切兄弟元素中存在当前的引用会导致定位失败
          do {
            currentPath = currentPath.findParent(path => path.isBlockStatement() || path.isProgram())
            if (!currentPath) break;
            // 这里还是有bug
            currentPath.traverse({
              VariableDeclarator (path) {
                // 检测一下左右
                // 右边必须是this
                // 左边必须是当前检测的名称
                const node = path.node
                const id = node.id
                // 判断表达式 右边是不是this
                if (bTypes.isThisExpression(node.init)) {
                  // 判断表达式左边是不是我们查找的一个名字
                  if (bTypes.isIdentifier(id) && id.name === expressionThisName) {
                    isThis = true
                  }
                }
              },
            });
          } while (currentPath && !isThis);
        }
        // 如果检测结果 为真 则表示 xxx 为 this 并将当前node 替换为 _object
        if (isThis) {
          path.replaceWith(_object)
        }
      }
    }
  });

  const result = generator(ast, {}, code)

  return result.code;
}