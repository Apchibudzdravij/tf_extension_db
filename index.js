const http = require('http');
const Koa = require('koa');
const Router = require('@koa/router');
const Logger = require('koa-logger');
const {
    koaBody
} = require('koa-body');
const fs = require('fs');

const app = new Koa;
const router = new Router;
const httpServer = http.createServer(app.callback());
const port = 7000;

app.use(koaBody());

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = err.statusCode || err.status || 500;
        ctx.response.type = 'json';
        console.log('Error handled by Koa: ', err.message);
        ctx.body = {
            error: err.message
        };
    }
});



app.use(Logger())
    .use(router.routes())
    .use(router.allowedMethods());

httpServer.listen(port, () => {
    console.log(`HTTP Server started on port ${port}`);
});