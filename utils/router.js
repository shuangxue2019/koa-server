const path = require('path');
const fs = require('fs');
const { loadNamespace, getParent } = require('./core');

class Router {
    constructor(dir) {
        this.dir = dir;
        this.namespace = {};
        this.routers = {};
        this.obj = {};
    }

    async load(app) {
        await this.readFiles(this.dir);
        this.register(app);
    }

    async readFiles(dir) {
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

    register(app) {
        let namespaces = {};
        let that = this;
        for (let page in this.namespace) {
            let nsDic = [];
            namespaces[page] = nsDic;
            (this.namespace[page] || []).forEach(item => {
                let ns = loadNamespace(item);
                nsDic[ns.name] = ns.source;
            })
        }
        for (let url in this.routers) {
            let router = this.routers[url];
            const fun = async (ctx, next) => {
                ctx.type = 'application/json; charset=utf-8';
                try {
                    let page = url.substring(0, url.lastIndexOf('/') + 1)
                    let obj = that.obj[page] || {};
                    let parent = obj.parent;
                    // 仅载入指定的namespace
                    let ns = namespaces[page];
                    let thatObj = {
                        ...this,
                        ...ns,
                        ...obj,
                        context: ctx,
                        next,
                        parent
                    };
                    // 前置拦截
                    let res = {};
                    if(obj.beforeAction){
                        let _r = obj.beforeAction.apply({
                            ...thatObj,
                            base: parent ? parent.beforeAction : function(){}
                        }, [ctx, next]); 

                        // 拦截
                        if(!_r){
                            res = ctx.result === undefined ? {} : ctx.result;
                            ctx.res.body = res
                            return;
                        }
                    }                   

                    res = await router.method.apply({
                        ...thatObj,
                        base: parent ? parent[router.actualName] : function () { }
                    }, [ctx, next]);
                    ctx.status = 200;

                    // 后置拦截
                    if(obj.afterAction){
                        obj.afterAction.apply({
                            ...thatObj,
                            base: parent ? parent.afterAction : function(){}
                        }, [ctx, next]); 

                        if(ctx.result !== undefined){
                            res = ctx.result;
                        }
                    }

                    ctx.res.body = res;
                } catch (e) {
                    ctx.status = 500;
                    ctx.res.body = `HTTP 500, ${e}`;
                } finally {
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
                    app.put(url, fun);
                    break;
                case 'delete':
                    app.delete(url, fun);
                    break;
                case 'del':
                    app.del(url, fun);
                    break;
                default:
                    app.all(url, fun);
                    break;
            }
        }
    }

    // 获取文件信息
    getRouters(dir, src) {
        try {
            // 根名称
            const rootName = path.basename(src, '.js').toLowerCase();
            // js代码
            const js = require(`../${src}`);
            const parent = getParent(`../${src}`, js.extend);
            if (js.hidden) return;
            // 命名空间
            const namespace = js.namespace || [];
            // 方法
            const methods = js.methods || {};
            let that = this;
            let routers = this.routers;
            let preLoadNS = [];
            namespace.forEach(item => {
                if (!preLoadNS.includes(item)) preLoadNS.push(item);
            });
            // 根据文件载入对应的namespace
            that.namespace[`/api/${rootName}/`] = preLoadNS;
            that.obj[`/api/${rootName}/`] = {
                data: js.data || {},
                ...js.methods,
                parent,
                beforeAction: js.beforeAction,
                afterAction: js.afterAction
            }
            for (let method in methods) {
                if (method[0] == '_') {
                    // 私有方法
                    continue;
                }
                const sign = (method.match(/^([a-z]+)/g) || [])[0];
                // 方法名
                const funcName = method.substring((sign || '').length).toLowerCase();
                const func = methods[method];
                const routerUrl = `/api/${rootName}/${funcName}`;
                let property = {
                    type: sign,
                    method: func,
                    name: funcName,
                    actualName: method
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

    getParameterName(fn) {
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