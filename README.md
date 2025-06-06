# vue-template-generator-v2

## Project setup

> node >= v18, git = latest

### 拉取项目

```bash
cd project-dir
git clone [本项目GIT仓库地址]
cd [本项目GIT仓库名称]/src/apps
git clone [子项目仓库地址]
cd ../..
```

### 安装依赖/运行/打包/清缓存

#### 使用NPM包管理器：

```bash
npm install
#############################################
npm run dev -- --app demo # 本地开发环境
npm run build -- --app demo # 生产环境打包
npm run test -- --app demo # 测试环境打包
npm run stage -- --app demo # 预发布环境打包
#############################################
npm run clean:cache # 清除缓存
```

#### 使用yarn包管理器：

```bash
yarn install
#############################################
yarn dev --app demo
yarn build --app demo
yarn test --app demo
yarn stage --app demo
#############################################
yarn clean:cache
```

如要修改**本地/生产/测试/预发布**的运行/打包参数，请修改 `project-dir/[本项目GIT仓库名称]/src/apps/[子项目仓库名称]/configs` 目录下对应的环境变量文件：

- .env.development
- .env.production
- .env.test
- .env.stage

> 注意：
> - 更新代码或修改环境变量之后启动任意一个环境，遇到代码不生效的问题，请先清除本地缓存后再次执行相应命令。
> - 打包好的文件位于 `project-dir/[本项目GIT仓库名称]/dist/[子项目仓库名称]`。


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

### 关闭弹窗时，表单未清空

> 请检查`store[location].form[fieldName]`中否定义了与表单绑定的字段。默认情况下，关闭弹窗会清空弹窗内的表单，
> 依赖于`ant-design-vue`的`Form`组件的`useForm`API返回的`resetFields`方法。
