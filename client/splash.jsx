import React, { Component } from 'react';
import { render } from 'react-dom';

import './stylesheets/splash.css';

export default class Splash extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: ''};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        alert('A username was subbmited ' + this.state.value);
        console.log(this.state.value);
        event.preventDefault();
    }

    render () {
        console.log('why');
        return (
            <div className="splash">
                <h1>welcome to loquat</h1>
                <img className="splash-photo" src={require("/Users/joshcretella/Desktop/CS45/solo-project/loquat-128.png")} alt={"loquat"}/>
                <p>sign up to find ripe, lush fruit in your neighborhood</p>
                <p className="version">Version 0.14</p>
                <form onSubmit={this.handleSubmit}>
                    <label>
                        username:
                        <input id="name" type="text" value={this.state.value} onChange={this.handleChange} />
                    </label>
                    <br></br>
                    <label>
                        password: 
                        <input type="text" id="pwd" value={this.state.password} onChange={this.handleChange} />
                    </label>
                   <br></br>
                    <input type="submit" value="create user" id="button"/>
                    <input type="submit" value="submit" id="button"/>
                    <br></br>

                </form>
                </div>
        );
    }
}

