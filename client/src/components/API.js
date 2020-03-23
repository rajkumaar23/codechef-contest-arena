/*
 * Copyright (c) 2020. RAJKUMAR
 */

import axios from 'axios';
import Utils from "./Utils";
import * as React from "react";

let API = axios.create({
    baseURL: Utils.API_URL,
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem(Utils.ACCESS_TOKEN)
    }
});

let isRefreshing = false;
let subscribers = [];

API.interceptors.response.use(undefined, err => {
    const {config, response: {status}} = err;
    const originalRequest = config;

    if (status === 401) {
        if (!isRefreshing) {
            isRefreshing = true;
            axios.get(Utils.BACKEND_URL + '/refresh?token=' + localStorage.getItem(Utils.REFRESH_TOKEN)).then(res => {
                const {data} = res;
                isRefreshing = false;
                onRefreshed(data.access_token);
                localStorage.setItem(Utils.ACCESS_TOKEN, data.access_token);
                localStorage.setItem(Utils.REFRESH_TOKEN, data.refresh_token);
                subscribers = [];
            });
        }
        return new Promise(resolve => {
            subscribeTokenRefresh(token => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(axios(originalRequest));
            });
        });
    }
    return Promise.reject(err);
});

function subscribeTokenRefresh(cb) {
    subscribers.push(cb);
}

function onRefreshed(token) {
    subscribers.map(cb => cb(token));
}

export default API;

