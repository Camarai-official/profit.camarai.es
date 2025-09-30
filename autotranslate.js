(function() {
    function getBrowserLang() {
        const nav = (navigator.language || navigator.userLanguage || 'es').toLowerCase();
        return nav;
    }

    function normalizeTarget(nav) {
        const map = {
            'pt-br': 'pt',
            'pt-pt': 'pt',
            'he': 'iw'
        };
        const lower = nav.toLowerCase();
        if (map[lower]) return map[lower];
        if (lower.startsWith('zh-cn')) return 'zh-CN';
        if (lower.startsWith('zh-tw')) return 'zh-TW';
        return lower.split('-')[0];
    }

    function needsAutoTranslate() {
        const base = getBrowserLang().split('-')[0];
        return base !== 'es';
    }

    function setCookie(name, value) {
        const expires = new Date(Date.now() + 365*24*60*60*1000).toUTCString();
        document.cookie = name + '=' + value + '; expires=' + expires + '; path=/';
        try {
            const host = location.hostname;
            document.cookie = name + '=' + value + '; expires=' + expires + '; path=/; domain=' + host;
            document.cookie = name + '=' + value + '; expires=' + expires + '; path=/; domain=.' + host;
        } catch (_) {}
    }

    function injectScript(src, onload) {
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.src = src;
        if (onload) s.onload = onload;
        document.head.appendChild(s);
    }

    if (!needsAutoTranslate()) return;

    var nav = getBrowserLang();
    var target = normalizeTarget(nav);

    setCookie('googtrans', '/es/' + target);

    window.googleTranslateElementInit = function() {
        try {
            new google.translate.TranslateElement({
                pageLanguage: 'es',
                includedLanguages: '',
                autoDisplay: false
            }, 'google_translate_element');

            var tries = 0;
            (function ensureApplied(){
                tries++;
                var select = document.querySelector('select.goog-te-combo');
                if (select) {
                    select.value = target;
                    var evt = document.createEvent('HTMLEvents');
                    evt.initEvent('change', true, true);
                    select.dispatchEvent(evt);
                    return;
                }
                if (tries < 60) setTimeout(ensureApplied, 250);
            })();

            function isTranslated() {
                var html = document.documentElement;
                return /translated/.test(html.className);
            }

            setTimeout(function(){
                if (!isTranslated()) {
                    try {
                        if (!sessionStorage.getItem('gt_retry')) {
                            sessionStorage.setItem('gt_retry', '1');
                            setCookie('googtrans', '/es/' + target);
                            location.reload();
                        } else {
                            sessionStorage.removeItem('gt_retry');
                        }
                    } catch(_) {}
                } else {
                    try { sessionStorage.removeItem('gt_retry'); } catch(_) {}
                }
            }, 2500);
        } catch (e) {}
    };

    injectScript('https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit', function(){
        setTimeout(function(){
            try {
                var mo = new MutationObserver(function(){
                    var frames = document.querySelectorAll('iframe.goog-te-menu-frame, .VIpgJd-ZVi9od-ORHb-OEVmcd, .VIpgJd-ZVi9od-aZ2wEe-wOHMyf');
                    frames.forEach(function(el){
                        el.style.display = 'none';
                        el.style.visibility = 'hidden';
                        if (el.parentNode) try { el.parentNode.removeChild(el); } catch(_) {}
                    });
                });
                mo.observe(document.documentElement, { childList: true, subtree: true });
            } catch(_) {}
        }, 1200);
    });
})();