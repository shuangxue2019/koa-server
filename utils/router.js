const path = require('path');
const fs = require('fs');
const { loadNamespace } = require('./core');

class Router {
    constructor(dir) {
        this.dir = dir;
        this.namespace = {};
        this.routers = {};
    }

    async load (app) {
        await this.readFiles(this.dir);
        this.register(app);
    }

    async readFiles (dir) {
        const thisdir = await fs.promises.opendir(dir);
        const that = this;
        for await (const dirent of thisdir) {
            let subPath = `${dir}\\${dirent.name}`;
            await fs.stat(subPath, async (err, stats) => {
                if (!err) {
                    if (stats.isDirectory()) {
                        that.readFiles(subPath);
                    } else if (stats.isFile()) {
                        // 读取文件
                        that.getRouters(dir.substring(that.dir.length + 1), subPath)
                    }
                } else {
                    console.error(err);
                }
            })
        }
    }

    register (app) {
        let namespaces = {};
        for (let namespace in this.namespace) {
            let ns = loadNamespace(namespace);
            namespaces[ns.name] = ns.source;
        }
        for (let url in this.routers) {
            let router = this.routers[url];
            const fun = async (ctx, next) => {
                try {
                    const res = await router.method.apply({ 
                        ...namespaces,
                        context: ctx,
                        next
                     }, [ctx]);
                    ctx.status = 200;
                    ctx.res.write(JSON.stringify(res));
                } catch(e){
                    ctx.status = 500;
                    ctx.res.write(`HTTP 500, ${e}`)
                } finally {
                    ctx.res.end();
                }
            };
            switch (router.type) {
                case 'get':
                    app.get(url, fun);
                    break;
                case 'post':
                    app.post(url, fun);
                    break;
                case 'put':
                    app.post(url, fun);
                    break;
                case 'delete':
                    app.post(url, fun);
                    break;
                case 'del':
                    app.post(url, fun);
                    break;
                default:
                    app.post(url, fun);
                    break;
            }
        }
    }

    // 获取文件属性
    getRouters (dir, src) {
        try {
            // 根名称
            const rootName = path.basename(src, '.js').toLowerCase();
            // js代码
            const js = require(`../${src}`);
            // 命名空间
            const namespace = js.namespace || [];
            // 方法
            const methods = js.methods || {};
            let that = this;
            let routers = this.routers;
            namespace.forEach(item => {
                if (!that.namespace[item]) {
                    that.namespace[item] = true;
                }
            });
            for (let method in methods) {
                const sign = (method.match(/^([a-z]+)/g) || [])[0];
                // 方法名
                const funcName = method.substring((sign || '').length).toLowerCase();
                const func = methods[method];
                const routerUrl = `/api/${rootName}/${funcName}`;
                let property = {
                    type: sign,
                    method: func,
                    name: funcName
                };

                if (routers[routerUrl]) {
                    console.error(`${routerUrl} 方法冲突了`)
                    return;
                }
                routers[routerUrl] = property;
            }
        } catch{
            throw (`${src} 文件错误`);
        }
    }

    getParameterName (fn) {
        if (typeof fn !== 'object' && typeof fn !== 'function') return;
        const COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        const DEFAULT_PARAMS = /=[^,)]+/mg;
        const FAT_ARROWS = /=>.*$/mg;
        let code = fn.prototype ? fn.prototype.constructor.toString() : fn.toString();
        code = code
            .replace(COMMENTS, '')
            .replace(FAT_ARROWS, '')
            .replace(DEFAULT_PARAMS, '');
        let result = code.slice(code.indexOf('(') + 1, code.indexOf(')')).match(/([^\s,]+)/g);
        return result === null ? [] : result;
    }
}

module.exports = {
    Router
}