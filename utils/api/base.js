class BaseController{
    
}

const testFun = (t) => {
    // 箭头函数，在引入资源后调用有存在传参不成功的问题
    console.log("载入成功namespace，调用方法名testFunc")
}

module.exports = {
    testFun
}