// VISITOR LOGIC

const BACKEND_ENDPOINT = "https://linkrotbot.uc.r.appspot.com/"
const SITE = window.location.hostname

const getCookieValue = (name) => (
    document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
)

const hasDirectedUid = () => (
    getCookieValue("directed_visitorId") !== ""
)

const cyrb53 = function (str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

const handlePageRequest = (visitorId, pageUrl, wasRedirect, is404) => {
    console.log("making pge request")
    const options = {
        method: 'POST', url: `${BACKEND_ENDPOINT}analytics/pageRequest`,
        headers: { 'Content-Type': 'application/json' },
        data: {
            visitorId: visitorId,
            pageUrl: pageUrl,
            site: SITE,
            wasRedirect: wasRedirect,
            is404: is404
        }
    }
    axios.request(options).then((response) => {
        console.log(response.status)
    })
}

const uploadMetadata = (visitorId, metadata) => {
    const options = {
        method: 'POST', url: `${BACKEND_ENDPOINT}analytics/metadata`,
        headers: { 'Content-Type': 'application/json' },
        data: {
            visitorId: visitorId,
            metadata: metadata,
        }
    }
    axios.request(options).then((response) => {
        console.log(response.status)
    })
}

const handleNewVisitor = () => {
    const options = { method: 'GET', url: 'https://www.cloudflare.com/cdn-cgi/trace' };
    axios.request(options).then((response) => {
        const ipStart = response.data.search(/ip=[a-z0-9:].+/g) + 3
        const ip = response.data.substring(ipStart, ipStart + 39)
        metadata = {
            "cookieEnabled": navigator.cookieEnabled,
            "language": navigator.language,
            "platform": navigator.platform,
            "connectionSpeed": navigator.connectionSpeed,
            "userAgent": navigator.userAgent,
            "webdriver": navigator.webdriver,
            "ip": ip
        }
        hash = cyrb53(JSON.stringify(metadata))
        document.cookie = `directed_visitorId = ${hash}; max-age = ${2 * 365 * 24 * 60 * 60}}`
        uploadMetadata(hash, metadata)
        handlePageRequest(hash, window.location.href)

    }).catch(function (error) {
        console.error(error);
        document.cookie = `directed_visitorId = FAILED; max-age = ${2 * 365 * 24 * 60 * 60}}`
    });
}

if (!hasDirectedUid()) {
    handleNewVisitor()
}

// REDIRECT LOGIC

const urlParams = new URLSearchParams(window.location.search);
const reason = urlParams.get('reason')

var req = new XMLHttpRequest();
req.open('GET', document.location, false);
req.send(null);

visitorId = getCookieValue("directed_visitorId")

if (req.status == 404) {
    Toastify({
        text: "This page no longer exists. Redirecting now.",
        duration: 10000,
        gravity: "top",
        position: "center",
        stopOnFocus: true,
        style: {
            background: "#6366f1",
        },
    }).showToast();

    if (visitorId !== "Failed") {
        handlePageRequest(visitorId, window.location.href, false, true);
    }

    axios.post(`${BACKEND_ENDPOINT}mappings/get_redirect`, {
        referrer: document.referrer,
        URL: document.location.href,
    })
        .then(function (response) {
            if (response.data.reason != "redirects not enabled") {
                if (response.data.url.includes("/search?q=")) {
                    location.href = response.data.url + "&reason=" + response.data.reason;
                } else {
                    location.href = response.data.url + "?reason=" + response.data.reason;
                }
            }
        })
        .catch(function (error) {
            console.log(error);
        });
} else if (reason) {
    Toastify({
        text: reason,
        duration: 3000,
        gravity: "top",
        position: "center",
        stopOnFocus: true,
        style: {
            background: "#6366f1",
        },
    }).showToast();

    if (visitorId !== "Failed") {
        handlePageRequest(visitorId, window.location.href, true, false);
    }
} else {
    if (visitorId !== "Failed") {
        handlePageRequest(visitorId, window.location.href, false, false);
    }
}
