var toastifyCSS = document.createElement('link');
toastifyCSS.setAttribute('rel', 'stylesheet');
toastifyCSS.setAttribute('type', 'text/css');
toastifyCSS.setAttribute('href', 'https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css');

var toastifyJS = document.createElement('script');
toastifyJS.setAttribute('type', 'text/javascript');
toastifyJS.setAttribute('src', 'https://cdn.jsdelivr.net/npm/toastify-js');

document.head.appendChild(toastifyCSS);
document.head.appendChild(toastifyJS);

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
    const request = new Request(
        `${BACKEND_ENDPOINT}analytics/pageRequest`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                visitorId: visitorId,
                pageUrl: pageUrl,
                site: SITE,
                wasRedirect: wasRedirect,
                is404: is404
            })
        });

    fetch(request)
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error('Something went wrong!');
            }
        })
        .then(response => {
            console.debug(response);
        }).catch(error => {
            console.error(error);
        });
}

const uploadMetadata = (visitorId, metadata) => {
    const request = new Request(
        `${BACKEND_ENDPOINT}analytics/metadata`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                visitorId: visitorId,
                metadata: metadata
            })
        });

    fetch(request)
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error('Something went wrong!');
            }
        })
        .then(response => {
            console.debug(response);
        }).catch(error => {
            console.error(error);
        });
}

const handleNewVisitor = () => {
    const request = new Request("https://www.cloudflare.com/cdn-cgi/trace", { method: 'GET' });

    fetch(request)
        .then(response => {
            if (response.status === 200) {
                let resp = response.text;

                const ipStart = resp.search(/ip=[a-z0-9:].+/g) + 3
                const ip = resp.substring(ipStart, ipStart + 39)
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
            } else {
                throw new Error('Something went wrong!');
            }
        })
        .then(response => {
            console.debug(response);
        }).catch(error => {
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

let visitorId = getCookieValue("directed_visitorId")

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

    const request = new Request(
        `${BACKEND_ENDPOINT}mappings/get_redirect`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                referrer: document.referrer,
                URL: document.location.href
            })
        });

    fetch(request)
        .then(response => {
            if (response.status === 200) {
                let resp = response.json();

                if (resp.reason != "redirects not enabled") {
                    if (resp.url.includes("/search?q=")) {
                        location.href = resp.url + "&reason=" + resp.reason;
                    } else {
                        location.href = resp.url + "?reason=" + resp.reason;
                    }
                }
            } else {
                throw new Error('Something went wrong!');
            }
        })
        .then(response => {
            console.debug(response);
        }).catch(error => {
            console.error(error);
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
