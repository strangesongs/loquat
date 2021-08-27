import React, { Component } from 'react';

import './stylesheets/sidebar.css';

export default class Sidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fruit: ['pomegrante 🔴', 'avocado 🥑', 'valencia oranges 🍊', 'avocado 🥑', 'lime 🟢', 'meyer lemon 🍋', 'lemon 🍋', 'loquat 🟡', 'loquat 🟡', 'pomegrante 🔴', 'orange 🍊'],
            markers: [[34.058740, -118.303390], [34.058015, -118.325481], [34.054303, -118.303257], [34.063056, -118.340646], [34.063056, -118.340646], [34.079417, -118.298002], [34.068309, -118.276371], [34.054069, -118.306394], [34.054007, -118.304173]]
        }
    };

   

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

                <button>save map</button>

                <button
                type="button"
                onClick={(e) => {
                e.preventDefault();
                window.location.href='index.html';}}
                >logout</button>
            </div>

            <div className="saved-pins">
                <h4>saved pins</h4>
                <ul>
                <li>{this.state.fruit[0]}</li>
                <li>{this.state.fruit[1]}</li>
                <li>{this.state.fruit[2]}</li>
                <li>{this.state.fruit[3]}</li>
                <li>{this.state.fruit[4]}</li>
                <li>{this.state.fruit[5]}</li>
        
                </ul>
            </div>
        <div className="ready-fruit">
            <h4>ready to be picked</h4>
            <ul>
                <li>{this.state.fruit[6]}</li>
                <li>{this.state.fruit[7]}</li>
                <li>{this.state.fruit[8]}</li>
                <li>{this.state.fruit[9]}</li>
                <li>{this.state.fruit[10]}</li>
                <li>{this.state.fruit[3]}</li>
            </ul>
        </div>

        <div className="add-marker">
            <h4>add a fruit location</h4>
            <input type="text" value="enter coordinates here" id="input-box"></input>
            <button type="submit" value="submit">submit</button>
        </div>

        <div className="copyright">
            <p>loquat v 0.14</p>
            <p>street fruit for all // always open source</p>
            <img className="lil-fruit" src={require("/Users/joshcretella/Desktop/CS45/solo-project/loquat-48.png")} alt={"loquat"}/>

    
        </div>
        </div>
        )
    };

};