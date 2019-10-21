const fs = require("fs")
const { parseJSON, deepMergeJson } = require('./object-handle')

// 获取配置文件
const get = async (path) => {
    let configFs = await fs.promises.open(path, 'r');
    let config = await configFs.readFile("utf-8");
    try {
        config = parseJSON(config);
    } catch{
        console.error("配置文件不合法");
    }
    return config;
}

// 合并配置文件
const extend = (config, base) => {
    return deepMergeJson(deepMergeJson({}, base), config);
}

module.exports = {
    get,
    extend
}