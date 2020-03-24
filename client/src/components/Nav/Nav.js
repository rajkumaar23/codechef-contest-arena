/*
 * Copyright (c) 2020. RAJKUMAR
 */

import * as React from "react";
import Utils from "../Utils";
import {Link} from "react-router-dom";

function NavBarBrand() {
    return <div className="navbar-brand">
        <Link className="navbar-item has-text-light has-text-weight-bold" to="/">
            <img src="/logo512.png" alt={"Logo"}/>
            &nbsp; CodeChef Contest Arena
        </Link>
    </div>
}

/**
 * @return {null}
 */
function NavBarMenu(props) {
    if (Utils.isLoggedIn()) {
        return <div id="navbarMenu" className="navbar-menu">
            <div className="navbar-end">
                <span className="navbar-item">
                    <button className="button is-white is-outlined" onClick={props.this.logout}>
                        <span className="icon">
                            <i className="fa fa-sign-out-alt"/>
                        </span>
                        <span>Logout{props.this.state.username ? ', ' + props.this.state.username : ''}</span>
                    </button>
                </span>
            </div>
        </div>
    } else {
        return null;
    }
}

class Nav extends React.Component {
    state = {
        username: ''
    };

    logout = () => {
        localStorage.clear();
        this.setState({
            redirect: true
        });
    };

    componentDidMount() {
        // if (Utils.isLoggedIn()) {
        //     API.get(Utils.API_URL + '/users/me')
        //         .then(res => {
        //             this.setState({
        //                 username: res.data.result.data.content.username
        //             });
        //         })
        // }
    }

    render() {
        if (this.state.redirect) {
            window.location.href = "/";
        }
        return <nav className="navbar">
            <div className="container">
                <NavBarBrand/>
                <NavBarMenu this={this}/>
            </div>
        </nav>
            ;
    }
}

export default Nav;
