import React, { Component } from 'react';
import { render } from 'react-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

import './stylesheets/map.css';
import './stylesheets/sidebar.css'


export default class Map extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fruit: ['pomegrante', 'avocado 🥑', 'valencia oranges 🍊', 'avocado 🥑', 'lime', 'meyer lemon 🍋', 'lemon 🍋', 'loquat', 'loquat', 'pomegrante', 'orange 🍊'],
            markers: [[34.058740, -118.303390], [34.058015, -118.325481], [34.054303, -118.303257], [34.063056, -118.340646], [34.063056, -118.340646], [34.079417, -118.298002], [34.068309, -118.276371], [34.054069, -118.306394], [34.054007, -118.304173]]
        };
            // take the object of saved pins from database, save it to variable and then update value of app state
}

    render () {
      console.log(this.state.markers)
      console.log(this.state.fruit[0])
        return (
            <div id="mapid">
            <MapContainer center={[34.058740, -118.303390]} zoom={16} scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={this.state.markers[0]} draggable>
              <Popup>
              {this.state.fruit[0]}
              </Popup>
              </Marker>
              <Marker position={this.state.markers[1]} draggable>
              <Popup>
              {this.state.fruit[1]}
              </Popup>
              </Marker>
              <Marker position={this.state.markers[2]} draggable>
              <Popup>
              {this.state.fruit[2]}
              </Popup>
              </Marker>
              <Marker position={this.state.markers[3]} draggable>
              <Popup>
              {this.state.fruit[3]}
              </Popup>
              </Marker>
              <Marker position={this.state.markers[4]} draggable>
              <Popup>
              {this.state.fruit[4]}
              </Popup>
              </Marker>
              <Marker position={this.state.markers[5]} draggable>
              <Popup>
              {this.state.fruit[5]}
              </Popup>
              </Marker>
              <Marker position={this.state.markers[6]} draggable>
              <Popup>
              {this.state.fruit[6]}
              </Popup>
              </Marker>
              <Marker position={this.state.markers[7]} draggable>
              <Popup>
              {this.state.fruit[7]}
              </Popup>
              </Marker>
              <Marker position={this.state.markers[8]} draggable>
              <Popup>
              {this.state.fruit[8]}
              </Popup>
              </Marker>
           
          
          </MapContainer>
          </div>
        )
    };

};