import {createContext, useEffect, useState} from "react";
import enTranslations from '@shopify/polaris/locales/en.json';
import {AppProvider} from '@shopify/polaris';
import {BrowserRouter as Router, Link, Route, Switch} from 'react-router-dom';
import Dashboard from "./pages/dashboard";
import Settings from "./pages/settings";
import getShopOrigin from "./hooks/getShopOrigin";
import axios from "axios";
import _ from "lodash";

const shopOrigin = getShopOrigin();

const config = {
    shopOrigin: shopOrigin
};

export const ShopContext = createContext(config);

function App() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!shopOrigin || shopOrigin === "" || shopOrigin === "null") {
            setError(true);
            setLoading(false);
        } else {
            axios.get(`${process.env.REACT_APP_API_URL}/auth?shop=${shopOrigin}`).then((response) => {
                const error = _.get(response, 'data.error', false);
                if (error) {
                    setError(true);
                    setLoading(false);
                } else {
                    const redirect = _.get(response, 'data.redirect', false);
                    if (redirect) {
                        const redirectUrl = _.get(response, 'data.redirect_uri', false);
                        if (window.top === window.self && redirectUrl) {
                            window.location.assign(redirectUrl);
                        }
                    } else {
                        setLoading(false);
                    }
                }
            }).catch(() => {
                setError(true);
                setLoading(false);
            })
        }
    }, []);

    if (error) {
        return (<>Unable to process your request!</>);
    }

    if (loading) {
        return (<>Loading...</>);
    }

    return (
        <ShopContext.Provider value={config}>
            <AppProvider i18n={enTranslations}>
                <Router>
                    <div>
                        <ul>
                            <li><Link to="/dashboard">Move to dashboard</Link></li>
                            <li><Link to="/settings">Move to settings</Link></li>
                        </ul>
                    </div>
                    <Switch>
                        <Route exact path="/">
                            <Dashboard/>
                        </Route>
                        <Route exact path="/dashboard">
                            <Dashboard/>
                        </Route>
                        <Route exact path="/settings">
                            <Settings/>
                        </Route>
                    </Switch>
                </Router>
            </AppProvider>
        </ShopContext.Provider>
    );
}

export default App;
