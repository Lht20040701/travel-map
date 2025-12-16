// public/check-and-fake-env.js
(function() {
    if (navigator.platform.startsWith('Linux')) {
        // 篡改UA：伪装成Windows下的Firefox（关键）
        const fakeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0';
        // 重写navigator.userAgent（禁止后续修改）
        Object.defineProperty(navigator, 'userAgent', {
            value: fakeUA,
            writable: false,
            configurable: false
        });

        console.log("检测到 Linux 环境运行，已伪装成Windows Firefox环境，UA：", navigator.userAgent);
    }
})();
