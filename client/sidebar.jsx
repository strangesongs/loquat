import React, { Component } from 'react';
import { render } from 'react-dom';

import './stylesheets/sidebar.css';

export default class Sidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: ''};
            // take the object of saved pins from database, save it to variable and then update value of app state
}

    captureValue(e) {
        
    }
    render () {
        return (
        <div className="sidebar">
            <div className="top-bar">
            <button
                type="button"
                onClick={(e) => {
                e.preventDefault();
                window.location.href='index.html';}}
                >home</button>
           
                <button>user</button>
                <button>save map</button>

                <button
                type="button"
                onClick={(e) => {
                e.preventDefault();
                window.location.href='index.html';}}
                >home</button>
            </div>

            <div className="saved-pins">
                <h4>saved pins</h4>
                <ul>
                <li>pin goes here</li>
                <li>pin goes here</li>
                <li>pin goes here</li>
                <li>pin goes here</li>
                <li>pin goes here</li>
                </ul>
        </div>
        <div className="ready-fruit">
            <h4>ready to be picked</h4>
            <ul>
                <li>come pick me!</li>
                <li>come pick me!</li>
                <li>come pick me!</li>
                <li>come pick me!</li>
                <li>come pick me!</li>
                <li>come pick me!</li>
            </ul>
        </div>
        </div>
        )
    };

};