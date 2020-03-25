/*
 * Copyright (c) 2020. RAJKUMAR
 */

import React from "react";

class Footer extends React.Component {
    render() {
        return (
            <footer className="footer has-background-dark">
                <div className="content has-text-centered">
                    <a className="has-text-light" href="https://rajkumaar.co.in">
                        <span><i className="far fa-copyright"/> {new Date().getFullYear()} | Rajkumar S</span>
                    </a>
                </div>
            </footer>
        );
    }
}

export default Footer;
