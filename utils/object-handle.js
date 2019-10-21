// 移除注释
const removeNodes = (str) => {
    return (str || '').replace(/\/\/[^\r\n]*/g, '');
}

// 转换为JSON格式
const parseJSON = (str) => {
    return JSON.parse(removeNodes(str) || '{}');
}

// 深度合并JSON
const deepMergeJson = (json1, json2) => {
    for (var key in json2) {
        json1[key] = json1[key] && json1[key].toString() === "[object Object]" ?
            deepMergeJson(json1[key], json2[key]) : json1[key] = json2[key];
    }
    return json1;
}

// 是否是数组格式
const isArray = (obj) => {
    return obj instanceof Array;
}

// 是否是JSON格式
const isJson = (obj) => {
    return (obj instanceof Object) && !isArray(obj);
}

module.exports = { removeNodes, parseJSON, deepMergeJson }