/*
 * Copyright (c) 2020. RAJKUMAR
 */

import React from 'react';
import './App.css';
import Login from './components/Login/Login'
import {BrowserRouter as Router, Route} from "react-router-dom";
import Nav from "./components/Nav/Nav";
import OAuth from "./components/OAuth/OAuth";
import {Home} from "./components/Home/Home";
import Footer from "./components/Footer/Footer";
import Contest from "./components/Contest/Contest";
import Problem from "./components/Problem/Problem";
import Submit from "./components/Submit/Submit";

function App() {
    return (
        <section className="hero is-dark is-fullheight">
            <div className="hero-head">
                <Router>
                    <Nav/>
                    <Route exact path="/" component={Login}/>
                    <Route path="/oauth" component={OAuth}/>
                    <Route exact path="/contests" component={Home}/>
                    <Route exact path="/contest/:code" component={Contest}/>
                    <Route exact path="/contest/:code/problems/:problemCode" component={Problem}/>
                    <Route exact path="/contest/:code/problems/:problemCode/submit" component={Submit}/>
                    <Footer/>
                </Router>
            </div>
        </section>
    );
}

export default App;
