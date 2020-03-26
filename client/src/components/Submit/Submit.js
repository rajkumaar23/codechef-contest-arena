/*
 * Copyright (c) 2020. RAJKUMAR
 */

import * as React from "react";
import {Link, Redirect} from "react-router-dom";
import API from "../API";
import Utils from "../Utils";
import Swal from "sweetalert2";

const CodeMirror = require('react-codemirror');

const modeMap = Utils.getModeMap();
modeMap.forEach((value, key, map) => {
    require(`../../../node_modules/codemirror/mode/${value}/${value}`);
});
require('../../../node_modules/codemirror/lib/codemirror.css');

/**
 * @return {null}
 */
function Output(props) {
    console.log(props.this.state.output, props.this.state.cmpinfo, props.this.state.stderr);
    if (props.this.state.output) {
        return (
            <div className="content" style={{marginTop: '50px'}}>
                <label>Output</label>
                <div className="box" style={{marginTop: '8px'}}>
                    {props.this.state.output}
                </div>
            </div>
        )
    } else if (props.this.state.stderr || props.this.state.cmpinfo) {
        return <div className="content" style={{marginTop: '50px'}}>
            <label>Error</label>
            <div className="box is-warning" style={{marginTop: '8px'}}>
                {props.this.state.stderr || props.this.state.cmpinfo}
            </div>
        </div>;
    } else {
        return null;
    }
}

function ModeDropdown(props) {
    const temp = [];
    modeMap.forEach((value, key, map) => {
        temp.push(<option key={key} value={key}>
            {key.toUpperCase()}
        </option>)
    });
    return <select
        name="mode"
        onChange={props.this.setMode}
    >{temp}</select>
}

export default class Submit extends React.Component {
    state = {
        mode: "javascript",
        modeFull: "JavaScript",
        code: '',
        input: '',
        languages: [],
        output: '',
        stderr: '',
        cmpinfo: '',
        isLoading: false,
        submitted: false,
        isSubmitting: false
    };

    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.setTheme = this.setTheme.bind(this);
        this.setMode = this.setMode.bind(this);
        this.runCode = this.runCode.bind(this);
        this.onChangeInput = this.onChangeInput.bind(this);
        this.submitSolution = this.submitSolution.bind(this);
    }

    runCode() {
        if (this.state.code) {
            this.setState({
                isLoading: true,
                output: '',
                stderr: '',
                cmpinfo: '',
            });
            API.post('/ide/run', {
                code: this.state.code,
                lang: Utils.codeChefLangMap().get(this.state.modeFull),
                input: this.state.input
            }).then(res => {
                this.setState({
                    link: res.data.link
                });
                setTimeout(() => {
                    API.get('/ide/status?link=' + res.data.link).then(res => {
                        this.setState({
                            output: res.data.output,
                            stderr: res.data.stderr,
                            cmpinfo: res.data.cmpinfo,
                            isLoading: false
                        })
                    }, err => {
                        this.setState({
                            isLoading: false
                        });
                    });
                }, 2000);
            });
        } else {
            Swal.fire('Error', 'Your code is empty :(', 'error');
        }
    };


    submitSolution() {
        if (this.state.code) {
            this.setState({
                isSubmitting: true
            });
            setTimeout(() => {
                Swal.fire('Hooray', 'Your solution has been submitted', 'success').then(() => {
                    this.setState({
                        isSubmitting: false,
                        submitted: true
                    })
                });
            }, 2000);
        } else {
            Swal.fire('Error', 'Your code is empty :(', 'error');
        }
    }


    setTheme(e) {
        this.setState({
            theme: e.target.value
        });
    }

    setMode(e) {
        this.setState({
            mode: modeMap.get(e.target.value),
            modeFull: e.target.value
        });
    }

    onChange(newValue) {
        this.setState({
            code: newValue
        });
    }

    onChangeInput(e) {
        this.setState({
            input: e.target.value
        })
    }

    render() {
        if (this.state.submitted) {
            return <Redirect to={`/contest/${this.props.match.params.code}`}/>
        }
        return <div className="hero-body">
            <div className="container">
                <p className="subtitle is-5 has-text-light"><Link
                    to={'/contest/' + this.props.match.params.code + "/problems/" + this.props.match.params.problemCode}>
                    &#x25c0; {this.props.match.params.problemCode}</Link>
                </p>
                <p className="subtitle is-4 has-text-light has-text-centered">Submit Solution</p>
                <div className="field">
                    <label>Mode</label>
                    <p className="control">
                              <span className="select is-small">
                               <ModeDropdown this={this}/>
                              </span>
                    </p>
                </div>
                <CodeMirror value={this.state.code} onChange={this.onChange}
                            options={{lineNumbers: true, mode: this.state.mode}}
                            autoFocus={true}/>
                <div className="columns">
                    <div className="column is-fullwidth">
                    </div>
                </div>
                <div className="control">
                    <label htmlFor="exampleFormControlTextarea1">Custom Input</label>
                    <textarea className="textarea has-fixed-size" style={{marginTop: '8px'}}
                              onInput={this.onChangeInput}/>
                </div>
                <br/>
                <div className="content">
                    <div className="field is-grouped is-pulled-right">
                        <p className="control">
                            <button className={"button is-link " + (this.state.isLoading ? 'is-loading' : '')}
                                    onClick={this.runCode}>
                                Run the code
                            </button>
                        </p>
                        <p className="control">
                            <button className={"button is-success " + (this.state.isSubmitting ? 'is-loading' : '')}
                                    onClick={this.submitSolution}>
                                Submit solution
                            </button>
                        </p>
                    </div>
                </div>
                <Output this={this}/>
            </div>
        </div>;
    }
}
