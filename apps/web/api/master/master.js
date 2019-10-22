module.exports = {
    namespace: [
        "api.base",
        "@fs"
    ],
    hidden: true,   // 隐藏接口暴露
    methods: {
        getGet(ctx, next) {
            console.log("getGet")
            console.log(ctx, next)
        },
        getUsers(ctx, next) {
            console.log("调用了父方法")
            // 访问namespace中的方法
            this.ApiBase.testFun();
            return { isOK: true }
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