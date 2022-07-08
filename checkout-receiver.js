document.currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
})();

let checkout_data = document.currentScript.getAttribute('data');

// VISITOR LOGIC

const BACKEND_ENDPOINT = "https://linkrotbot.uc.r.appspot.com/"
const SITE = window.location.hostname

const getCookieValue = (name) => (
    document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
)

const hasDirectedUid = () => (
    getCookieValue("directed_visitorId") !== ""
)

if (hasDirectedUid()) {
    // Save Checkout

    visitorId = getCookieValue("directed_visitorId")

    const request = new Request(
        `${BACKEND_ENDPOINT}analytics/checkoutSuccess`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                visitorId: visitorId,
                site: SITE,
                order: checkout_data
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
