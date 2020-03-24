/*
 * Copyright (c) 2020. RAJKUMAR
 */

export default class Utils {
    static ACCESS_TOKEN = 'access_token';
    static REFRESH_TOKEN = 'refresh_token';
    static API_URL = 'https://codechef-arena.herokuapp.com/';
    static BACKEND_URL = Utils.API_URL;

    static isLoggedIn() {
        return localStorage.getItem(this.ACCESS_TOKEN) != null && localStorage.getItem(this.REFRESH_TOKEN) != null;
    }
}
