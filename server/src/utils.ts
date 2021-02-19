const nonce = require('nonce')();

export const getAuthRedirectUri = (shopName: string) => {
    const redirectUri = `${process.env.APP_URL}/api/v1/auth/callback`;
    const shopState = nonce();
    return `https://${shopName}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${process.env.APP_SCOPES}&redirect_uri=${redirectUri}&state=${shopState}`;
}

export const getAuthResponse = (shopName: string) => {
    return {
        parentRedirect: true,
        redirectUrl: getAuthRedirectUri(shopName),
        message: "Need authentication"
    }
}

export const isValidShopUrl = (shopName: string) => {
    return /[^.\s]+\.myshopify\.com/.test(shopName);
}
