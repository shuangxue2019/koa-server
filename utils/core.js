const path = require('path');

/**
 * 载入namespace
 * @ 前缀来表示载入node_modules资源
 * @method loadNamespace
 * @param {string} src namespace路径（folder.xx.xx）
 * @return {object} 资源对象
 */
const loadNamespace = (src) => {
    let sourcePath = null;
    let res = null;

    // firstUpperCase第一个字符是否大写
    let getName = (s, firstUpperCase) => {
        try {
            let _s = s.split(/[\.\-\_]/);
            let _v = [];
            _s.forEach((item, idx) => {
                if (idx == 0 && firstUpperCase != undefined && !firstUpperCase) {
                    _v.push(item);
                } else {
                    _v.push(item[0].toUpperCase());
                    _v.push(item.substring(1));
                }
            })
            return _v.join('');
        } catch{
            throw (`非法的namespace命名方式：${s}`);
        }
    };

    if (src[0] == '@') {
        // 载入node_modules资源
        sourcePath = src.substring(1);
        // node_modules资源的命名为小驼峰法，如getTest
        res = {
            name: getName(sourcePath, false),
            source: require(sourcePath)
        }
    } else {
        sourcePath = `./${src.replace(/\./g, '/')}`;
        // 自定义资源的命名为大驼峰法，如GetTest
        res = {
            name: getName(src),
            source: require(sourcePath)
        }
    }

    return res;
}

// 获取基类
const getParent = function(rootSrc, parentSrc){
    if(!parentSrc) return {};
    let dir = path.dirname(rootSrc)
    let src = path.join(dir, parentSrc);
    let js = require(src); 
    let methods = {};

    for(let name in js.methods){
        if(name[0] === '_') continue;
        methods[name] = js.methods[name];
    }
    let parent = {
        data: js.data || {},
        ...methods,
        parent: getParent(parentSrc, js.extend),
        beforeAction: js.beforeAction || function(){},
        afterAction: js.afterAction || function(){}
    }  

    return parent;
}

// 载入js程序到路由
const loadjs = (path) => {
    // 读取js
    try {
        const jscode = require(`../${path}`);
        return jscode;
    } catch{
        throw (`${path} 文件错误，请检查页面代码`);
    }

}

module.exports = {
    loadNamespace,
    loadjs,
    getParent
}