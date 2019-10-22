// index.js
// 只接受json返回类型或者object对象
module.exports = {
    namespace: [
        "api.base",
        "@fs"
    ],
    extend: "./master/master",  // 继承
    methods: {
        getGet(ctx, next) {
            console.log("getGet")
            ctx.session.username = "张三"
            return {}
        },
        getUsers(ctx, next) {
            console.log("getUsers")
            // 访问namespace中的方法
            this.ApiBase.testFun();
            console.log("调用私有方法：", this._test());
            this.base.apply(this, [ctx, next])
            console.log("username", ctx.session.username)
            return { isOK: true }
        },
        _test(){
            return "私有方法"
        }
    },
    // 前置拦截
    // 仅覆盖，只能调用父页面的方法，不可再往上调
    // 返回值为false，将不执行方法，ctx.result可以修改返回结果
    beforeAction(ctx, next) {
        return true;
    },
    // 后置拦截
    // 仅覆盖，只能调用父页面的方法，不可再往上调
    // ctx.result可以修改返回结果
    afterAction(ctx, next) {
        ctx.result = {
            isOK: false,
            message: "后置拦截，结果被修改"
        }
    }
}