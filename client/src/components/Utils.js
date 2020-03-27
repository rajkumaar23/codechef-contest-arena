/*
 * Copyright (c) 2020. RAJKUMAR
 */

import Swal from "sweetalert2";

export default class Utils {
    static ACCESS_TOKEN = 'access_token';
    static REFRESH_TOKEN = 'refresh_token';
    static API_URL = (window.location.hostname === 'localhost' ? 'http://0.0.0.0:2304' : 'https://codechef-arena.herokuapp.com');
    static BACKEND_URL = Utils.API_URL;
    static Toast = Swal.mixin({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timerProgressBar: false,
    });

    static isLoggedIn() {
        return localStorage.getItem(this.ACCESS_TOKEN) != null && localStorage.getItem(this.REFRESH_TOKEN) != null;
    }

    static getModeMap() {
        let modeMap = new Map();
        modeMap.set('JavaScript', 'javascript');
        modeMap.set('C', 'clike');
        modeMap.set('C++ 4.3.2', 'clike');
        modeMap.set('C++ 6.3', 'clike');
        modeMap.set('C++ 14', 'clike');
        modeMap.set('C++ 17', 'clike');
        modeMap.set('C#', 'clike');
        modeMap.set('Java', 'clike');
        modeMap.set('Kotlin', 'clike');
        modeMap.set('Go', 'go');
        modeMap.set('Python 2', 'python');
        modeMap.set('Python 3', 'python');
        modeMap.set('PHP', 'php');
        modeMap.set('Swift', 'swift');
        return modeMap;
    }

    static codeChefLangMap() {
        let langMapCodeChef = new Map();
        langMapCodeChef.set('JavaScript', 'JS');
        langMapCodeChef.set('C', 'C');
        langMapCodeChef.set('C++ 4.3.2', 'C++ 4.3.2');
        langMapCodeChef.set('C++ 6.3', 'C++ 6.3');
        langMapCodeChef.set('C++ 14', 'C++14');
        langMapCodeChef.set('C++ 17', 'C++17');
        langMapCodeChef.set('C#', 'C#');
        langMapCodeChef.set('Java', 'JAVA');
        langMapCodeChef.set('Kotlin', 'KTLN');
        langMapCodeChef.set('Go', 'GO');
        langMapCodeChef.set('Python 2', 'PYTH');
        langMapCodeChef.set('Python 3', 'PYTH 3.6');
        langMapCodeChef.set('PHP', 'PHP');
        langMapCodeChef.set('Swift', 'swift');
        return langMapCodeChef;
    }
}
