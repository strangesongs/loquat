import React, { Component } from 'react';
import { render } from 'react-dom';

import './stylesheets/map.css';

export default class Map extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: ''};

            // take the object of saved pins from database, save it to variable and then update value of app state

}
    render () {
        return (
        <div className="map">
            <p>hello</p>
        </div>
        )
    };

};