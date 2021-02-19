import React, {useContext, useEffect, useState} from "react";
import {ShopContext} from "../App";
import axios from "../axios";

const Dashboard = () => {
    const config = useContext(ShopContext);
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState("");
    useEffect(() => {
        setLoading(true);
        axios.get(`/dashboard`, {
            "headers": {
                shopOrigin: config.shopOrigin,
            }
        }).then((response) => {
            setLoading(false);
            let data = JSON.stringify(response.data);
            setResponse(data);
        }).catch(() => {
            setLoading(false);
        });
    }, [config]);
    if (loading) {
        return (<>Loading....</>)
    }
    return (<><p>Dashboard page</p><p>{response}</p></>);
}

export default Dashboard;
