# koa-server

### 启动项目

``` javascript
npm install // 初始化项目
npm run dev // 启动项目
```

### 目录结构

``` javascript
-apps
  |-web 
    |-api 
    |-public 
    |-config.json 
  |-config.json 
-utils 
  |-api 
  |-config.js 
  |-core.js 
  |-object.js
  |-handle.js 
  |-router.js 
-app.js 
-package.json
```

#### apps 应用程序目录

> <p>根目录的config.json为全局配置，若应用程序没有配置相关配置项的话，将继承该配置</p>
> <p>应用程序为文件夹形式，需要包含config.json配置文件。默认的结构为api文件夹和public文件夹</p>
> <p>应用程序下的api文件夹为服务端api的文件目录，public为静态文件目录</p>

#### utils 核心代码

* api文件夹 服务带api代码的namespace引入根地址
* config.js 配置文件读取程序
* core.js 核心程序（目前只有namespace载入方法）
* object-handle.js 对象处理程序（作废）
* router.js 路由处理程序

#### app.js

服务器入口程序

### 服务端代码开发

#### 创建项目

1. 创建项目文件夹，如web
2. 在项目文件夹下创建config.json文件（相关配置后面介绍）
3. 创建api文件夹和public文件夹

#### config.json配置说明

| 节点                           | 类型   | 说明                                                 |
|--------------------------------|--------|------------------------------------------------------|
| appName                        | string | 应用程序名                                            |
| enabled                        | bool   | 是否启用，默认为true                                    |
| server                         | json   | 服务器配置                                            |
| server>mime                    | json   | mime类型，结构为："后缀名": "mime"                       |
| server>protocols               | json   | 启用协议                                              |
| server>protocols>protocol      | json   | 协议，配置了，就代表启用该协议                             |
| server>protocols>protocol>port | int    | 协议监听端口                                           |
| web                            | json   | 页面相关                                              |
| web>errors                     | json   | 错误页面，结构为"错误编码":"页面地址"，如"404": "./404.html" |
| web>public                     | string | 发布的静态页面文件存放目录                               |
| web>apiDir                     | string | api代码存放目录，不会影响url结构                          |

#### api文件与url地址关系

``` javascript
url地址为： protocol: //webserverAddress/api/{apiDir下的文件或目录}/{js文件中的方法名}
如： 在apiDir下的文件结构为users/list.js
其中list.js中有一个getGet的方法
那么生成的url地址为：localhost:8000/api/users/list/get
请求方式为get
```

#### api文件说明

``` javascript
module.exports = {
    namespace: [
        "api.base",
        "@fs"
    ],
    methods: {
        getGet(ctx, next) {
            return {}
        },
        getUsers(ctx, next) {
            this.ApiBase.testFun();
            return {
                isOK: true
            }
        }
    },
    // 前置拦截
    beforeAction(ctx, next) {
        return true;
    },
    // 后置拦截
    afterAction(ctx, next) {
        this.result = {
            isOK: false
        }

        return {
            status: 404
        }
    }
}
```

结构必须是module.exports = {}

``` javascript
namespace // 引入js文件，格式为：{目录}.{文件名}, 调用方法：this.DirectoryFilename.customFunction()
// 其中：命名方式必须是小写，调用方式为首字母大写
// 例
namespace: [
    "api.base"
]
// 实际调用的是根目录下的utils文件夹底下的api文件夹，在其中有一个base.js文件（里面有一个testFunc方法）
// 调用的时候是：this.ApiBase.testFunc();
```

``` javascript
methods // 接口方法，将向外暴露
// 其中的方法会自动接受两个参数：ctx和next，参考koa，this对象将包含namespace、context和next
// 方法必须要返回一个json对象
// 方法包含前缀或不包含前缀
// 前缀有：get、post、put、delete、del，对应请求方式为：get、post、put、delete、del
// 若无前缀，则请求方式为all
// 方法名为去除前缀后的名称
// 例
methods: {
  getUsers: function(ctx, next){
    return {}
  }
}
```
```javascript
beforeAction // 前置拦截 还未开发
```
```javascript
afterAction // 后置拦截 还未开发
```