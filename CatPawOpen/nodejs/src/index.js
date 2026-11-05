import fastify from 'fastify';
import router from './router.js';
import { JsonDB, Config } from 'node-json-db';
import axios from 'axios';

let server = null;

/**
 * Start the server with the given configuration.
 *
 * Be careful that start will be called multiple times when
 * work with catvodapp. If the server is already running,
 * the stop will be called by engine before start, make sure
 * to return new server every time.
 *
 * @param {Map} config - the config of the server
 * @return {void}
 */
export async function start(config) {
    /**
     * @type {import('fastify').FastifyInstance}
     */
    server = fastify({
        serverFactory: catServerFactory,
        forceCloseConnections: true,
        logger: !!(process.env.NODE_ENV !== 'development'),
        maxParamLength: 10240,
    });
    server.messageToDart = async (data, inReq) => {
        try {
            if (!data.prefix) {
                data.prefix = inReq ? inReq.server.prefix : '';
            }
            let port = 0;
            try {
                if (typeof catDartServerPort === 'function') {
                    port = catDartServerPort();
                } else if (typeof globalThis.catDartServerPort === 'function') {
                    port = globalThis.catDartServerPort();
                } else if (typeof global !== 'undefined' && typeof global.catDartServerPort === 'function') {
                    port = global.catDartServerPort();
                }
            } catch (e) {
                console.warn('[messageToDart] 获取 catDartServerPort 异常:', e.message);
            }

            console.log(`[messageToDart] 目标端口: ${port}, 发送载荷:`, JSON.stringify(data));
            if (!port || port == 0) {
                console.log('[messageToDart] 未检测到客户端监听端口(port=0)，当前处于非客户端宿主环境');
                return null;
            }

            const resp = await axios.post(`http://127.0.0.1:${port}/msg`, data, {
                timeout: 5000,
                headers: { 'Content-Type': 'application/json' },
            });
            console.log(`[messageToDart] 收到客户端响应(状态码 ${resp.status}):`, typeof resp.data === 'object' ? JSON.stringify(resp.data) : resp.data);
            return resp.data;
        } catch (error) {
            console.error('[messageToDart] 通信异常:', error.message, error.response?.data || '');
            return null;
        }
    };
    server.address = function () {
        const result = this.server.address();
        result.url = `http://${result.address}:${result.port}`;
        result.dynamic = result.url;
        return result;
    };
    server.addHook('onError', async (_request, _reply, error) => {
        console.error(error);
        if (!error.statusCode) error.statusCode = 500;
        return error;
    });
    server.stop = false;
    server.config = config;
    // 推荐使用NODE_PATH做db存储的更目录，这个目录在应用中清除缓存时会被清空
    server.db = new JsonDB(new Config((process.env['NODE_PATH'] || '.') + '/db.json', true, true, '/', true));
    server.register(router);
    // 注意 一定要监听ipv4地址 build后 app中使用时 端口使用0让系统自动分配可用端口
    server.listen({ port: process.env['DEV_HTTP_PORT'] || 0, host: '127.0.0.1' });
}

/**
 * Stop the server if it exists.
 *
 */
export async function stop() {
    if (server) {
        server.close();
        server.stop = true;
    }
    server = null;
}
