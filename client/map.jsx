import React, { Component } from 'react';
import { render } from 'react-dom';

import './stylesheets/map.css';
import 'mapbox-gl/dist/mapbox-gl.css';


import mapboxgl from 'mapbox-gl'; // or "const mapboxgl = require('mapbox-gl');"

mapboxgl.accessToken = 'pk.eyJ1Ijoic3RyYW5nZXNvbmdzIiwiYSI6ImNrc3J4NTNvbTBlNHAybnByZjEwcGlva3EifQ.BGNJP4SkywtawjNawrSuGQ';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: [-74.5, 40], // starting position [lng, lat]
    zoom: 9 // starting zoom
});


export default class Map extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: ''};
            // take the object of saved pins from database, save it to variable and then update value of app state

}
    render () {
        return (
        <div id="map">
        </div>
        )
    };

};