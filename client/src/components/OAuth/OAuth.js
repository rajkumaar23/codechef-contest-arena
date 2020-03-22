/*
 * Copyright (c) 2020. RAJKUMAR
 */

import * as React from "react";
import {Redirect} from "react-router";
import Utils from "../Utils";

class OAuth extends React.Component {
    render() {
        const urlParams = new URLSearchParams(this.props.location.search);
        if (urlParams.get(Utils.ACCESS_TOKEN) == null || urlParams.get(Utils.REFRESH_TOKEN) == null) {
            return <Redirect to='/'/>;
        }
        sessionStorage.setItem(Utils.ACCESS_TOKEN, urlParams.get(Utils.ACCESS_TOKEN));
        sessionStorage.setItem(Utils.REFRESH_TOKEN, urlParams.get(Utils.REFRESH_TOKEN));
        window.location.href = "/home";
    }
}

export default OAuth;
