/*
 * Copyright (c) 2020. RAJKUMAR
 */

import * as React from "react";
import API from "../API";
import DataTable from "react-data-table-component";
import {Link} from "react-router-dom";
import showdownKatex from "showdown-katex";
import './Problem.css';
import Utils from "../Utils";

const showdown = require('showdown');
const converter = new showdown.Converter({

    extensions: [
        showdownKatex({
            throwOnError: true,
            errorColor: '#1500ff',
            macros: {
                href: "{}"
            },
            delimiters: [
                {left: '$', right: '$', display: false}
            ]
        }),
    ],
});

const _EscapeMathJax = (str) => {
    if (str) {
        return str.replace(/([-\\`*_{}[\]()#+.!])/g, '\\$1');
    }
};
const isMarkdownString = (str) => {
    const isHtml = /<b>(.*?)<\/b>/.test(str)
        || /<p>(.*?)<\/p>/.test(str)
        || /<ul>(.*?)<\/ul>/.test(str)
        || /<li>(.*?)<\/li>/.test(str)
        || /<br>(.*?)/.test(str)
        || /(.*?)<\/br>/.test(str);

    return !isHtml;
};

const getProcessedMarkdown = (text) => {
    // If the statement is not in markdown, do nothing.
    if (!text || !isMarkdownString(text)) {
        return text;
    }

    // MathJax support: Escape Markdown special characters
    text = text.replace(/~/g, '~T');
    text = text.replace(/\$\$([^]*?)\$\$/g, _EscapeMathJax);
    text = text.replace(/\$([^]*?)\$/g, _EscapeMathJax);

    return text;
};

class Problem extends React.Component {

    recents = [];
    state = {
        body: '',
        name: '',
        successfulSubmissions: []
    };
    recentsColumns = [
        {name: 'Time', selector: 'time', center: true},
        {
            name: 'Username', selector: 'user', center: true, wrap: true, button: true,
            cell: row => <a className="has-text-light"
                            href={"https://codechef.com/users/" + row.user} target="_blank"
                            rel="noopener noreferrer"><u>{row.user}</u></a>
        },
        {name: 'Memory', selector: 'mem', center: true},
        {name: 'Language', selector: 'lang', center: true},
    ];

    componentDidMount() {
        Utils.Toast.fire({
            icon: 'info',
            title: 'Please wait while the data is being fetched'
        });
        API.get('/problem?contestCode=' + this.props.match.params.code + '&problemCode=' + this.props.match.params.problemCode).then(res => {
            let data = res.data;
            let temp = data.body.replace(/<br \/>/g, "\n");
            // temp = temp.replace(/\$/g, '$$$$');
            console.log(temp);
            temp = converter.makeHtml(getProcessedMarkdown(temp));
            this.setState({
                body: temp,
                name: data.name,
                author: data.author
            });
        });

        API.get('/submissions?contestCode=' + this.props.match.params.code + '&problemCode=' + this.props.match.params.problemCode)
            .then(res => {
                this.setState({
                    successfulSubmissions: res.data
                });
                Utils.Toast.close();
            });
    }

    init = () => {
        if (this.state.successfulSubmissions) {
            this.recents = [];
        }
        for (let item of this.state.successfulSubmissions) {
            this.recents.push({
                user: item.username,
                time: item.time,
                mem: Number((item.memory / 1024).toFixed(1)) + 'MB',
                lang: item.language
            });
        }
    };

    render() {
        this.init();
        return <div className="hero-body">
            <div className="container">
                <h6 className="subtitle is-5 has-text-light"><Link
                    to={'/contest/' + this.props.match.params.code}>&#x25c0; {this.props.match.params.code}</Link>
                </h6>
                <div className="columns">
                    <div className="column is-three-fifths problem has-background-white has-text-dark">
                        <div className="has-text-dark">
                            <u className="title is-3 has-text-dark">{this.state.name}</u>
                            {this.state.author ? '  (author : ' : ''}
                            <a className="has-text-info"
                               href={"https://codechef.com/users/" + this.state.author}
                               target="_blank"
                               rel="noopener noreferrer">{this.state.author}
                            </a>
                            {this.state.author ? ')' : ''}
                        </div>
                        <br/>
                        <div id="problem-body" dangerouslySetInnerHTML={{__html: this.state.body}}>
                        </div>
                    </div>
                    <div className="column is-two-fifths" style={{"marginLeft": "20px"}}>
                        <Link className="button is-info is-rounded" style={{marginBottom: "20px"}}
                              to={"/contest/" + this.props.match.params.code + "/problems/" + this.props.match.params.problemCode + "/submit"}>Submit
                            solution</Link>
                        <br/>
                        <p className="title is-6">Successful Submissions</p>
                        <DataTable
                            noHeader={true}
                            columns={this.recentsColumns}
                            data={this.recents}
                            pagination={true}
                            theme={'dark'}
                        />
                    </div>
                </div>
            </div>
        </div>;

    }
}

export default Problem;
