// ==UserScript==
// @name         虫虫钢琴增强助手
// @namespace    https://github.com/Disene/Gangqinpu-Helper
// @version      1.0.0
// @description  虫虫钢琴增强助手：免登录纯净预览/打印、MP3强制下载、MIDI/CCMZ解析、简五线切换、H5支持、图片谱PDF、水印清除。整合多份优秀脚本优点。
// @author       Disene
// @license      GPL-3.0-or-later
// @match        *://www.gangqinpu.com/jianpu/*
// @match        *://www.gangqinpu.com/cchtml/*
// @match        *://www.gangqinpu.com/sheetplayer/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
// @icon         https://www.gangqinpu.com/favicon.ico
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      s201.lzjoy.com
// @run-at       document-end
// @downloadURL  https://raw.githubusercontent.com/Disene/gangqinpu-helper/main/gangqinpu-helper.user.js
// @updateURL    https://raw.githubusercontent.com/Disene/gangqinpu-helper/main/gangqinpu-helper.user.js
// ==/UserScript==

(function () {
    'use strict';

    // ==================== 1. sheetplayer 纯净打印页 ====================
    if (window.location.pathname.includes('/sheetplayer/')) {
        GM_addStyle(`
            html, body { overflow: auto !important; height: auto !important; margin: 0 !important; }
            .print, .qrcode, .footer, .img-mask { display: none !important; visibility: hidden !important; }
        `);
        setTimeout(() => {
            try {
                document.querySelectorAll('#page_0 > g.qrcode.print, #page_0 > g:nth-child(1) > image, #page_0 > g.footer > text.print')
                    .forEach(el => el.style.visibility = 'hidden');
                const svg = document.querySelector('#svg');
                if (svg) {
                    for (let i = 1; i <= svg.children.length - 3; i++) {
                        const page = document.querySelector(`#page_${i}`);
                        if (page) {
                            page.querySelectorAll('g.print > image, g.footer > text.print')
                                .forEach(el => el.style.visibility = 'hidden');
                        }
                    }
                }
            } catch (e) {}
        }, 2500);
        try {
            const gdd = new URL(window.location.href).searchParams.get('gdd');
            if (gdd === '2') {
                setTimeout(() => { try { unsafeWindow.Player.setJianpuMode(2); } catch (e) {} }, 1500);
            }
        } catch (e) {}
        return;
    }

    // ==================== 2. 全局样式 ====================
    GM_addStyle(`
        .img-mask,
        .s-d-m-b-buy,
        #line-spectrum-box > div.defalut.no-buy.active,
        #siwper1-middle-play,
        #siwper1-next,
        #siwper1-prev,
        #play_botton_ai,
        #header > div.content-box-0,
        body > section > div.content-w > div:nth-child(3),
        .score_details_h5_box > div.s_d_h_b_item2,
        #footer,
        .score_details_h5_box > div.s_d_h_b_item3 > div.more-box1 {
            display: none !important;
            visibility: hidden !important;
            pointer-events: none !important;
        }
        #line-spectrum-box > div.ai {
            display: block !important;
            visibility: visible !important;
        }

        #cc-capsule-bar {
            position: fixed;
            bottom: 28px;
            right: 28px;
            z-index: 999999;
            display: flex;
            align-items: center;
            background: rgba(15, 23, 42, 0.94);
            backdrop-filter: blur(14px);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 28px;
            padding: 5px 6px;
            box-shadow: 0 8px 28px rgba(0, 0, 0, 0.32);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
            user-select: none;
            transition: box-shadow 0.25s ease;
        }
        #cc-capsule-bar:hover {
            box-shadow: 0 12px 36px rgba(59, 130, 246, 0.25);
        }
        #cc-capsule-bar .cc-menu {
            display: flex;
            align-items: center;
            gap: 2px;
            max-width: 0;
            opacity: 0;
            overflow: hidden;
            white-space: nowrap;
            transition: all 0.32s cubic-bezier(0.4, 0, 0.2, 1);
        }
        #cc-capsule-bar:hover .cc-menu,
        #cc-capsule-bar.active .cc-menu {
            max-width: 680px;
            opacity: 1;
            padding: 0 8px 0 4px;
        }
        .cc-btn {
            background: transparent;
            border: none;
            color: #e2e8f0;
            padding: 8px 14px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
            transition: all 0.2s ease;
        }
        .cc-btn:hover {
            background: rgba(59, 130, 246, 0.22);
            color: #93c5fd;
        }
        .cc-btn:active {
            transform: scale(0.96);
        }
        .cc-toggle-ball {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: linear-gradient(145deg, #3b82f6, #2563eb);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 15px;
            font-weight: 600;
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.45);
            transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease;
        }
        #cc-capsule-bar:hover .cc-toggle-ball,
        #cc-capsule-bar.active .cc-toggle-ball {
            transform: rotate(90deg);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.55);
        }
    `);

    // ==================== 工具函数 ====================
    function showToast(msg, type = 'info') {
        let container = document.getElementById('cc-toast-box');
        if (!container) {
            container = document.createElement('div');
            container.id = 'cc-toast-box';
            container.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:1000001;pointer-events:none;';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        const bg = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
        toast.style.cssText = `background:${bg};color:white;padding:9px 18px;border-radius:20px;font-size:13px;font-weight:500;margin-bottom:8px;box-shadow:0 4px 14px rgba(0,0,0,0.18);transition:all 0.3s;opacity:0;transform:translateY(-12px);`;
        toast.textContent = msg;
        container.appendChild(toast);
        requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translateY(0)'; });
        setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 2600);
    }

    function getScoreTitle() {
        return (document.querySelector('h1')?.innerText ||
                document.querySelector('.detils_box > hgroup > div > h1')?.innerText ||
                '曲谱').replace(/[<>:"/\\|?*]/g, '_').trim().substring(0, 60);
    }

    // ==================== MP3 强制下载 ====================
    function fetchAudioUrl() {
        return new Promise((resolve, reject) => {
            let targetUrl = window.location.href;
            if (targetUrl.includes('/jianpu/')) targetUrl = targetUrl.replace('/jianpu/', '/cchtml/');
            GM_xmlhttpRequest({
                method: 'GET',
                url: targetUrl,
                onload: (res) => {
                    if (res.status !== 200) return reject(`请求失败 [${res.status}]`);
                    const doc = new DOMParser().parseFromString(res.responseText, 'text/html');
                    const source = doc.querySelector('audio.music-audio.audio source[type="audio/mp3"]');
                    if (source?.src) resolve(source.src);
                    else reject('未找到 MP3 资源');
                },
                onerror: (err) => reject(err)
            });
        });
    }

    async function forceDownload(url, filename) {
        try {
            const response = await fetch(url, { method: 'GET', mode: 'cors', headers: { 'Accept': 'audio/mpeg' } });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                a.remove();
                URL.revokeObjectURL(blobUrl);
            }, 150);
            showToast('MP3 开始下载', 'success');
        } catch (e) {
            console.error(e);
            showToast('下载失败: ' + e.message, 'error');
        }
    }

    // ==================== MIDI / CCMZ 弹窗 ====================
    function openMIDIConverterModal(ccmzUrl) {
        if (!ccmzUrl) {
            showToast('未检测到 CCMZ 链接', 'error');
            return;
        }
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position:fixed;inset:0;background:rgba(15,23,42,0.55);backdrop-filter:blur(8px);
            display:flex;align-items:center;justify-content:center;z-index:1000000;
            font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Microsoft YaHei",sans-serif;`;
        overlay.innerHTML = `
            <div style="background:#fff;border-radius:20px;width:90%;max-width:460px;padding:24px;box-shadow:0 25px 50px rgba(0,0,0,0.25);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h3 style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">MIDI / CCMZ 解析</h3>
                    <button id="modal-close" style="background:none;border:none;font-size:22px;color:#64748b;cursor:pointer;line-height:1;">&times;</button>
                </div>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px;margin-bottom:16px;">
                    <div style="font-size:12px;color:#64748b;margin-bottom:4px;">CCMZ 地址</div>
                    <div style="font-size:12px;color:#334155;word-break:break-all;font-family:ui-monospace,monospace;">${ccmzUrl}</div>
                </div>
                <div style="display:flex;gap:10px;margin-bottom:18px;">
                    <button id="btn-copy" style="flex:1;padding:11px;background:#f1f5f9;color:#334155;border:none;border-radius:10px;font-weight:600;cursor:pointer;">复制链接</button>
                    <a href="${ccmzUrl}" download style="flex:1;text-align:center;padding:11px;background:#3b82f6;color:#fff;border-radius:10px;font-weight:600;text-decoration:none;">下载 CCMZ</a>
                </div>
                <div style="display:flex;flex-direction:column;gap:8px;">
                    <button id="opt-web" style="padding:12px;border:1px solid #e2e8f0;border-radius:10px;background:#fafafa;font-weight:600;cursor:pointer;text-align:left;">Web 转换器 (ccmz2mid)</button>
                    <button id="opt-third" style="padding:12px;border:1px solid #e2e8f0;border-radius:10px;background:#fafafa;font-weight:600;cursor:pointer;text-align:left;">第三方流式解析 (bszapp)</button>
                    <button id="opt-local" style="padding:12px;border:1px solid #e2e8f0;border-radius:10px;background:#fafafa;font-weight:600;cursor:pointer;text-align:left;">本地程序 (GitHub)</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);

        const close = () => overlay.remove();
        overlay.querySelector('#modal-close').onclick = close;
        overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

        overlay.querySelector('#btn-copy').onclick = () => {
            navigator.clipboard.writeText(ccmzUrl).then(() => showToast('已复制', 'success'));
        };
        overlay.querySelector('#opt-web').onclick = () => {
            const left = (screen.width - 1200) / 2, top = (screen.height - 850) / 2;
            window.open(`https://testernan.github.io/ccmz2mid/?ccmz=${encodeURIComponent(ccmzUrl)}`, '_blank', `width=1200,height=800,left=${left},top=${top}`);
        };
        overlay.querySelector('#opt-local').onclick = () => window.open('https://github.com/TesterNaN/ccmz2mid', '_blank');

        overlay.querySelector('#opt-third').onclick = async () => {
            const converterUrl = 'https://bszapp.github.io/ccmz-to-midi/';
            try {
                let filename = '';
                try { filename = decodeURIComponent(new URL(ccmzUrl).pathname.split('/').pop() || ''); } catch {}
                const response = await fetch(ccmzUrl, { referrerPolicy: 'no-referrer', mode: 'cors', credentials: 'omit' });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const cd = response.headers.get('content-disposition');
                if (cd) {
                    const m = cd.match(/filename\*=UTF-8''([^;]+)/i) || cd.match(/filename="?([^";]+)"?/i);
                    if (m) filename = decodeURIComponent(m[1]);
                }
                if (!filename) filename = 'score.ccmz';
                const contentLength = parseInt(response.headers.get('content-length'), 10) || 0;
                const reader = response.body.getReader();
                const left = (screen.width - 1200) / 2, top = (screen.height - 850) / 2;
                const win = window.open(converterUrl, '_blank', `width=1200,height=800,left=${left},top=${top}`);
                if (!win) { alert('请允许弹出窗口'); return; }

                const timeout = setTimeout(() => window.removeEventListener('message', handler), 6000);
                const handler = async (e) => {
                    if (e.data !== 'READY') return;
                    clearTimeout(timeout);
                    window.removeEventListener('message', handler);
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) {
                            win.postMessage({ action: 'DONE', filename }, '*');
                            break;
                        }
                        win.postMessage({ action: 'CHUNK', chunk: value, total: contentLength }, '*', [value.buffer]);
                    }
                };
                window.addEventListener('message', handler);
            } catch (err) {
                console.error(err);
                window.open(converterUrl, '_blank');
            }
        };
    }

    // ==================== 纯净预览 / 免登录打印 ====================
    function openCleanPlayer(print = false) {
        const iframe = document.getElementById('ai-score') || document.getElementById('ai-score-H5');
        if (!iframe?.src) {
            showToast('未找到谱面地址', 'error');
            return;
        }

        try {
            const Player = iframe.contentWindow?.Player;
            const mode = Player ? Player.getJianpuMode() : 0;
            const u = new URL(iframe.src);
            u.searchParams.set('jianpuMode', mode);
            u.searchParams.set('gdd', mode);

            if (print) {
                try {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                    showToast('已触发打印', 'success');
                    return;
                } catch (e) {
                    const match = iframe.src.match(/url=([^&]+)/);
                    if (match) {
                        const printUrl = `/sheetplayer/web.html?jianpuMode=${mode}&url=${encodeURIComponent(match[1])}&gdd=${mode}`;
                        const win = window.open(printUrl, '_blank');
                        if (win) {
                            win.addEventListener('load', () => setTimeout(() => {
                                try { win.print(); } catch {}
                            }, 1200));
                        }
                        showToast('已打开打印窗口', 'success');
                        return;
                    }
                }
            }

            window.open(u.toString(), '_blank');
            showToast('已打开纯净预览', 'success');
        } catch (e) {
            showToast('打开失败', 'error');
            console.error(e);
        }
    }

    // ==================== 图片谱 PDF 兜底 ====================
    function handleNoAiScore() {
        if (typeof window.jspdf === 'undefined') {
            setTimeout(handleNoAiScore, 800);
            return;
        }
        const observer = new MutationObserver(() => {
            const container = document.querySelector('.swiper-wrapper');
            if (!container) return;
            const images = [...container.querySelectorAll('.swiper-slide img.img')];
            if (images.length === 0) return;
            if (images[1]?.src === 'https://s201.lzjoy.com/res/statics/2022/app/z.png') {
                observer.disconnect();
                showToast('暂不支持该曲谱（VIP 限制）', 'error');
                return;
            }
            const originalBtn = document.querySelector('.down.download');
            if (originalBtn && !originalBtn.dataset.ccHandled) {
                originalBtn.dataset.ccHandled = '1';
                const newBtn = originalBtn.cloneNode(true);
                originalBtn.parentNode.replaceChild(newBtn, originalBtn);
                newBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    const urls = images.map(img => img.src).filter(s => s && !s.includes('z.png') && !s.startsWith('data:'));
                    if (!urls.length) {
                        showToast('未找到可用图片', 'error');
                        return;
                    }
                    showToast(`正在合成 PDF（${urls.length} 页）...`, 'info');
                    try {
                        await createImagePDF(urls);
                        showToast('PDF 已保存', 'success');
                    } catch (err) {
                        showToast('PDF 失败: ' + err.message, 'error');
                    }
                }, true);
            }
            observer.disconnect();
        });
        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => observer.disconnect(), 25000);
    }

    async function createImagePDF(urls) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const margin = 10;
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const contentW = pageW - 2 * margin;
        const contentH = pageH - 2 * margin;
        const fileName = getScoreTitle() + '.pdf';

        for (let i = 0; i < urls.length; i++) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise((res, rej) => {
                img.onload = res;
                img.onerror = rej;
                img.src = urls[i];
            });
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext('2d').drawImage(img, 0, 0);
            const data = canvas.toDataURL('image/jpeg', 0.92);
            const scale = Math.min(contentW / img.width, contentH / img.height);
            const dw = img.width * scale;
            const dh = img.height * scale;
            const x = margin + (contentW - dw) / 2;
            const y = margin + (contentH - dh) / 2;
            if (i > 0) pdf.addPage();
            pdf.addImage(data, 'JPEG', x, y, dw, dh);
            await new Promise(r => setTimeout(r, 80));
        }
        pdf.save(fileName);
    }

    // ==================== 主破解逻辑 ====================
    function CrackMain() {
        const kj = document.getElementById('ai-score');
        if (!kj) {
            handleNoAiScore();
            return;
        }

        setTimeout(() => {
            try {
                const H5Image = document.querySelector('body > section > div.s_d_h_b_item1 > div.tab-body.c-b-3 > div > img');
                const H5Viewer = document.querySelector('body > section > div.s_d_h_b_item1 > div.tab-body.c-b-3 > div');
                const H5AudioBox = document.querySelector('#audio-box');
                if (H5Viewer && H5Image) {
                    H5Image.style.display = 'none';
                    const audioH = H5AudioBox ? H5AudioBox.getBoundingClientRect().height : 0;
                    H5Viewer.innerHTML = `<iframe id="ai-score-H5" src="${kj.src}" frameborder="0" scrolling="yes" style="width:100%;height:100%;border:none;overflow:auto;"></iframe>` + H5Viewer.innerHTML;
                    H5Viewer.style.boxShadow = 'none';
                    H5Viewer.style.borderTop = 'none';
                    const style = document.createElement('style');
                    style.textContent = `body > section > div.s_d_h_b_item1 > div.tab-body.c-b-3 > div::before { display:none !important; }`;
                    document.head.appendChild(style);

                    const MAX_W = 1000;
                    const adjust = () => {
                        if (!H5Viewer) return;
                        const w = H5Viewer.clientWidth;
                        if (w <= MAX_W) {
                            const h = Math.round(w * 2160 / 1600);
                            H5Viewer.style.height = (h + audioH) + 'px';
                            const ifrm = document.getElementById('ai-score-H5');
                            if (ifrm) ifrm.style.height = h + 'px';
                        }
                    };
                    adjust();
                    unsafeWindow.addEventListener('resize', adjust);
                    unsafeWindow.addEventListener('orientationchange', () => setTimeout(adjust, 120));
                }
            } catch (e) {}

            try { document.querySelector('#line-spectrum-box > div.ai > div').style.visibility = 'hidden'; } catch {}
            try { document.querySelector('.s-d-m-b-buy').style.visibility = 'hidden'; } catch {}
            try { document.querySelector('#line-spectrum-box > div.defalut.no-buy.active > div.img-mask').style.visibility = 'hidden'; } catch {}
            try { document.querySelector('#line-spectrum-box > div.ai').style.display = 'block'; } catch {}
            try { document.querySelector('#line-spectrum-box > div.defalut.no-buy.active').style.display = 'none'; } catch {}
            try { document.querySelector('#siwper1-middle-play').style.display = 'none'; } catch {}
            try { document.querySelector('#ai-score').scrolling = 'yes'; } catch {}
            try { document.querySelector('#header > div.content-box-0').style.display = 'none'; document.querySelector('body > section').style = ''; } catch {}
            try { document.querySelector('body > section > div.content-w > div:nth-child(3)').style.display = 'none'; } catch {}
            try { document.querySelector('#footer').style.display = 'none'; } catch {}
            try { document.querySelector('.score_details_h5_box > div.s_d_h_b_item2').style.display = 'none'; } catch {}
            try { document.querySelector('.score_details_h5_box > div.s_d_h_b_item3 > div.more-box1').style.display = 'none'; } catch {}
            try { document.querySelector('#play_botton_ai').style.display = 'none'; } catch {}

            unsafeWindow.loadInstall = () => false;

            try { document.querySelector('.share.s_d_shareBtn')?.childNodes[0] && (document.querySelector('.share.s_d_shareBtn').childNodes[0].innerHTML = '<i class="down-icon"></i>下载音频'); } catch {}
            try { document.querySelector('.like.Collection')?.childNodes[0] && (document.querySelector('.like.Collection').childNodes[0].innerHTML = '<i class="down-icon"></i>解析MIDI'); } catch {}
            try { document.querySelector('#score_header > div > div > div.top-print') && (document.querySelector('#score_header > div > div > div.top-print').innerHTML = '<span>解析MIDI</span>'); } catch {}

            const bindOnce = (el, handler) => {
                if (!el || el.dataset.ccBound) return;
                el.dataset.ccBound = '1';
                const clone = el.cloneNode(true);
                el.parentNode.replaceChild(clone, el);
                clone.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    handler(e);
                }, true);
            };

            bindOnce(document.querySelector('.down.download'), () => openCleanPlayer(false));
            bindOnce(document.getElementById('s_d_fullBtn'), () => openCleanPlayer(false));
            bindOnce(document.querySelector('#score_header > div > div > div.top-down'), () => openCleanPlayer(false));
            bindOnce(document.querySelector('.print.Printing'), () => openCleanPlayer(true));

            bindOnce(document.querySelector('.share.s_d_shareBtn'), async () => {
                try {
                    const url = await fetchAudioUrl();
                    forceDownload(url, getScoreTitle() + '.mp3');
                } catch (e) {
                    showToast('音频提取失败: ' + e, 'error');
                }
            });

            const openMidi = () => {
                const iframe = document.getElementById('ai-score') || document.getElementById('ai-score-H5');
                if (iframe?.src) {
                    const u = new URL(iframe.src);
                    openMIDIConverterModal(u.searchParams.get('url'));
                }
            };
            bindOnce(document.querySelector('.like.Collection'), openMidi);
            bindOnce(document.querySelector('#score_header > div > div > div.top-print'), openMidi);

            const jpIcon = 'https://s201.lzjoy.com/public/web_static/images/score_details/jianpu-icon.png';
            const wxIcon = 'https://s201.lzjoy.com/public/web_static/images/score_details/qupu-icon.png';
            const tojp = document.querySelector('.jianpu-btn');
            if (tojp && !tojp.dataset.ccBound) {
                tojp.dataset.ccBound = '1';
                tojp.addEventListener('click', (e) => {
                    e.stopImmediatePropagation();
                    try {
                        const Player = document.querySelector('#ai-score')?.contentWindow?.Player;
                        if (!Player) return;
                        if (Player.getJianpuMode() === 0) {
                            tojp.src = wxIcon;
                            Player.setJianpuMode(1);
                        } else {
                            tojp.src = jpIcon;
                            Player.setJianpuMode(0);
                        }
                    } catch {}
                }, true);
            }
            try {
                document.querySelector('body > section > div.s_d_h_b_item1 > div.audition > div.li.audition-jian')
                    ?.addEventListener('click', (e) => {
                        e.stopImmediatePropagation();
                        const Player = document.querySelector('#ai-score-H5')?.contentWindow?.Player;
                        if (Player) Player.setJianpuMode(Player.getJianpuMode() === 0 ? 1 : 0);
                    }, true);
            } catch {}

            console.log('[极致助手] CrackMain 完成');
        }, 900);
    }

    // ==================== 胶囊 UI ====================
    function initCapsule() {
        if (document.getElementById('cc-capsule-bar')) return;
        const bar = document.createElement('div');
        bar.id = 'cc-capsule-bar';
        bar.innerHTML = `
            <div class="cc-menu">
                <button class="cc-btn" id="cc-btn-preview" title="打开干净的全屏预览窗口">纯净预览</button>
                <button class="cc-btn" id="cc-btn-print" title="直接调用打印（免登录）">打印</button>
                <button class="cc-btn" id="cc-btn-audio" title="强制下载 MP3 音频">MP3下载</button>
                <button class="cc-btn" id="cc-btn-midi" title="解析 CCMZ / MIDI">MIDI解析</button>
                <button class="cc-btn" id="cc-btn-jp" title="切换简谱 / 五线谱">简/五线</button>
            </div>
            <div class="cc-toggle-ball" id="cc-ball" title="展开/收起菜单">🎼</div>
        `;
        document.body.appendChild(bar);

        document.getElementById('cc-btn-preview').onclick = () => openCleanPlayer(false);
        document.getElementById('cc-btn-print').onclick = () => openCleanPlayer(true);
        document.getElementById('cc-btn-audio').onclick = async () => {
            try {
                const url = await fetchAudioUrl();
                forceDownload(url, getScoreTitle() + '.mp3');
            } catch (e) {
                showToast('提取失败: ' + e, 'error');
            }
        };
        document.getElementById('cc-btn-midi').onclick = () => {
            const iframe = document.getElementById('ai-score') || document.getElementById('ai-score-H5');
            if (iframe?.src) {
                const u = new URL(iframe.src);
                openMIDIConverterModal(u.searchParams.get('url'));
            } else {
                showToast('未找到 CCMZ', 'error');
            }
        };
        document.getElementById('cc-btn-jp').onclick = () => {
            const iframe = document.getElementById('ai-score') || document.getElementById('ai-score-H5');
            try {
                const Player = iframe?.contentWindow?.Player;
                if (Player) {
                    const next = Player.getJianpuMode() === 0 ? 1 : 0;
                    Player.setJianpuMode(next);
                    showToast(next === 1 ? '已切换简谱' : '已切换五线谱', 'success');
                }
            } catch {
                showToast('切换失败，请稍后再试', 'error');
            }
        };
        document.getElementById('cc-ball').onclick = () => bar.classList.toggle('active');
    }

    // ==================== 启动 ====================
    const path = window.location.pathname;
    if (path.includes('/jianpu/') || path.includes('/cchtml/')) {
        CrackMain();
        setTimeout(initCapsule, 600);
    }
})();
