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

    getSuggestions = (menuEl, searchText, mode) => {
        let suggestions = this.state.contests.filter((el) => {

            return mode === 'code'
                ? el.code.toLowerCase().includes(searchText)
                : el.name.toLowerCase().includes(searchText)


        });
        suggestions = suggestions.slice(0, 5);
        return suggestions.map((el) => {
            let a = document.createElement('a');
            a.classList.add('dropdown-item');
            a.innerHTML = mode === 'code' ? el.code : el.name;
            a.href = '/contest/' + el.code;
            return a
        });
    };


    handleInput = (e) => {
        let searchText = e.target.value.toLowerCase();
        let menuEl = document.getElementById('dropdown-menu');
        menuEl.innerHTML = null;
        if (this.state.contests.length > 0 && searchText.length > 0) {
            menuEl.innerHTML = '<div class="dropdown-content"></div>';
            let suggestionsInCode = this.getSuggestions(menuEl, searchText, 'code');
            suggestionsInCode.forEach(item => {
                menuEl.childNodes[0].appendChild(item)
            });
            let suggestionsInName = this.getSuggestions(menuEl, searchText, 'name');
            suggestionsInName.forEach(item => {
                menuEl.childNodes[0].appendChild(item)
            });
            if ((suggestionsInName.length <= 0) && (suggestionsInCode.length <= 0)) {
                menuEl.innerHTML = null;
            } else {
                menuEl.style.display = 'block';
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
                        <div className="c-dropdown-menu is-centered" id="dropdown-menu" role="menu"/>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default Home;
