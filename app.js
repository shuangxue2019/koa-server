const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const Koa = require('koa');
const Router = require('koa-router');
const KoaStatic = require('koa-static');
const cf = require('./utils/config');
const cRouter = require('./utils/router');

// 启动应用
async function startApp (baseConfig, dir) {
    // 读取配置
    let configPath = `${dir}/config.json`;
    let config = await cf.get(configPath);

    if (!config) {
        console.error(`未能读取到config.json配置文件，该文件是否存在？`)
        return;
    }

    // 合并配置项
    config = cf.extend(config, baseConfig);

    const app = new Koa();
    const router = new Router();

    // 读取路由配置
    const crouter = new cRouter.Router(path.join(dir, config.web.apiDir));
    await crouter.load(router);

    // let an = async(ctx, next)=>{
    //     ctx.response.body = '<h1>首页</h1>'
    // }
    // router.get("/test", an)
    // router.get("/test", async(ctx, next)=>{
    //     ctx.response.body = '<h1>测试页</h1>'
    // })
    app.use(router.routes());
    app.use(KoaStatic(path.join(__dirname, dir, config.web.public)))

    app.use(async ctx => {
        // 根据请求地址，获取资源文件
    });

    app.on('error', (err, ctx) => {
        console.error('server error', err, ctx)
    })

    for (const protocol in config.server.protocols) {
        const port = config.server.protocols[protocol].port;
        let server = null;
        switch (protocol) {
            case "http":
                server = http.createServer(app.callback());
                break;
            case "https":
                server = https.createServer(app.callback());
                break;
        }
        if (server) {
            server.listen(port)
            server.on("listening", () => {
                console.log(`应用\"${config.appName}\"启动成功，端口监听：${port}`);
            })
            server.on("error", err => {
                console.log(`应用\"${config.appName}\"启动失败，端口${port}被占用`);
            })
        }
    }
}

async function startApps (p) {
    // 读取根目录的config.json
    const dir = await fs.promises.opendir(p);
    if (dir) {
        let appDirs = [];
        let baseConfigPath = null;
        let baseConfig = null;
        for await (const dirent of dir) {
            let subPath = `${p}/${dirent.name}`;
            await fs.stat(subPath, async (err, stats) => {
                if (!err) {
                    if (stats.isDirectory()) {
                        appDirs.push(subPath)
                    } else if (stats.isFile()) {
                        if (dirent.name == "config.json") {
                            baseConfigPath = subPath;
                        }
                    }
                } else {
                    console.error(err);
                }
            })
        }

        if (!baseConfigPath) {
            console.error("缺少关键的根配置文件")
        } else {
            try {
                baseConfig = await cf.get(baseConfigPath)
            } catch{
                console.error("读取配置文件异常");
            }

            appDirs.forEach(appDir => {
                startApp(baseConfig, appDir);
            })
        }
    } else {
        console.error("未找到根目录配置文件");
    }
}

startApps("./apps")