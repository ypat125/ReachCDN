const urlParams = new URLSearchParams(window.location.search);
const reason = urlParams.get('reason')

var req = new XMLHttpRequest();
req.open('GET', document.location, false);
req.send(null);

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

    axios.post('https://linkrotbot.uc.r.appspot.com/mappings/get_redirect', {
        referrer: document.referrer,
        URL: document.location.href,
        // URL: "https://www.madhappy.com/collections/accessories/products/classics-dad-hat?variant=39329359396975"
    })
        .then(function (response) {
        if (response.data.reason != "redirects not enabled") {
            if (response.data.url.includes("/search?q=")) {
                location.href = response.data.url + "&reason=" + response.data.reason;    
            } else {
                location.href = response.data.url + "?reason=" + response.data.reason;
            }
            // location.href = "https://linkrotbottest.myshopify.com/" + "?reason=" + response.data.reason;
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
}
