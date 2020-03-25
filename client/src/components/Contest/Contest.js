/*
 * Copyright (c) 2020. RAJKUMAR
 */

import * as React from "react";
import API from "../API";
import './Contest.css';
import Swal from 'sweetalert2'
import DataTable from "react-data-table-component";

class Contest extends React.Component {

    state = {
        problems: [],
        banner: '',
        submissions: [],
        rankings: [],
        endDate: '',
        currentTime: '',
        days: '',
        hours: '',
        minutes: '',
        seconds: ''
    };

    rows = [];
    recents = [];
    rankings = [];
    recentsColumns = [
        {name: 'Date', selector: 'date', center: true, wrap: true, style: {fontSize: '10px'}},
        {
            name: 'Problem Code', selector: 'code', center: true, button: true,
            cell: row => <a className="has-text-light"
                            href={"/contest/" + this.props.match.params.code + "/problems/" + row.code}><u>{row.code}</u></a>
        },
        {
            name: 'Username', selector: 'user', center: true, wrap: true, button: true,
            cell: row => <a className="has-text-light"
                            href={"https://codechef.com/users/" + row.user} target="_blank"
                            rel="noopener noreferrer"><u>{row.user}</u></a>
        },
        {name: 'Result', selector: 'res', center: true},
    ];
    rankColumns = [
        {name: 'Rank', selector: 'rank', center: true, grow: 0, sortable: true},
        {
            name: 'Country', selector: 'country', center: true, grow: 0,
            cell: row => <img alt={row.country} src={"https://www.countryflags.io/" + row.country + "/flat/32.png"}
                              title={row.country}/>
        },
        {
            name: 'Username', selector: 'user', center: true, wrap: true, button: true, sortable: true,
            cell: row => <a className="has-text-light"
                            href={"https://codechef.com/users/" + row.user} target="_blank"
                            rel="noopener noreferrer"><u>{row.user}</u></a>
        },
        {name: 'Institution', selector: 'institution', center: true, wrap: true, sortable: true},
        {name: 'Score', selector: 'score', center: true},
    ];
    problemColumns = [
        {
            name: 'Problem Code', selector: 'code', center: true, button: true, width: '200px',
            cell: row => <a className="has-text-light"
                            href={"/contest/" + this.props.match.params.code + "/problems/" + row.code}><u>{row.code}</u></a>
        },
        {name: 'Successful Submissions', selector: 'successfulSubmissions', center: true},
        {name: 'Accuracy', selector: 'accuracy', center: true},
    ];

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
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
            });
        }
    };

    getDetails = () => {
        API.get('/contests/' + this.props.match.params.code).then(res => {
            this.setState({
                problems: res.data.problemsList,
                banner: res.data.contest.banner,
                endDate: res.data.contest.endDate,
            })
        }, err => {
            Swal.fire('Oops...', err.response.data.error, 'error').then(() => {
                window.location.href = "/contests";
            });


        });
        API.get('/submissions?contestCode=' + this.props.match.params.code).then(res => {
            this.setState({
                submissions: res.data
            });
        });

        API.get('/rankings?contestCode=' + this.props.match.params.code).then(res => {
            this.setState({
                rankings: res.data
            });
        });
    };

    init = () => {
        if (this.state.problems) {
            this.rows = [];
        }
        if (this.state.submissions) {
            this.recents = [];
        }
        if (this.state.rankings) {
            this.rankings = [];
        }
        for (let item of this.state.problems) {
            this.rows.push(
                {
                    code: item.code,
                    successfulSubmissions: item.successfulSubmissions,
                    accuracy: Number((item.accuracy)).toFixed(2)
                });
        }
        for (let item of this.state.submissions) {
            this.recents.push(
                {
                    date: item.date,
                    code: item.problemCode,
                    user: item.username,
                    res: item.result
                })
        }
        for (let item of this.state.rankings) {
            this.rankings.push(
                {
                    rank: parseInt(item.rank),
                    country: item.countryCode,
                    user: item.username,
                    institution: item.institution,
                    score: Number((item.score)).toFixed(1)
                })
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
                        <img className="contest-banner" src={this.state.banner} alt="Contest Banner"
                             style={{marginBottom: "20px"}}/>
                        <p className="title is-3">Problems in {this.props.match.params.code}</p>
                        <DataTable
                            noHeader={true}
                            columns={this.problemColumns}
                            data={this.rows}
                            theme={'dark'}
                        />
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
                        <a className="button is-info is-rounded" href="#rankList">Show Ranklist</a>
                        <br/>
                        <br/>
                        <p className="title is-5">Recent activity</p>
                        <DataTable
                            noHeader={true}
                            columns={this.recentsColumns}
                            data={this.recents}
                            pagination={true}
                            theme={'dark'}
                        />
                    </div>
                </div>
                <div id="rankList" className="has-text-centered">
                    <p className="title is-3 has-text-warning">Ranklist</p>
                    <DataTable
                        noHeader={true}
                        columns={this.rankColumns}
                        data={this.rankings}
                        pagination={true}
                        theme={'dark'}
                    />
                </div>
            </div>
        </div>;
    }
}

export default Contest;
