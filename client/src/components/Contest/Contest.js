/*
 * Copyright (c) 2020. RAJKUMAR
 */

import * as React from "react";
import API from "../API";
import {Link} from "react-router-dom";
import './Contest.css';

class Contest extends React.Component {

    state = {
        problems: [],
        banner: '',
        submissions: [],
        endDate: '',
        currentTime: '',
        days: '',
        hours: '',
        minutes: '',
        seconds: ''
    };

    rows = [];
    recents = [];

    constructor(props) {
        super(props);
        this.timer = this.timer.bind(this);
    }

    timer = () => {

        if (this.state.endDate === '') {
            return
        }

        // Get today's date and time
        let now = new Date().getTime();

        // Find the distance between now and the count down date
        const distance = new Date(this.state.endDate) - now;

        // Time calculations for days, hours, minutes and seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the element with id="demo"
        this.setState({
            days,
            hours,
            minutes,
            seconds
        });

        // If the count down is finished, write some text
        if (distance < 0) {
            clearInterval(this.state.intervalId);
            this.setState({
                days : 0,
                hours : 0,
                minutes : 0,
                seconds : 0
            });
        }
    };

    getDetails = () => {
        API.get('/contests/' + this.props.match.params.code).then(res => {
            this.setState({
                problems: res.data.result.data.content.problemsList,
                banner: res.data.result.data.content.bannerFile,
                endDate: res.data.result.data.content.endDate,
                currentTime: res.data.result.data.content.currentTime,
            })
        });
        API.get('/submissions/?contestCode=' + this.props.match.params.code).then(res => {
            try {
                this.setState({
                    submissions: res.data.result.data.content
                });
            } catch (e) {
                console.error(e);
            }
        });
    };

    init = () => {
        if(this.state.problems){
            this.rows = [];
        }
        if(this.state.submissions){
            this.recents = [];
        }
        for (let item of this.state.problems) {
            this.rows.push(<tr>
                <td className="has-text-centered">
                    <Link to={'/contest/' + this.props.match.params.code + '/problems/' + item.problemCode}>
                        {item.problemCode}
                    </Link>
                </td>
                <td className="has-text-centered">{item.successfulSubmissions}</td>
                <td className="has-text-centered">{Number((item.accuracy).toFixed(2))}</td>
            </tr>)
        }
        for (let item of this.state.submissions.slice(0, 5)) {
            this.recents.push(<tr>
                <td className="has-text-centered">{item.date}</td>
                <td className="has-text-centered">{item.username}</td>
                <td className="has-text-centered">
                    <Link to={'/contest/' + this.props.match.params.code + '/problems/' + item.problemCode}>
                        {item.problemCode}
                    </Link>
                </td>
                <td className="has-text-centered">{item.result}</td>
            </tr>)
        }
    };

    componentDidMount() {
        this.getDetails();
        const intervalId = setInterval(this.timer, 1000);
        this.setState({intervalId: intervalId});
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalId);
    }

    render() {
        this.init();
        return <div className="hero-body">
            <div className="container has-text-centered">
                <div className="columns">
                    <div className="column is-three-fifths">
                        <img className="contest-banner" src={this.state.banner} alt="Contest Banner"/>
                        <p className="title is-3">Problems in {this.props.match.params.code}</p>
                        <div className="table-container table__wrapper">
                            <table className="table is-fullwidth">
                                <thead>
                                <tr>
                                    <th className="has-text-centered">Problem Code</th>
                                    <th className="has-text-centered">Successful Submissions</th>
                                    <th className="has-text-centered">Accuracy</th>
                                </tr>
                                </thead>
                                <tbody>{this.rows}</tbody>
                            </table>
                        </div>
                    </div>
                    <div className="column is-two-fifths">
                        <p className="title is-5"><u>Contest Ends In</u></p>
                        <div id="countdown">
                            <div id='tiles'>
                                <span>{this.state.days}</span>
                                <span>{this.state.hours}</span>
                                <span>{this.state.minutes}</span>
                                <span>{this.state.seconds}</span>
                            </div>
                            <div className="labels">
                                <li className="has-text-centered">Days</li>
                                <li className="has-text-centered">Hours</li>
                                <li className="has-text-centered">Mins</li>
                                <li className="has-text-centered">Secs</li>
                            </div>
                        </div>
                        <br/>
                        <p className="title is-5">Recent activity</p>
                        <div className="table-container table__wrapper">
                            <table className="table is-fullwidth">
                                <thead>
                                <tr>
                                    <th className="has-text-centered">Date</th>
                                    <th className="has-text-centered">Username</th>
                                    <th className="has-text-centered">Problem Code</th>
                                    <th className="has-text-centered">Result</th>
                                </tr>
                                </thead>
                                <tbody>{this.recents}</tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default Contest;
