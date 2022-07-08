var engine = new Liquid();
var tpl = engine.parse('{{ line_items }}');

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

//     let order = {
//         line_items: [],
//         order_id: "",
//         order_number: ""
//     }

//     {% for line_item in line_items %}
//     let obj = {}
//     obj.product_url = "{{ line_item.product.url }}";
//     obj.product_price = "{{ line_item.product.price }}";
//     obj.product_quantity = "{{ line_item.quantity }}";
//     obj.selected_variant = "{{ line_item.product.selected_variant }}";
//     obj.product_type = "{{ line_item.product.type }}";
//     obj.product_id = "{{ line_item.product_id }}"
//     obj.sku = "{{ line_item.sku }}";
//     obj.title = "{{ line_item.title }}";

//     order.line_items.push(obj);
//     {% endfor %}

//     order.order_id = "{{ order_id }}";
//     order.order_number = "{{ order_number }}";

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
