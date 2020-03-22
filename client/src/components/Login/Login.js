/*
 * Copyright (c) 2020. RAJKUMAR
 */

import * as React from "react";
import Utils from "../Utils";
import {Redirect} from "react-router";


class Login extends React.Component {
    backendURL = Utils.BACKEND_URL;

    redirectURL = "http://" + window.location.hostname + ':' + window.location.port + '/oauth';

    render() {
        if (Utils.isLoggedIn()) {
            return <Redirect to='/home'/>;
        }

        return <div className="hero-body">
            <div className="container has-text-centered">
                <div className="column is-6 is-offset-3">
                    <div className="card">
                        <div className="card-content">
                            <p className="title has-text-dark">
                                Contest Arena for CodeChef
                            </p>
                            <p className="subtitle has-text-dark">
                                You are required to login using your CodeChef account before proceeding to access the
                                contests.
                            </p>
                        </div>
                        <footer className="card-footer">
                            <div className="card-footer-item">
                              <span>
                                  <form action={this.backendURL + '/login'}>
                                      <input name="redirect"
                                             value={this.redirectURL}
                                             hidden readOnly/>
                                      <button className="button is-success is-rounded"
                                              type="submit">Login to the system</button>
                                  </form>
                              </span>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default Login;
