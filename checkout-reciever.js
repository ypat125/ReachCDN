document.currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
})();

let checkout_data = document.currentScript.getAttribute('data');

console.log(checkout_data);

// // VISITOR LOGIC

// const BACKEND_ENDPOINT = "https://linkrotbot.uc.r.appspot.com/"
// const SITE = window.location.hostname

// const getCookieValue = (name) => (
//     document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
// )

// const hasDirectedUid = () => (
//     getCookieValue("directed_visitorId") !== ""
// )

// if (hasDirectedUid()) {
//     // Save Checkout

//     visitorId = getCookieValue("directed_visitorId")

//     const options = {
//         method: 'POST', url: `${BACKEND_ENDPOINT}analytics/checkoutSuccess`,
//         headers: { 'Content-Type': 'application/json' },
//         data: {
//             visitorId: visitorId,
//             site: SITE,
//             order: order
//         }
//     }
//     axios.request(options).then((response) => {
//         console.log(response.status)
//     })
// }
