const loadNamespace = (src) => {
    console.log(src)
    let sourcePath = `./${src.replace(/\./g, '/')}`;
    return {
        name: ((s) => {
            try {
                let _s = s.split('.');
                let _v = [];
                _s.forEach(item => {
                    _v.push(item[0].toUpperCase());
                    _v.push(item.substring(1));
                })
                return _v.join('');
            } catch{
                throw (`非法的namespace命名方式：${s}`);
            }
        })(src),
        source: require(sourcePath)
    };
}

// 载入js程序到路由
const loadjs = (path) => {
    // 读取js
    try {
        const jscode = require(`../${path}`);
        console.log(jscode.namespace)
        return jscode;
    } catch{
        throw (`${path} 文件错误，请检查页面代码`);
    }

}

module.exports = {
    loadNamespace,
    loadjs
}