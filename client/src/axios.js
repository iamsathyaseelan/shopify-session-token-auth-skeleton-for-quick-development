import axios from 'axios';
import _ from "lodash";
import {createApp} from "@shopify/app-bridge";
import {getSessionToken} from "@shopify/app-bridge-utils";

const _axios = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/v1`
});
_axios.interceptors.request.use(
    async (config) => {
        try {
            const shopOrigin = _.get(config, 'headers.shopOrigin', false);
            if (shopOrigin) {
                const app = createApp({
                    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
                    shopOrigin: shopOrigin
                });
                config.headers['x-session-token'] = await getSessionToken(app);
            }
        } catch (e) {
            console.log(e)
        }
        return config;
    }
);
_axios.interceptors.response.use(
    (response) => {
        console.log(response);
        if (response.status === 200) {
            return response.data;
        }
        return response;
    }
);
export default _axios;
