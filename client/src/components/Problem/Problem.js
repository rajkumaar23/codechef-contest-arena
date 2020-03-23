/*
 * Copyright (c) 2020. RAJKUMAR
 */

import * as React from "react";
import API from "../API";

const ReactMarkdown = require('react-markdown/with-html');

class Problem extends React.Component {

    recents = [];
    state = {
        body: '',
        name: '',
        successfulSubmissions: []
    };

    componentDidMount() {
        API.get('/contests/' + this.props.match.params.code + '/problems/' + this.props.match.params.problemCode).then(res => {
            let data = res.data.result.data.content;
            this.setState({
                body: data.body,
                name: data.problemName
            });
        });

        API.get('/submissions/?result=AC&contestCode='
            + this.props.match.params.code + '&problemCode=' + this.props.match.params.problemCode).then(res => {
            this.setState({
                successfulSubmissions: res.data.result.data.content
            })
        })
    }

    init = () => {
        if (this.state.successfulSubmissions) {
            this.recents = [];
        }
        for (let item of this.state.successfulSubmissions.slice(0, 10)) {
            this.recents.push(<tr>
                <td className="has-text-centered">{item.username}</td>
                <td className="has-text-centered">{item.time}</td>
                <td className="has-text-centered">{Number((item.memory / 1024).toFixed(1)) + 'MB'}</td>
                <td className="has-text-centered">{item.language}</td>
            </tr>)
        }
    };

    render() {
        this.init();
        return <div className="hero-body">
            <div className="container">
                <div className="columns">
                    <div className="column is-three-fifths problem has-background-white">
                        <p className="title is-2 has-text-dark"><u>{this.state.name}</u></p>
                        <ReactMarkdown className="has-text-dark"
                                       source={this.state.body}
                                       escapeHtml={false}
                        />
                        {/*<div dangerouslySetInnerHTML={{__html:this.state.body}}>*/}
                        {/*</div>*/}
                    </div>
                    <div className="column is-two-fifths" style={{"marginLeft": "20px"}}>
                        <form action={this.backendURL + '/login'}>
                            <input name="redirect"
                                   value={this.redirectURL}
                                   hidden readOnly/>
                            <button className="button is-info is-rounded"
                                    type="submit">Submit solution
                            </button>
                        </form>
                        <br/>
                        <p className="title is-6">Successful Submissions</p>
                        <div className="table-container table__wrapper">
                            <table className="table">
                                <thead>
                                <tr>
                                    <td className="has-text-centered">Username</td>
                                    <td className="has-text-centered">Time</td>
                                    <td className="has-text-centered">Memory</td>
                                    <td className="has-text-centered">Lang</td>
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

export default Problem;
