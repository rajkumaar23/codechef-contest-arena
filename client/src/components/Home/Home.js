/*
 * Copyright (c) 2020. RAJKUMAR
 */

import * as React from "react";
import Utils from "../Utils";
import {Redirect} from "react-router";
import API from "../API";

export class Home extends React.Component {
    state = {
        contests: []
    };


    handleInput = (e) => {
        let searchText = e.target.value.toLowerCase();
        let menuEl = document.getElementById('dropdown-menu');
        menuEl.innerHTML = null;
        if (this.state.contests.length > 0 && searchText.length > 0) {
            menuEl.innerHTML = '<div class="dropdown-content"></div>';
            let suggestionsInCode = this.state.contests.filter((el) => {
                return el.code.toLowerCase().includes(searchText)
            });
            suggestionsInCode = suggestionsInCode.slice(0, 5);
            let suggestionsInCodeEl = suggestionsInCode.map((el) => {
                let a = document.createElement('a');
                a.href = '#';
                a.classList.add('dropdown-item');
                a.innerHTML = el.code;
                a.dataset.value = el.code;
                return a
            });
            suggestionsInCodeEl.forEach(suggEl => {
                menuEl.childNodes[0].appendChild(suggEl)
            });

            let suggestionsInName = this.state.contests.filter((el) => {
                return el.name.toLowerCase().includes(searchText)
            });
            suggestionsInName = suggestionsInName.slice(0, 5);
            console.log(suggestionsInName);
            let suggestionsInNameEl = suggestionsInName.map((el) => {
                let a = document.createElement('a');
                a.href = '#';
                a.classList.add('dropdown-item');
                a.innerHTML = el.name;
                a.dataset.value = el.code;
                return a
            });
            suggestionsInNameEl.forEach(suggEl => {
                menuEl.childNodes[0].appendChild(suggEl)
            });
            if (suggestionsInName.length > 0) {
                menuEl.style.display = 'block'
            }
        }
    };

    componentDidMount() {
        API.get('/contests').then(res => {
            this.setState({
                contests: res.data.result.data.content.contestList
            });
        });
    }

    render() {
        if (!Utils.isLoggedIn()) {
            return <Redirect to='/'/>;
        }
        return <div className="hero-body">
            <div className="container has-text-centered">
                <div className="column is-10 is-offset-1">
                    <h1 className="title">
                        Enter a Contest Code or Name
                    </h1>
                    <div className="is-active is-fullwidth">
                        <div className="dropdown-trigger">
                            <div className="field">
                                <p className="control is-expanded has-icons-right">
                                    <input className="input" type="search" placeholder="Search..."
                                           onInput={this.handleInput}/>
                                    <span className="icon is-small is-right"><i className="fas fa-search"/></span>
                                </p>
                            </div>
                        </div>
                        <div className="c-dropdown-menu is-centered" id="dropdown-menu" role="menu">

                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default Home;
