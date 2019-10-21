// index.js
// 只接受json返回类型或者object对象
module.exports = {
    namespace: [
        "api.base"
    ],
    methods: {
        getGet(ctx, next) {
            console.log("getGet")
            console.log(ctx, next)
        },
        getUsers(ctx, next) {
            console.log("getUsers")
            // 访问namespace中的方法
            console.log(this.ApiBase.testFun())
            return { isOK: true}
        }
    }
}