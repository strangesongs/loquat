import React, { Component } from 'react';
import { render } from 'react-dom';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";

import './stylesheets/splash.css';

export default class Splash extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: '',
            password: ''}

        this.handleUserChange = this.handleUserChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleUserChange(event) {
        this.setState({user: event.target.value});
    }

    handlePasswordChange(event) {
        this.setState({password: event.target.value});
    }

    handleSubmit(event) {
        alert('A new user has been created ' + this.state.user);
        console.log(this.state.user, this.state.password);
        event.preventDefault();
    }

    render () {
        return (
            <Router>
            <div className="splash">
                <h1>welcome to loquat</h1>
                <img className="splash-photo" src={require("/Users/joshcretella/Desktop/CS45/solo-project/loquat-128.png")} alt={"loquat"}/>
                <p>sign up to find ripe, lush fruit in your neighborhood</p>
                <p className="version">Version 0.14</p>
                <form onSubmit={this.handleSubmit}>
                    <label>
                        username:
                        <input id="name" type="text" value={this.state.value} onChange={this.handleUserChange} />
                    </label>
                    <br></br>
                    <label>
                        password: 
                        <input type="password" id="pwd" value={this.state.password} onChange={this.handlePasswordChange} />
                    </label>
                   <br></br>
    
                    <Link to='/map'><input 
                    type="submit" 
                    value="create user" 
                    id="create"
                    /></Link>
                    
                    <input type="submit" value="submit" id="login"/>

                    <br></br>
                 
                </form>
                </div>
                </Router>
        );
    }
}

