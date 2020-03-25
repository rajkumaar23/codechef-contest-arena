/*
 * Copyright (c) 2020. RAJKUMAR
 */

import * as React from "react";
import {Link} from "react-router-dom";
import AceEditor from "react-ace";

const languages = ["javascript", "java", "python", "xml", "ruby", "sass", "markdown", "mysql", "json", "html", "handlebars", "golang", "csharp", "elixir", "typescript", "css"];
languages.forEach(lang => {
    require(`ace-builds/src-noconflict/mode-${lang}`);
    require(`ace-builds/src-noconflict/snippets/${lang}`);
});

const themes = ["monokai", "github", "tomorrow", "kuroir", "twilight", "xcode", "textmate", "solarized_dark", "solarized_light", "terminal"];
themes.forEach(theme => require(`ace-builds/src-noconflict/theme-${theme}`));

/**
 * @return {null}
 */
function Output(props) {
    if (props.this.state.output) {
        return (
            <div className="content" style={{marginTop: '50px'}}>
                <label>Output</label>
                <div className="box" style={{marginTop: '8px'}}>
                    {props.this.state.output}
                </div>
            </div>
        )
    } else {
        return null;
    }
}

export default class Submit extends React.Component {
    state = {
        theme: "github",
        mode: "javascript",
        code: ''
    };

    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.setTheme = this.setTheme.bind(this);
        this.setMode = this.setMode.bind(this);
    }

    setTheme(e) {
        this.setState({
            theme: e.target.value
        });
    }

    setMode(e) {
        this.setState({
            mode: e.target.value
        });
    }

    onChange(newValue) {
        console.log("change", newValue);
        this.setState({
            code: newValue
        });
    }

    render() {
        return <div className="hero-body">
            <div className="container">
                <p className="subtitle is-5 has-text-light"><Link
                    to={'/contest/' + this.props.match.params.code + "/problems/" + this.props.match.params.problemCode}>
                    &#x25c0; {this.props.match.params.problemCode}</Link>
                </p>
                <p className="subtitle is-4 has-text-light has-text-centered">Submit Solution</p>
                <div className="columns" style={{margin: "10px"}}>
                    <div className="column1">
                        <div className="field">
                            <label>Theme</label>
                            <p className="control">
                      <span className="select is-small">
                        <select
                            name="Theme"
                            onChange={this.setTheme}
                            value={this.state.theme}
                        >
                          {themes.map(it => (
                              <option key={it} value={it}>
                                  {it.toUpperCase()}
                              </option>
                          ))}
                        </select>
                      </span>
                            </p>
                        </div>
                    </div>
                    &nbsp;&nbsp;
                    <div className="column2">
                        <div className="field">
                            <label>Mode</label>
                            <p className="control">
                              <span className="select is-small">
                                <select
                                    name="mode"
                                    onChange={this.setMode}
                                    value={this.state.mode}
                                >
                                  {languages.map(lang => (
                                      <option key={lang} value={lang}>
                                          {lang.toUpperCase()}
                                      </option>
                                  ))}
                                </select>
                              </span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="columns">
                    <div className="column is-fullwidth">
                        <AceEditor
                            style={{width: "100%"}}
                            mode={this.state.mode}
                            theme={this.state.theme}
                            onChange={this.onChange}
                            value={this.state.code}
                            fontSize={14}
                            showPrintMargin={false}
                            highlightActiveLine={true}
                            setOptions={{
                                enableBasicAutocompletion: true,
                                enableLiveAutocompletion: true,
                                enableSnippets: true,
                                showLineNumbers: true,
                                tabSize: 2,
                            }}/>
                    </div>
                </div>
                <div className="control">
                    <label htmlFor="exampleFormControlTextarea1">Custom Input</label>
                    <textarea className="textarea has-fixed-size" style={{marginTop: '8px'}}/>
                </div>
                <br/>
                <div className="content">
                    <div className="field is-grouped is-pulled-right">
                        <p className="control">
                            <button className="button is-link">
                                Run the code
                            </button>
                        </p>
                        <p className="control">
                            <button className="button is-success">
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
