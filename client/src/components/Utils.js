/*
 * Copyright (c) 2020. RAJKUMAR
 */

export default class Utils {
    static ACCESS_TOKEN = 'access_token';
    static REFRESH_TOKEN = 'refresh_token';
    static API_URL = 'https://api.codechef.com';
    static BACKEND_URL = 'https://codechef-arena.herokuapp.com';

    static isLoggedIn() {
        return sessionStorage.getItem(this.ACCESS_TOKEN) && sessionStorage.getItem(this.REFRESH_TOKEN);
    }
}
