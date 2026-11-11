import * as HLS from 'hls-parser';
import req from '../../util/req.js';

let url = 'https://cj.ffzyapi.com/api.php/provide/vod/from/ffm3u8';
let categories = [
    '国产剧', '香港剧', '韩国剧', '欧美剧', '台湾剧', '日本剧',
    '海外剧', '泰国剧', '短剧', '动作片', '喜剧片', '爱情片',
    '科幻片', '恐怖片', '剧情片', '战争片', '动漫片', '大陆综艺',
    '港台综艺', '日韩综艺', '欧美综艺', '国产动漫', '日韩动漫',
    '欧美动漫', '港台动漫', '海外动漫', '记录片'
];

async function request(reqUrl) {
    let res = await req(reqUrl, {
        method: 'get',
    });
    return res.data;
}

async function init(inReq, _outResp) {
    const cfg = inReq?.server?.config?.demo_web || inReq?.server?.config?.demo || inReq?.server?.config?.ffm3u8_web;
    if (cfg?.url) {
        url = cfg.url;
    }
    if (cfg?.categories) {
        categories = cfg.categories;
    }
    return {};
}

const testSiteLikes = [];

function updateLikes(list) {
    if (!list || !Array.isArray(list)) return;
    for (const vod of list) {
        const id = vod.vod_id ? vod.vod_id.toString() : '';
        if (!id) continue;
        if (!testSiteLikes.find((item) => item.vod_id === id)) {
            testSiteLikes.push({
                vod_id: id,
                vod_name: (vod.vod_name || '').toString(),
                vod_pic: vod.vod_pic || '',
                vod_remarks: vod.vod_remarks || '',
                type_name: vod.type_name || '',
            });
            if (testSiteLikes.length > 50) {
                testSiteLikes.shift();
            }
        }
    }
}

async function getCategories() {
    try {
        const data = await request(url);
        if (data && data.class) {
            let classes = [];
            for (const cls of data.class) {
                const n = cls.type_name.toString().trim();
                if (categories && categories.length > 0) {
                    if (categories.indexOf(n) < 0) continue;
                }
                classes.push({
                    type_id: cls.type_id.toString(),
                    type_name: n,
                });
            }
            if (categories && categories.length > 0) {
                classes = classes.sort((a, b) => {
                    return categories.indexOf(a.type_name) - categories.indexOf(b.type_name);
                });
            }
            return classes;
        }
    } catch (e) {
        console.error('getCategories error:', e.message);
    }
    return [];
}

async function home(_inReq, _outResp) {
    const data = await request(url);
    let classes = [];
    for (const cls of data.class) {
        const n = cls.type_name.toString().trim();
        if (categories && categories.length > 0) {
            if (categories.indexOf(n) < 0) continue;
        }
        classes.push({
            type_id: cls.type_id.toString(),
            type_name: n,
        });
    }
    if (categories && categories.length > 0) {
        classes = classes.sort((a, b) => {
            return categories.indexOf(a.type_name) - categories.indexOf(b.type_name);
        });
    }
    if (data.list && data.list.length > 0) {
        try {
            const likes = await request(url + `?ac=detail&ids=${data.list.map((v) => v.vod_id).join(',')}`);
            if (likes && likes.list) {
                updateLikes(likes.list);
            }
        } catch (e) {
            console.error('Failed to prefetch likes in home:', e.message);
        }
    }
    return {
        class: classes,
    };
}

async function category(inReq, _outResp) {
    const tid = inReq.body ? inReq.body.id : undefined;
    const pg = inReq.body ? inReq.body.page : undefined;
    let page = pg || 1;
    if (page == 0) page = 1;
    const reqUrl = tid ? `${url}?ac=detail&t=${tid}&pg=${page}` : `${url}?ac=detail&pg=${page}`;
    const data = await request(reqUrl);
    let videos = [];
    if (data && data.list) {
        for (const vod of data.list) {
            videos.push({
                vod_id: vod.vod_id.toString(),
                vod_name: vod.vod_name.toString(),
                vod_pic: vod.vod_pic || '',
                vod_remarks: vod.vod_remarks || '',
                type_name: vod.type_name || '',
            });
        }
        updateLikes(videos);
    }
    return {
        page: parseInt(data.page || page),
        pagecount: data.pagecount || 1,
        total: data.total || videos.length,
        list: videos,
    };
}

async function detail(inReq, _outResp) {
    const ids = !Array.isArray(inReq.body.id) ? [inReq.body.id] : inReq.body.id;
    const videos = [];
    for (const id of ids) {
        const res = await request(url + `?ac=detail&ids=${id}`);
        const data = res?.list?.[0];
        if (!data) continue;
        let vod = {
            vod_id: data.vod_id,
            vod_name: data.vod_name,
            vod_pic: data.vod_pic,
            type_name: data.type_name,
            vod_year: data.vod_year,
            vod_area: data.vod_area,
            vod_remarks: data.vod_remarks,
            vod_actor: data.vod_actor,
            vod_director: data.vod_director,
            vod_content: (data.vod_content || '').trim(),
            vod_play_from: data.vod_play_from,
            vod_play_url: data.vod_play_url,
        };
        vod.likes = testSiteLikes;
        videos.push(vod);
    }
    return {
        list: videos,
    };
}

async function proxy(inReq, outResp) {
    const what = inReq.params.what;
    const purl = decodeURIComponent(inReq.params.ids);
    if (what == 'hls') {
        const resp = await req(purl, {
            method: 'get',
        });
        const plist = HLS.parse(resp.data);
        if (plist.variants) {
            for (const v of plist.variants) {
                if (!v.uri.startsWith('http')) {
                    v.uri = new URL(v.uri, purl).toString();
                }
            }
            plist.variants.map((variant) => {
                variant.uri = inReq.server.prefix + '/proxy/hls/' + encodeURIComponent(variant.uri) + '/.m3u8';
            });
        }
        if (plist.segments) {
            for (const s of plist.segments) {
                if (!s.uri.startsWith('http')) {
                    s.uri = new URL(s.uri, purl).toString();
                }
                if (s.key && s.key.uri && !s.key.uri.startsWith('http')) {
                    s.key.uri = new URL(s.key.uri, purl).toString();
                }
            }
            plist.segments.map((seg) => {
                seg.uri = inReq.server.prefix + '/proxy/ts/' + encodeURIComponent(seg.uri) + '/.ts';
            });
        }
        const hls = HLS.stringify(plist);
        let hlsHeaders = {};
        if (resp.headers['content-length']) {
            Object.assign(hlsHeaders, resp.headers, {
                'content-length': hls.length.toString(),
            });
        } else {
            Object.assign(hlsHeaders, resp.headers);
        }
        delete hlsHeaders['transfer-encoding'];
        delete hlsHeaders['cache-control'];
        if (hlsHeaders['content-encoding'] == 'gzip') {
            delete hlsHeaders['content-encoding'];
        }
        outResp.code(resp.status).headers(hlsHeaders);
        return hls;
    } else {
        outResp.redirect(purl);
        return;
    }
}

async function play(inReq, _outResp) {
    const id = inReq.body.id;
    if (id.indexOf('.m3u8') < 0) {
        const sniffer = await inReq.server.messageToDart({
            action: 'sniff',
            opt: {
                url: id,
                timeout: 10000,
                rule: 'http((?!http).){12,}?\\.m3u8(?!\\?)',
            },
        }, inReq);
        if (sniffer && sniffer.url) {
            const hds = {};
            if (sniffer.headers) {
                if (sniffer.headers['user-agent']) {
                    hds['User-Agent'] = sniffer.headers['user-agent'];
                }
                if (sniffer.headers['referer']) {
                    hds['Referer'] = sniffer.headers['referer'];
                }
            }
            return {
                parse: 0,
                url: sniffer.url,
                header: hds,
            };
        }
    }
    return {
        parse: 0,
        url: id,
        header: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
    };
}

async function search(inReq, _outResp) {
    const wd = inReq.body.wd;
    const pg = inReq.body.page || 1;
    const data = await request(`${url}?ac=detail&wd=${encodeURIComponent(wd)}&pg=${pg}`);
    let videos = [];
    if (data && data.list) {
        for (const vod of data.list) {
            videos.push({
                vod_id: vod.vod_id.toString(),
                vod_name: vod.vod_name.toString(),
                vod_pic: vod.vod_pic || '',
                vod_remarks: vod.vod_remarks || '',
                type_name: vod.type_name || '',
            });
        }
        updateLikes(videos);
    }
    return {
        page: parseInt(data.page || pg),
        pagecount: data.pagecount || 1,
        total: data.total || videos.length,
        list: videos,
    };
}

// -------------------------------------------------------------
// Type 7 Web 视频站 API & Web 主页实现
// -------------------------------------------------------------

async function handleAction(inReq, _outResp) {
    const body = inReq.body || inReq.query || {};
    const actionName = body.action;
    const opt = body.opt || {};

    if (!actionName) {
        return { success: false, message: '缺少 action 参数' };
    }

    try {
        const result = await inReq.server.messageToDart({
            action: actionName,
            opt: opt,
        }, inReq);

        let parsedResult = result;
        if (typeof parsedResult === 'string') {
            try {
                parsedResult = JSON.parse(parsedResult);
            } catch (_) {}
        }

        const inApp = (typeof globalThis.catDartServerPort === 'function' ? globalThis.catDartServerPort() : 0) > 0;

        // 若客户端返回了标准的 { success, message, data } 封套，直接透明透传
        if (parsedResult && typeof parsedResult === 'object' && typeof parsedResult.success === 'boolean') {
            return {
                ...parsedResult,
                action: actionName,
                opt: opt,
                inApp: inApp,
                result: parsedResult,
            };
        }

        return {
            success: true,
            action: actionName,
            opt: opt,
            inApp: inApp,
            result: result,
        };
    } catch (err) {
        return {
            success: false,
            message: err.message,
        };
    }
}

async function openAction(inReq, _outResp) {
    const params = Object.assign({}, inReq.query, inReq.body);
    const extData = params.extData;
    const vodId = params.id || params.vod_id || extData?.vodId || extData?.vod_id;
    const vodName = params.name || params.vod_name || extData?.name || extData?.vod_name || '';
    const vodPic = params.pic || params.vod_pic || extData?.pic || extData?.vod_pic || '';

    if (!vodId && !extData) {
        return { success: false, message: '缺少 vod_id 或 extData 参数' };
    }

    const opt = extData ? { extData } : {
        vod_id: String(vodId),
        vod_name: String(vodName),
        vod_pic: String(vodPic),
    };

    const result = await inReq.server.messageToDart({
        action: 'openVodDetail',
        opt,
    }, inReq);

    const inApp = (typeof globalThis.catDartServerPort === 'function' ? globalThis.catDartServerPort() : 0) > 0;
    return {
        success: true,
        action: 'openVodDetail',
        inApp,
        result,
    };
}

async function playAction(inReq, _outResp) {
    const params = Object.assign({}, inReq.query, inReq.body);
    const extData = params.extData;
    const vodId = params.id || params.vod_id || extData?.vodId || extData?.vod_id;
    const vodName = params.name || params.vod_name || extData?.name || extData?.vod_name || '';
    const vodPic = params.pic || params.vod_pic || extData?.pic || extData?.vod_pic || '';

    if (!vodId && !extData) {
        return { success: false, message: '缺少 vod_id 或 extData 参数' };
    }

    const opt = extData ? { extData } : {
        vod_id: String(vodId),
        vod_name: String(vodName),
        vod_pic: String(vodPic),
    };

    const result = await inReq.server.messageToDart({
        action: 'openVideoPlayer',
        opt,
    }, inReq);

    const inApp = (typeof globalThis.catDartServerPort === 'function' ? globalThis.catDartServerPort() : 0) > 0;
    return {
        success: true,
        action: 'openVideoPlayer',
        inApp,
        result,
    };
}

async function searchAction(inReq, _outResp) {
    const params = Object.assign({}, inReq.query, inReq.body);
    const wd = params.wd || params.keyword || params.kw || '';

    const result = await inReq.server.messageToDart({
        action: 'openSearch',
        opt: {
            wd: String(wd),
        },
    }, inReq);

    const inApp = (typeof globalThis.catDartServerPort === 'function' ? globalThis.catDartServerPort() : 0) > 0;
    return {
        success: true,
        action: 'openSearch',
        opt: { wd: String(wd) },
        inApp,
        result,
    };
}

async function apiVideos(inReq, _outResp) {
    const q = inReq.query || {};
    const tid = q.tid;
    const page = parseInt(q.page || 1);
    const wd = q.wd ? q.wd.trim() : '';

    let reqUrl = '';
    if (wd) {
        reqUrl = `${url}?ac=detail&wd=${encodeURIComponent(wd)}&pg=${page}`;
    } else if (tid) {
        reqUrl = `${url}?ac=detail&t=${tid}&pg=${page}`;
    } else {
        reqUrl = `${url}?ac=detail&pg=${page}`;
    }

    try {
        const data = await request(reqUrl);
        const videos = [];
        if (data && data.list) {
            for (const vod of data.list) {
                videos.push({
                    vod_id: vod.vod_id.toString(),
                    vod_name: vod.vod_name.toString(),
                    vod_pic: vod.vod_pic || '',
                    vod_remarks: vod.vod_remarks || '',
                    type_name: vod.type_name || '',
                    vod_year: vod.vod_year || '',
                    vod_area: vod.vod_area || '',
                });
            }
            updateLikes(videos);
        }
        return {
            page: parseInt(data.page || page),
            pagecount: parseInt(data.pagecount || 1),
            total: parseInt(data.total || videos.length),
            list: videos,
        };
    } catch (err) {
        return {
            page: page,
            pagecount: 1,
            total: 0,
            list: [],
            error: err.message,
        };
    }
}

/**
 * 健壮解析客户端 messageToDart({ action: 'queryHistory' }) 返回的真实播放记录
 * 优先遵循标准封套: { success: true, message: '...', data: [...] }
 * 兼容数组直接返回、字符串 JSON、{ data: [...] }、{ list: [...] }、{ result: [...] } 等多种历史形态
 * @param {any} res
 * @returns {Array}
 */
function extractHistoryList(res) {
    if (!res) return [];
    if (typeof res === 'string') {
        try {
            res = JSON.parse(res);
        } catch (e) {
            console.error('[queryHistory] JSON parse string failed:', e.message);
            return [];
        }
    }
    // 1. 若遵循标准封套且明确指示失败/未授权
    if (res && typeof res === 'object' && res.success === false) {
        console.warn('[queryHistory] 客户端返回失败或未授权:', res.message || '未知原因');
        return [];
    }
    // 2. 标准封套规范字段：res.data 是数组
    if (res && Array.isArray(res.data)) return res.data;
    // 3. 兼容历史或变体形态
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.list)) return res.list;
    if (res && Array.isArray(res.result)) return res.result;
    if (res && res.data && Array.isArray(res.data.list)) return res.data.list;
    if (res && res.data && Array.isArray(res.data.data)) return res.data.data;
    if (res && typeof res === 'object') {
        for (const k of Object.keys(res)) {
            if (Array.isArray(res[k])) return res[k];
        }
    }
    return [];
}

async function apiHistory(inReq, _outResp) {
    try {
        const count = Math.min(parseInt(inReq.query?.count || inReq.body?.count || 10), 10);
        console.log(`[apiHistory] 发起客户端 queryHistory 请求(count=${count})...`);
        const res = await inReq.server.messageToDart({
            action: 'queryHistory',
            opt: { count },
        }, inReq);

        let parsed = res;
        if (typeof parsed === 'string') {
            try {
                parsed = JSON.parse(parsed);
            } catch (_) {}
        }

        const isEnvelope = parsed && typeof parsed === 'object' && typeof parsed.success === 'boolean';
        const list = extractHistoryList(parsed);
        const success = isEnvelope ? parsed.success : true;
        const message = isEnvelope
            ? (parsed.message || (success ? 'queryHistory success' : 'queryHistory failed'))
            : (list.length > 0 ? 'queryHistory success' : 'no history');

        console.log(`[apiHistory] 客户端返回数据解析完成: success=${success}, 记录数=${list.length}`);
        return {
            success,
            message,
            count: list.length,
            list,
            data: list,
            rawType: typeof res,
        };
    } catch (e) {
        console.error('[apiHistory] 请求异常:', e.message);
        return { success: false, message: e.message, count: 0, list: [], data: [] };
    }
}

async function historyAction(inReq, _outResp) {
    const params = Object.assign({}, inReq.query, inReq.body);
    const count = Math.min(parseInt(params.count || 10), 10);
    const res = await inReq.server.messageToDart({
        action: 'queryHistory',
        opt: { count },
    }, inReq);

    let parsed = res;
    if (typeof parsed === 'string') {
        try {
            parsed = JSON.parse(parsed);
        } catch (_) {}
    }

    const isEnvelope = parsed && typeof parsed === 'object' && typeof parsed.success === 'boolean';
    const list = extractHistoryList(parsed);
    const success = isEnvelope ? parsed.success : true;
    const message = isEnvelope
        ? (parsed.message || (success ? 'queryHistory success' : 'queryHistory failed'))
        : 'queryHistory success';

    return {
        success,
        message,
        action: 'queryHistory',
        opt: { count },
        count: list.length,
        list,
        data: list,
    };
}

// -------------------------------------------------------------
// Web 主页 HTML 渲染模板
// -------------------------------------------------------------

function renderWebPage({ prefix, categories: classList, initialVideos, pageInfo, historyList }) {
    const safeCategories = JSON.stringify(classList || []).replace(/</g, '\\u003c');
    const safeVideos = JSON.stringify(initialVideos || []).replace(/</g, '\\u003c');
    const safePageInfo = JSON.stringify(pageInfo || { page: 1, pagecount: 1, total: 0 }).replace(/</g, '\\u003c');
    const safeHistory = JSON.stringify(historyList || []).replace(/</g, '\\u003c');

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>Web 视频示例 (Type 7)</title>
    <style>
        :root {
            --bg: #0b0f19;
            --bg-card: #151d30;
            --bg-card-hover: #1c2740;
            --text-main: #f8fafc;
            --text-sub: #94a3b8;
            --text-muted: #64748b;
            --border: rgba(255, 255, 255, 0.08);
            --primary: #6366f1;
            --primary-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
            --accent: #8b5cf6;
            --accent-pink: #ec4899;
            --radius-lg: 14px;
            --radius-md: 10px;
            --radius-sm: 6px;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-tap-highlight-color: transparent;
        }

        html, body {
            width: 100%;
            min-height: 100%;
            background-color: var(--bg);
            margin: 0;
            padding: 0;
            overflow-x: hidden;
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
        }

        /* 隐藏全局滚动条轨道占用，防止 WebView 右侧留出 15px 系统滚动条间隙 */
        ::-webkit-scrollbar {
            width: 0px !important;
            height: 0px !important;
            display: none !important;
            background: transparent !important;
        }

        body {
            color: var(--text-main);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
            padding-bottom: calc(40px + env(safe-area-inset-bottom, 20px));
            user-select: none;
            -webkit-user-select: none;
        }

        /* 顶部导航栏 */
        .navbar {
            position: sticky;
            top: 0;
            z-index: 100;
            width: 100%;
            background: rgba(11, 15, 25, 0.88);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid var(--border);
            padding: calc(10px + env(safe-area-inset-top, 0px)) 16px 10px 16px;
        }

        .nav-inner {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
        }

        .brand-box {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
        }

        .brand-logo {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: var(--primary-gradient);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: bold;
            color: #fff;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
        }

        .brand-name {
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 0.5px;
            background: var(--primary-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .brand-badge {
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 4px;
            background: rgba(99, 102, 241, 0.15);
            color: #a5b4fc;
            border: 1px solid rgba(99, 102, 241, 0.3);
            font-weight: 500;
        }

        .nav-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .btn-icon-text {
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid var(--border);
            color: var(--text-main);
            border-radius: var(--radius-sm);
            padding: 6px 12px;
            font-size: 13px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: all 0.2s ease;
        }

        .btn-icon-text:active {
            transform: scale(0.96);
            background: rgba(255, 255, 255, 0.12);
        }

        .btn-native-search {
            background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.2));
            border-color: rgba(236, 72, 153, 0.4);
            color: #f472b6;
        }

        /* 搜索框区域 */
        .search-section {
            width: 100%;
            margin: 14px 0 8px 0;
            padding: 0 16px;
        }

        .search-bar-wrap {
            display: flex;
            align-items: center;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            padding: 4px 6px 4px 14px;
            transition: border-color 0.2s;
        }

        .search-bar-wrap:focus-within {
            border-color: var(--primary);
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
        }

        .search-input {
            flex: 1;
            background: transparent;
            border: none;
            outline: none;
            color: var(--text-main);
            font-size: 14px;
            min-width: 100px;
        }

        .search-input::placeholder {
            color: var(--text-muted);
        }

        .search-btn-group {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .btn-search {
            background: var(--primary);
            color: white;
            border: none;
            border-radius: var(--radius-sm);
            padding: 8px 14px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-search:active {
            transform: scale(0.95);
            background: var(--primary-hover);
        }

        .btn-search-native {
            background: var(--surface-light);
            color: var(--text-main);
            border: 1px solid var(--border);
        }

        .btn-search-native:hover {
            border-color: var(--primary);
            color: var(--primary);
        }

        .btn-search-native:active {
            background: var(--surface);
        }

        .btn-clear {
            background: transparent;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 6px;
            font-size: 14px;
            display: none;
        }

        /* 主体容器 */
        .main-container {
            width: 100%;
            margin: 0;
            padding: 0 16px;
        }

        /* 最近在看历史栏 */
        .history-section {
            width: 100%;
            margin-top: 18px;
            margin-bottom: 12px;
            overflow: hidden;
            display: none;
        }

        .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
        }

        .section-title {
            font-size: 16px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 6px;
            color: var(--text-main);
        }

        .btn-refresh-history {
            background: transparent;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 2px 6px;
            font-size: 13px;
            border-radius: 4px;
            transition: all 0.2s ease;
        }

        .btn-refresh-history:active {
            transform: rotate(180deg);
            color: var(--primary);
        }

        .section-subtitle {
            font-size: 12px;
            color: var(--text-muted);
        }

        .history-scroll {
            display: flex;
            gap: 12px;
            overflow-x: auto;
            padding-bottom: 6px;
            scrollbar-width: none;
        }

        .history-scroll::-webkit-scrollbar {
            display: none;
        }

        .history-card {
            flex: 0 0 140px;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            overflow: hidden;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .history-card:active {
            transform: scale(0.97);
        }

        .history-thumb-wrap {
            position: relative;
            width: 100%;
            height: 80px;
            background: #1e293b;
        }

        .history-thumb {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .history-badge {
            position: absolute;
            bottom: 7px;
            right: 4px;
            background: rgba(0, 0, 0, 0.75);
            color: #e2e8f0;
            font-size: 10px;
            padding: 2px 5px;
            border-radius: 4px;
            z-index: 1;
        }

        .history-progress-track {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 3px;
            background: rgba(0, 0, 0, 0.5);
            overflow: hidden;
            z-index: 2;
        }

        .history-progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #6366f1, #ec4899);
            border-radius: 0 2px 2px 0;
            transition: width 0.3s ease;
        }

        .history-play-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 26px;
            height: 26px;
            background: rgba(0, 0, 0, 0.65);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 10px;
            transition: all 0.2s ease;
            z-index: 1;
        }

        .history-card:hover .history-play-icon {
            background: var(--primary);
            transform: translate(-50%, -50%) scale(1.1);
        }

        .history-info {
            padding: 6px 8px;
        }

        .history-name {
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: var(--text-main);
        }

        .history-sub-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 4px;
            margin-top: 3px;
        }

        .history-sub {
            font-size: 10px;
            color: var(--text-muted);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
        }

        .history-progress-pill {
            font-size: 9px;
            color: #a5b4fc;
            background: rgba(99, 102, 241, 0.15);
            border: 1px solid rgba(99, 102, 241, 0.25);
            padding: 1px 4px;
            border-radius: 3px;
            white-space: nowrap;
            font-weight: 500;
            flex-shrink: 0;
        }

        /* 分类导航栏 */
        .category-nav-wrap {
            width: 100%;
            margin: 14px 0 18px 0;
            position: relative;
            overflow: hidden;
        }

        .category-scroll {
            display: flex;
            align-items: center;
            gap: 8px;
            overflow-x: auto;
            scrollbar-width: none;
            padding: 4px 2px;
        }

        .category-scroll::-webkit-scrollbar {
            display: none;
        }

        .cat-pill {
            flex: 0 0 auto;
            padding: 7px 14px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 500;
            color: var(--text-sub);
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border);
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .cat-pill:active {
            transform: scale(0.95);
        }

        .cat-pill.active {
            background: var(--primary-gradient);
            color: #ffffff;
            border-color: transparent;
            box-shadow: 0 3px 12px rgba(99, 102, 241, 0.35);
        }

        /* 视频卡片网格 - 弹性自适应铺满整屏宽，右侧不留空位 */
        .video-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
            gap: 12px;
            width: 100%;
        }

        @media (min-width: 600px) {
            .video-grid {
                grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
                gap: 14px;
            }
        }

        @media (min-width: 1024px) {
            .video-grid {
                grid-template-columns: repeat(auto-fill, minmax(165px, 1fr));
                gap: 16px;
            }
        }

        .video-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s ease, border-color 0.22s ease;
            position: relative;
        }

        .video-card:hover {
            transform: translateY(-4px);
            border-color: rgba(99, 102, 241, 0.4);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
        }

        .poster-wrap {
            position: relative;
            width: 100%;
            aspect-ratio: 3 / 4.2;
            background: #141b2b;
            overflow: hidden;
            cursor: pointer;
        }

        .poster-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
            display: block;
        }

        .video-card:hover .poster-img {
            transform: scale(1.05);
        }

        .badge-remarks {
            position: absolute;
            top: 8px;
            right: 8px;
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            color: #38bdf8;
            font-size: 11px;
            font-weight: 600;
            padding: 3px 7px;
            border-radius: 6px;
            border: 1px solid rgba(56, 189, 248, 0.3);
            max-width: 80%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .badge-type {
            position: absolute;
            bottom: 8px;
            left: 8px;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            color: #cbd5e1;
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 4px;
        }

        /* 快捷播放悬浮按钮 */
        .play-overlay-btn {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.25);
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        .video-card:hover .play-overlay-btn {
            opacity: 1;
        }

        .play-icon-circle {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: var(--primary-gradient);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            box-shadow: 0 4px 16px rgba(99, 102, 241, 0.6);
            transform: scale(0.9);
            transition: transform 0.2s ease;
        }

        .video-card:hover .play-icon-circle {
            transform: scale(1);
        }

        .card-body {
            padding: 10px 10px 12px 10px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            flex: 1;
        }

        .vod-title {
            font-size: 13px;
            font-weight: 600;
            line-height: 1.35;
            color: var(--text-main);
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            cursor: pointer;
            margin-bottom: 8px;
            transition: color 0.15s;
        }

        .vod-title:hover {
            color: var(--primary);
        }

        .card-btn-bar {
            display: flex;
            gap: 6px;
            margin-top: auto;
        }

        .btn-card-action {
            flex: 1;
            padding: 5px 0;
            font-size: 11px;
            font-weight: 500;
            border-radius: var(--radius-sm);
            border: 1px solid var(--border);
            background: rgba(255, 255, 255, 0.05);
            color: var(--text-sub);
            cursor: pointer;
            text-align: center;
            transition: all 0.15s ease;
        }

        .btn-card-action:active {
            transform: scale(0.95);
        }

        .btn-card-detail:hover {
            background: rgba(99, 102, 241, 0.15);
            color: #c7d2fe;
            border-color: rgba(99, 102, 241, 0.4);
        }

        .btn-card-play {
            background: rgba(139, 92, 246, 0.15);
            border-color: rgba(139, 92, 246, 0.35);
            color: #d8b4fe;
        }

        .btn-card-play:hover {
            background: var(--primary-gradient);
            color: #ffffff;
            border-color: transparent;
        }

        /* 加载中与空状态 */
        .loading-wrap {
            display: none;
            text-align: center;
            padding: 40px 0;
            color: var(--text-sub);
        }

        .spinner {
            display: inline-block;
            width: 28px;
            height: 28px;
            border: 3px solid rgba(99, 102, 241, 0.2);
            border-top-color: var(--primary);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .empty-wrap {
            display: none;
            text-align: center;
            padding: 60px 0;
            color: var(--text-muted);
        }

        .empty-icon {
            font-size: 42px;
            margin-bottom: 8px;
        }

        /* 翻页加载更多 */
        .load-more-wrap {
            text-align: center;
            margin: 26px 0 10px;
        }

        .btn-load-more {
            padding: 10px 28px;
            border-radius: 24px;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid var(--border);
            color: var(--text-main);
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-load-more:active {
            transform: scale(0.96);
            background: rgba(99, 102, 241, 0.2);
            border-color: var(--primary);
        }

        /* 悬浮提示 Toast */
        .toast-box {
            position: fixed;
            bottom: calc(24px + env(safe-area-inset-bottom, 20px));
            left: 50%;
            transform: translateX(-50%) translateY(30px);
            background: rgba(15, 23, 42, 0.94);
            border: 1px solid rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            color: #ffffff;
            padding: 10px 18px;
            border-radius: 24px;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
            z-index: 1000;
            opacity: 0;
            pointer-events: none;
            transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
            max-width: 90vw;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .toast-box.show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }

        .toast-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--primary);
        }
    </style>
</head>
<body>
    <!-- 顶部导航栏 -->
    <nav class="navbar">
        <div class="nav-inner">
            <div class="brand-box" onclick="resetToHome()">
                <div class="brand-logo">⚡</div>
                <div>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span class="brand-name">Web 视频示例</span>
                        <span class="brand-badge">Type 7 Web</span>
                    </div>
                </div>
            </div>
            <div class="nav-actions">
                <button class="btn-icon-text btn-native-search" onclick="openNativeSearch()">
                    <span>🔍</span>
                    <span>聚合搜索</span>
                </button>
                <button class="btn-icon-text" onclick="refreshCurrent()">
                    <span>🔄</span>
                </button>
            </div>
        </div>
    </nav>

    <!-- 搜索栏 -->
    <section class="search-section">
        <div class="search-bar-wrap">
            <span style="color:var(--text-muted); margin-right:8px; font-size:15px;">🔍</span>
            <input type="text" id="search-input" class="search-input" placeholder="搜索电影、剧集、动漫、综艺..." autocomplete="off">
            <button id="search-clear" class="btn-clear" onclick="clearSearch()">✕</button>
            <div class="search-btn-group">
                <button class="btn-search" onclick="doSearch()">搜本站</button>
                <button class="btn-search btn-search-native" onclick="openNativeSearch()" title="调起客户端原生聚合搜索">全网搜</button>
            </div>
        </div>
    </section>

    <!-- 主体区域 -->
    <main class="main-container">
        <!-- 最近在看 (联动 queryHistory) -->
        <section id="history-section" class="history-section">
            <div class="section-header">
                <div class="section-title">
                    <span>🕒</span>
                    <span>最近在看</span>
                    <button class="btn-refresh-history" onclick="refreshHistory(true)" title="重新拉取客户端观看记录">🔄</button>
                </div>
                <span class="section-subtitle">点击继续观看</span>
            </div>
            <div id="history-scroll" class="history-scroll"></div>
        </section>

        <!-- 分类滚动栏 -->
        <section class="category-nav-wrap">
            <div id="category-scroll" class="category-scroll">
                <button class="cat-pill active" data-tid="" data-name="🔥 最新推荐" onclick="selectCategory('', '🔥 最新推荐', this)">🔥 最新推荐</button>
            </div>
        </section>

        <!-- 分类标头 -->
        <div class="section-header">
            <div class="section-title">
                <span id="current-cat-icon">🎬</span>
                <span id="current-cat-title">🔥 最新推荐</span>
            </div>
            <span id="current-cat-count" class="section-subtitle">加载中...</span>
        </div>

        <!-- 视频列表网格 -->
        <div id="video-grid" class="video-grid"></div>

        <!-- 加载动画 -->
        <div id="loading-wrap" class="loading-wrap">
            <div class="spinner"></div>
            <div style="margin-top: 8px; font-size: 13px;">正在加载内容...</div>
        </div>

        <!-- 空状态 -->
        <div id="empty-wrap" class="empty-wrap">
            <div class="empty-icon">📭</div>
            <div>暂无相关视频</div>
        </div>

        <!-- 加载更多 -->
        <div id="load-more-wrap" class="load-more-wrap" style="display:none;">
            <button id="btn-load-more" class="btn-load-more" onclick="loadMore()">加载更多</button>
        </div>
    </main>

    <!-- 浮层 Toast -->
    <div id="toast-box" class="toast-box">
        <div class="toast-dot"></div>
        <span id="toast-text">提示信息</span>
    </div>

    <!-- 预埋数据与逻辑脚本 -->
    <script>
        const API_PREFIX = '${prefix}';
        const rawCategories = ${safeCategories};
        const initialVideos = ${safeVideos};
        const initialPageInfo = ${safePageInfo};
        const rawHistory = ${safeHistory};

        const FALLBACK_POSTER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='420' viewBox='0 0 300 420'><rect width='300' height='420' fill='%23151d30'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2364748b' font-family='sans-serif' font-size='15'>暂无封面</text></svg>";

        let currentCategory = '';
        let currentCategoryName = '🔥 最新推荐';
        let currentWd = '';
        let currentPage = initialPageInfo.page || 1;
        let pageCount = initialPageInfo.pagecount || 1;
        let totalCount = initialPageInfo.total || 0;
        let isLoading = false;

        // Toast 提示
        let toastTimer = null;
        function showToast(msg, isSuccess = true) {
            const toast = document.getElementById('toast-box');
            const toastText = document.getElementById('toast-text');
            toastText.textContent = msg;
            toast.classList.add('show');
            if (toastTimer) clearTimeout(toastTimer);
            toastTimer = setTimeout(() => {
                toast.classList.remove('show');
            }, 2600);
        }

        // 调用壳子原生交互 Action
        async function triggerAction(actionName, opt) {
            showToast('正在调起 ' + actionName + '...', true);
            try {
                const res = await fetch(API_PREFIX + '/action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: actionName, opt: opt })
                });
                const data = await res.json();
                if (data.success) {
                    if (data.inApp) {
                        showToast('已唤起客户端原生界面', true);
                    } else {
                        showToast('[调试] 已发送 ' + actionName + ' (App内将直接拉起原生页)', true);
                    }
                } else {
                    showToast('调用失败: ' + (data.message || '未知错误'), false);
                }
                return data;
            } catch (err) {
                showToast('请求异常: ' + err.message, false);
            }
        }

        // 点击打开原生视频详情页
        function openDetail(vodId, vodName, vodPic) {
            triggerAction('openVodDetail', {
                vod_id: String(vodId),
                vod_name: String(vodName || ''),
                vod_pic: String(vodPic || ''),
            });
        }

        // 点击直接唤起原生播放器起播
        function playVideo(vodId, vodName, vodPic) {
            triggerAction('openVideoPlayer', {
                vod_id: String(vodId),
                vod_name: String(vodName || ''),
                vod_pic: String(vodPic || ''),
            });
        }

        // 跳转原生聚合搜索
        function openNativeSearch() {
            const wd = document.getElementById('search-input').value.trim();
            triggerAction('openSearch', { wd: wd });
        }

        // 渲染单个视频卡片
        function createVideoCardHtml(vod) {
            const safeName = (vod.vod_name || '未知片名').replace(/"/g, '&quot;');
            const safePic = vod.vod_pic || FALLBACK_POSTER;
            const remarks = vod.vod_remarks ? \`<div class="badge-remarks">\${vod.vod_remarks}</div>\` : '';
            const typeBadge = vod.type_name ? \`<div class="badge-type">\${vod.type_name}</div>\` : '';

            return \`
            <div class="video-card">
                <div class="poster-wrap" onclick="openDetail('\${vod.vod_id}', '\${safeName}', '\${safePic}')">
                    <img class="poster-img" src="\${safePic}" alt="\${safeName}" loading="lazy" onerror="this.onerror=null;this.src='\${FALLBACK_POSTER}';">
                    \${remarks}
                    \${typeBadge}
                    <div class="play-overlay-btn" title="立即播放" onclick="event.stopPropagation(); playVideo('\${vod.vod_id}', '\${safeName}', '\${safePic}')">
                        <div class="play-icon-circle">▶</div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="vod-title" title="\${safeName}" onclick="openDetail('\${vod.vod_id}', '\${safeName}', '\${safePic}')">\${safeName}</div>
                    <div class="card-btn-bar">
                        <button class="btn-card-action btn-card-detail" onclick="openDetail('\${vod.vod_id}', '\${safeName}', '\${safePic}')">详情</button>
                        <button class="btn-card-action btn-card-play" onclick="playVideo('\${vod.vod_id}', '\${safeName}', '\${safePic}')">▶ 播放</button>
                    </div>
                </div>
            </div>
            \`;
        }

        // 渲染卡片列表
        function renderVideos(list, append = false) {
            const grid = document.getElementById('video-grid');
            const emptyWrap = document.getElementById('empty-wrap');
            const loadMoreWrap = document.getElementById('load-more-wrap');

            if (!append) {
                grid.innerHTML = '';
            }

            if (!list || list.length === 0) {
                if (!append) {
                    emptyWrap.style.display = 'block';
                    loadMoreWrap.style.display = 'none';
                }
                return;
            }

            emptyWrap.style.display = 'none';
            const html = list.map(vod => createVideoCardHtml(vod)).join('');
            grid.insertAdjacentHTML('beforeend', html);

            // 更新加载更多按钮状态
            if (currentPage < pageCount) {
                loadMoreWrap.style.display = 'block';
            } else {
                loadMoreWrap.style.display = 'none';
            }

            updateCountText();
        }

        // 更新计数文字
        function updateCountText() {
            const countEl = document.getElementById('current-cat-count');
            if (totalCount > 0) {
                countEl.textContent = \`第 \${currentPage} / \${pageCount} 页 (共 \${totalCount} 部)\`;
            } else {
                countEl.textContent = \`第 \${currentPage} 页\`;
            }
        }

        // 初始化分类导航
        function initCategories() {
            const nav = document.getElementById('category-scroll');
            if (Array.isArray(rawCategories)) {
                rawCategories.forEach(cat => {
                    const btn = document.createElement('button');
                    btn.className = 'cat-pill';
                    btn.dataset.tid = cat.type_id;
                    btn.dataset.name = cat.type_name;
                    btn.textContent = cat.type_name;
                    btn.onclick = () => selectCategory(cat.type_id, cat.type_name, btn);
                    nav.appendChild(btn);
                });
            }
        }

        // 选择分类
        function selectCategory(tid, name, el) {
            if (isLoading) return;
            currentCategory = tid;
            currentCategoryName = name;
            currentWd = '';
            currentPage = 1;

            document.querySelectorAll('.cat-pill').forEach(btn => btn.classList.remove('active'));
            if (el) el.classList.add('active');

            document.getElementById('current-cat-title').textContent = name;
            document.getElementById('search-input').value = '';
            document.getElementById('search-clear').style.display = 'none';

            loadVideos(1, false);
        }

        // 搜索本站
        function doSearch() {
            const kw = document.getElementById('search-input').value.trim();
            if (!kw) {
                resetToHome();
                return;
            }
            currentWd = kw;
            currentCategory = '';
            currentPage = 1;

            document.querySelectorAll('.cat-pill').forEach(btn => btn.classList.remove('active'));
            document.getElementById('current-cat-title').textContent = '🔍 搜索: "' + kw + '"';
            document.getElementById('search-clear').style.display = 'block';

            loadVideos(1, false);
        }

        // 清空搜索
        function clearSearch() {
            document.getElementById('search-input').value = '';
            document.getElementById('search-clear').style.display = 'none';
            resetToHome();
        }

        // 重置回首页推荐
        function resetToHome() {
            const firstPill = document.querySelector('.cat-pill[data-tid=""]');
            selectCategory('', '🔥 最新推荐', firstPill);
        }

        // 刷新当前页面
        function refreshCurrent() {
            loadVideos(currentPage, false);
            loadHistory();
        }

        // 加载更多
        function loadMore() {
            if (isLoading || currentPage >= pageCount) return;
            loadVideos(currentPage + 1, true);
        }

        // 核心加载视频方法
        async function loadVideos(page, append = false) {
            isLoading = true;
            const loadingWrap = document.getElementById('loading-wrap');
            const loadMoreBtn = document.getElementById('btn-load-more');

            if (!append) {
                loadingWrap.style.display = 'block';
            } else {
                loadMoreBtn.textContent = '正在加载中...';
            }

            try {
                let reqUrl = API_PREFIX + '/api/videos?page=' + page;
                if (currentWd) {
                    reqUrl += '&wd=' + encodeURIComponent(currentWd);
                } else if (currentCategory) {
                    reqUrl += '&tid=' + currentCategory;
                }

                const res = await fetch(reqUrl);
                const data = await res.json();

                currentPage = data.page || page;
                pageCount = data.pagecount || 1;
                totalCount = data.total || 0;

                renderVideos(data.list || [], append);
            } catch (err) {
                showToast('加载失败: ' + err.message, false);
            } finally {
                isLoading = false;
                loadingWrap.style.display = 'none';
                loadMoreBtn.textContent = '加载更多';
            }
        }

        // 点击历史记录卡片（推荐携带 extData 快照直跳，无缝秒开）
        function openHistoryCard(idx) {
            const item = window.__historyList && window.__historyList[idx];
            if (!item) return;

            if (item.extData) {
                // 推荐规范：直接将 extData 原样传入 openVodDetail
                triggerAction('openVodDetail', { extData: item.extData });
            } else {
                openDetail(item.vod_id || item.vodId, item.vod_name || item.name, item.vod_pic || item.pic);
            }
        }

        // 点击历史记录卡片播放图标（直接调起播放器）
        function playHistoryCard(idx, event) {
            if (event) event.stopPropagation();
            const item = window.__historyList && window.__historyList[idx];
            if (!item) return;

            if (item.extData) {
                // 推荐规范：直接将 extData 原样传入 openVideoPlayer
                triggerAction('openVideoPlayer', { extData: item.extData });
            } else {
                playVideo(item.vod_id || item.vodId, item.vod_name || item.name, item.vod_pic || item.pic);
            }
        }

        // 格式化时间为 mm:ss 或 hh:mm:ss
        function formatDuration(seconds) {
            const sec = Math.max(0, Math.floor(Number(seconds) || 0));
            const m = Math.floor(sec / 60);
            const s = sec % 60;
            if (m >= 60) {
                const h = Math.floor(m / 60);
                const remM = m % 60;
                return (h < 10 ? '0' + h : h) + ':' + (remM < 10 ? '0' + remM : remM) + ':' + (s < 10 ? '0' + s : s);
            }
            return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
        }

        // 渲染最近在看历史记录（支持展示原生播放进度条与百分比）
        function renderHistory(hist) {
            const histSec = document.getElementById('history-section');
            const histScroll = document.getElementById('history-scroll');

            if (!Array.isArray(hist) || hist.length === 0) {
                histSec.style.display = 'none';
                return;
            }

            window.__historyList = hist;
            histSec.style.display = 'block';
            histScroll.innerHTML = hist.map((item, idx) => {
                const name = item.vod_name || item.name || item.vodName || item.title || '未知片名';
                const pic = item.vod_pic || item.pic || item.vodPic || item.cover || FALLBACK_POSTER;
                const ep = item.episode_name || item.ep || item.epName || item.episode || item.vod_remarks || item.remarks || '观看记录';
                const line = item.line_from || item.line || item.lineFrom || item.source || '';
                const progressSec = Number(item.progress_seconds || item.progressSeconds || 0);
                const durationSec = Number(item.duration_seconds || item.durationSeconds || 0);

                let progressPercent = 0;
                let progressText = '';
                if (durationSec > 0 && progressSec > 0) {
                    progressPercent = Math.min(100, Math.max(1, Math.round((progressSec / durationSec) * 100)));
                    progressText = progressPercent >= 98 ? '已看完' : (progressPercent + '%');
                } else if (progressSec > 0) {
                    progressText = formatDuration(progressSec);
                }

                return \`
                <div class="history-card" onclick="openHistoryCard(\${idx})" title="点击查看详情">
                    <div class="history-thumb-wrap">
                        <img class="history-thumb" src="\${pic}" alt="\${name}" loading="lazy" onerror="this.onerror=null;this.src='\${FALLBACK_POSTER}';">
                        <span class="history-badge">\${ep}</span>
                        <div class="history-play-icon" onclick="playHistoryCard(\${idx}, event)" title="立即播放">▶</div>
                        \${progressPercent > 0 ? \`
                        <div class="history-progress-track">
                            <div class="history-progress-bar" style="width: \${progressPercent}%;"></div>
                        </div>\` : ''}
                    </div>
                    <div class="history-info">
                        <div class="history-name" title="\${name}">\${name}</div>
                        <div class="history-sub-row">
                            <span class="history-sub">\${line || '最近观看'}</span>
                            \${progressText ? \`<span class="history-progress-pill">\${progressText}</span>\` : ''}
                        </div>
                    </div>
                </div>
                \`;
            }).join('');
        }

        // 从客户端异步拉取历史记录（严格处理标准响应封套）
        async function loadHistory(showToastFeedback = false) {
            try {
                if (showToastFeedback) showToast('正在向客户端读取观看记录...', true);
                const res = await fetch(API_PREFIX + '/api/history?count=10');
                const data = await res.json();
                console.log('[loadHistory result]:', data);
                const list = data.data || data.list || [];
                if (data.success && Array.isArray(list) && list.length > 0) {
                    renderHistory(list);
                    if (showToastFeedback) showToast('成功读取到 ' + list.length + ' 条最近观看', true);
                } else if (showToastFeedback) {
                    if (data.success === false) {
                        showToast('读取观看记录失败: ' + (data.message || '未授权或异常'), false);
                    } else {
                        showToast('客户端未返回观看记录(共 0 条)', false);
                    }
                }
            } catch (e) {
                console.error('[loadHistory error]:', e.message);
                if (showToastFeedback) showToast('读取观看记录失败: ' + e.message, false);
            }
        }

        function refreshHistory(showToastFeedback = true) {
            loadHistory(showToastFeedback);
        }

        // 搜索回车绑定
        document.getElementById('search-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                doSearch();
            }
        });

        document.getElementById('search-input').addEventListener('input', (e) => {
            document.getElementById('search-clear').style.display = e.target.value ? 'block' : 'none';
        });

        // 启动执行
        initCategories();
        if (initialVideos && initialVideos.length > 0) {
            renderVideos(initialVideos, false);
        } else {
            loadVideos(1, false);
        }

        // 1. 若 SSR 拿到历史记录则立即渲染
        if (rawHistory && rawHistory.length > 0) {
            renderHistory(rawHistory);
        }

        // 2. 页面加载完成后延迟 300ms 自动从客户端异步刷新（防止初次加载通信管道建立时间差）
        setTimeout(() => {
            loadHistory(false);
        }, 300);

        // 3. 页面重新聚焦时自动静默刷新
        window.addEventListener('focus', () => {
            loadHistory(false);
        });
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                loadHistory(false);
            }
        });
    </script>
</body>
</html>`;
}

async function web(inReq, outResp) {
    const prefix = inReq.server.prefix;

    // 1. 获取分类
    let classList = [];
    try {
        classList = await getCategories();
    } catch (e) {
        console.error('Failed to get categories in /web:', e.message);
    }

    // 2. 初始预取第一页推荐视频
    let initialVideos = [];
    let pageInfo = { page: 1, pagecount: 1, total: 0 };
    try {
        const data = await request(`${url}?ac=detail&pg=1`);
        if (data && data.list) {
            initialVideos = data.list.map((vod) => ({
                vod_id: vod.vod_id.toString(),
                vod_name: vod.vod_name.toString(),
                vod_pic: vod.vod_pic || '',
                vod_remarks: vod.vod_remarks || '',
                type_name: vod.type_name || '',
                vod_year: vod.vod_year || '',
                vod_area: vod.vod_area || '',
            }));
            pageInfo = {
                page: parseInt(data.page || 1),
                pagecount: parseInt(data.pagecount || 1),
                total: parseInt(data.total || initialVideos.length),
            };
            updateLikes(initialVideos);
        }
    } catch (e) {
        console.error('Failed to get initial videos in /web:', e.message);
    }

    // 3. 尝试读取客户端真实的播放历史记录
    let historyList = [];
    try {
        console.log('[web SSR] 正在向客户端请求 queryHistory...');
        const histRes = await inReq.server.messageToDart({
            action: 'queryHistory',
            opt: { count: 10 },
        }, inReq);
        console.log('[web SSR queryHistory 原始返回]:', typeof histRes === 'object' ? JSON.stringify(histRes) : histRes);
        historyList = extractHistoryList(histRes);
        console.log(`[web SSR queryHistory] 提取出 ${historyList.length} 条有效记录`);
    } catch (e) {
        console.error('[web SSR queryHistory 异常]:', e.message);
        historyList = [];
    }

    // 4. 渲染输出 HTML 网页
    const html = renderWebPage({
        prefix,
        categories: classList,
        initialVideos,
        pageInfo,
        historyList,
    });

    outResp.type('text/html; charset=utf-8');
    return html;
}

async function test(inReq, outResp) {
    try {
        const printErr = function (json) {
            if (json && json.statusCode && json.statusCode == 500) {
                console.error(json);
            }
        };
        const prefix = inReq.server.prefix;
        const dataResult = {};
        let resp = await inReq.server.inject().post(`${prefix}/init`);
        dataResult.init = resp.json();
        printErr(resp.json());

        // 验证 Type 7 Web 主页接口
        resp = await inReq.server.inject().get(`${prefix}/web`);
        dataResult.web = { statusCode: resp.statusCode, length: resp.body ? resp.body.length : 0 };

        // 验证 Action 接口
        resp = await inReq.server.inject().post(`${prefix}/action`).payload({
            action: 'openVodDetail',
            opt: { vod_id: '99227', vod_name: '太古神尊' },
        });
        dataResult.action = resp.json();

        // 验证 API 视频分页检索接口
        resp = await inReq.server.inject().get(`${prefix}/api/videos?page=1`);
        dataResult.apiVideos = { statusCode: resp.statusCode, count: resp.json()?.list?.length || 0 };

        // 验证客户端观看历史接口 (遵循标准响应封套)
        resp = await inReq.server.inject().get(`${prefix}/api/history?count=5`);
        dataResult.apiHistory = resp.json();

        resp = await inReq.server.inject().post(`${prefix}/home`);
        dataResult.home = resp.json();
        printErr(resp.json());
        if (dataResult.home.class.length > 0) {
            resp = await inReq.server.inject().post(`${prefix}/category`).payload({
                id: dataResult.home.class[0].type_id,
                page: 1,
                filter: true,
                filters: {},
            });
            dataResult.category = resp.json();
            printErr(resp.json());
            if (dataResult.category.list.length > 0) {
                resp = await inReq.server.inject().post(`${prefix}/detail`).payload({
                    id: dataResult.category.list[0].vod_id,
                });
                dataResult.detail = resp.json();
                printErr(resp.json());
                if (dataResult.detail.list && dataResult.detail.list.length > 0) {
                    dataResult.play = [];
                    for (const vod of dataResult.detail.list) {
                        const flags = vod.vod_play_from.split('$$$');
                        const ids = vod.vod_play_url.split('$$$');
                        for (let j = 0; j < flags.length; j++) {
                            const flag = flags[j];
                            const urls = ids[j].split('#');
                            for (let i = 0; i < urls.length && i < 2; i++) {
                                resp = await inReq.server
                                    .inject()
                                    .post(`${prefix}/play`)
                                    .payload({
                                        flag: flag,
                                        id: urls[i].split('$')[1],
                                    });
                                dataResult.play.push(resp.json());
                            }
                        }
                    }
                }
            }
        }
        resp = await inReq.server.inject().post(`${prefix}/search`).payload({
            wd: '爱',
            page: 1,
        });
        dataResult.search = resp.json();
        printErr(resp.json());
        return dataResult;
    } catch (err) {
        console.error(err);
        outResp.code(500);
        return { err: err.message, tip: 'check debug console output' };
    }
}

export default {
    meta: {
        key: 'demo_web',
        name: 'Web视频示例',
        type: 7,
    },
    api: async (fastify) => {
        fastify.post('/init', init);
        fastify.post('/home', home);
        fastify.post('/category', category);
        fastify.post('/detail', detail);
        fastify.post('/play', play);
        fastify.post('/search', search);
        fastify.get('/proxy/:what/:ids/:end', proxy);

        // Type 7 Web 视频站核心路由
        fastify.get('/web', web);
        fastify.get('/', (req, reply) => reply.redirect(req.server.prefix + '/web'));
        fastify.post('/action', handleAction);
        fastify.get('/action', handleAction);
        fastify.get('/open', openAction);
        fastify.post('/open', openAction);
        fastify.get('/play-action', playAction);
        fastify.post('/play-action', playAction);
        fastify.get('/search-action', searchAction);
        fastify.post('/search-action', searchAction);
        fastify.get('/history-action', historyAction);
        fastify.post('/history-action', historyAction);
        fastify.get('/api/videos', apiVideos);
        fastify.get('/api/history', apiHistory);

        fastify.get('/test', test);
    },
};
