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
import Particles from "react-particles-js";

function App() {
    return (
        <section className="hero is-dark is-fullheight">
            <div className="hero-head">
                <Particles
                    style={{
                        position: "fixed",
                        width: "100%",
                        height: "100%"
                    }}
                    params={{
                        "particles": {
                            "number": {
                                "value": 160,
                                "density": {
                                    "enable": false
                                }
                            },
                            "size": {
                                "value": 3,
                                "random": true,
                                "anim": {
                                    "speed": 4,
                                    "size_min": 0.3
                                }
                            },
                            "line_linked": {
                                "enable": false
                            },
                            "move": {
                                "random": true,
                                "speed": 1,
                                "direction": "top",
                                "out_mode": "out"
                            }
                        },
                        "interactivity": {
                            "events": {
                                "onhover": {
                                    "enable": true,
                                    "mode": "bubble"
                                },
                                "onclick": {
                                    "enable": true,
                                    "mode": "repulse"
                                }
                            },
                            "modes": {
                                "bubble": {
                                    "distance": 250,
                                    "duration": 2,
                                    "size": 0,
                                    "opacity": 0
                                },
                                "repulse": {
                                    "distance": 400,
                                    "duration": 4
                                }
                            }
                        }
                    }} />
                <Router>
                    <Nav/>
                    <Route exact path="/" component={Login}/>
                    <Route path="/oauth" component={OAuth}/>
                    <Route exact path="/contests" component={Home}/>
                    <Route exact path="/contest/:code" component={Contest}/>
                    <Footer/>
                </Router>
            </div>
        </section>
    );
}

export default App;
