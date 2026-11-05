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
    const cfg = inReq?.server?.config?.demo || inReq?.server?.config?.ffm3u8;
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

async function home(_inReq, _outResp) {
    const data = await request(url);
    let classes = [];
    if (data && data.class) {
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
        key: 'demo',
        name: '视频示例',
        type: 3,
    },
    api: async (fastify) => {
        fastify.post('/init', init);
        fastify.post('/home', home);
        fastify.post('/category', category);
        fastify.post('/detail', detail);
        fastify.post('/play', play);
        fastify.post('/search', search);
        fastify.get('/proxy/:what/:ids/:end', proxy);
        fastify.get('/test', test);
    },
};
