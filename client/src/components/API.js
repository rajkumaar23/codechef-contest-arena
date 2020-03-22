/*
 * Copyright (c) 2020. RAJKUMAR
 */

import axios from 'axios';
import Utils from "./Utils";

export default axios.create({
    baseURL: Utils.API_URL,
    headers: {
        'Authorization': 'Bearer ' + sessionStorage.getItem(Utils.ACCESS_TOKEN)
    }
})

