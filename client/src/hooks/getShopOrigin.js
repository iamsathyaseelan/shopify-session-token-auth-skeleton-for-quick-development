export default function getShopOrigin() {
    const queryOrigin = new URLSearchParams(window.location.search).get("shop");

    if (queryOrigin) {
        return queryOrigin;
    } else {
        return null;
    }
}
