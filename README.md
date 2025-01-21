# vue-template-generator-v2

## node >= 18

## Project setup

```
npm run install
yarn install
```
## 开发问题排查

### 搜索栏的重置按钮不会重置各个表单项的值为初始值？

> 确保 store.state.search 中为该表单项定义了初始值。

## 开发注意事项

### 对`store.currentItem`的监听一定要谨慎

> 多层弹窗时，因本框架对`store.currentItem`的特殊处理，每层弹窗都会对上一层弹窗的`currentItem`数据进行缓存。
> 当新开弹窗时，`currentItem`数据会更新为新开弹窗（上层弹窗）的对应数据，此时下层弹窗的`currentItem`数据会被
> 缓存到`currentItem._prevCurrentItem`中。此时如果在下层弹窗中有对currentItem的监听（watch），则可能会引
> 起*异常行为*以及*性能损耗*。所以推荐在弹窗的开启和关闭时，手动对该弹窗的`currentItem`监听进行清除。幸运的是，
> `vue3`提供了此`API`，如要清除监听，调用`watch`返回的函数即可。
