import React, { Component } from 'react';
import { render } from 'react-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

import './stylesheets/map.css';
import './stylesheets/sidebar.css'

class Map extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pins: [], // Pins from database
            loading: true,
            error: null
        };
    }

    componentDidMount() {
        this.fetchPins();
    }

    fetchPins = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/pins');
            const result = await response.json();
            
            if (result.success) {
                this.setState({ 
                    pins: result.pins, 
                    loading: false 
                });
            } else {
                console.error('Failed to fetch pins:', result.message);
                this.setState({ 
                    error: 'Failed to load pins', 
                    loading: false 
                });
            }
        } catch (error) {
            console.error('Error fetching pins:', error);
            this.setState({ 
                error: 'Error loading pins', 
                loading: false 
            });
        }
    };

    // Method to refresh pins (called from parent when new pin is submitted)
    refreshPins = () => {
        this.setState({ loading: true });
        this.fetchPins();
    };

    render() {
        const { pins, loading, error } = this.state;

        return (
            <div className='mapAndSidebar'>
                <div className='mapContainer'>
                    <MapContainer center={[34.061415, -118.293991]} zoom={13} scrollWheelZoom={false}>
                        <TileLayer
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                        />
                        {loading && (
                            <div className="loading-overlay">
                                Loading pins...
                            </div>
                        )}
                        {error && (
                            <div className="error-overlay">
                                {error}
                            </div>
                        )}
                        {
                            pins.map((pin) => {
                                return (
                                    <Marker 
                                        position={[pin.coordinates.lat, pin.coordinates.lng]} 
                                        key={pin.pinId}
                                    >
                                        <Popup>
                                            <div className="pin-popup">
                                                <div className="popup-header">
                                                    <h3 className="fruit-title">{pin.fruitTypeDisplay.toLowerCase()}</h3>
                                                </div>
                                                
                                                <div className="popup-content">
                                                    {pin.notes && (
                                                        <div className="notes-section">
                                                            <strong>notes:</strong>
                                                            <p className="pin-notes">{pin.notes}</p>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="metadata-grid">
                                                        <div className="metadata-item">
                                                            <strong>location:</strong>
                                                            <span>{pin.coordinates.lat.toFixed(6)}, {pin.coordinates.lng.toFixed(6)}</span>
                                                        </div>
                                                        
                                                        <div className="metadata-item">
                                                            <strong>added by:</strong>
                                                            <span>{pin.submittedBy || 'anonymous'}</span>
                                                        </div>
                                                        
                                                        <div className="metadata-item">
                                                            <strong>date:</strong>
                                                            <span>{new Date(pin.createdAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })
                        }
                    </MapContainer>
                </div>
            </div>
        );
    }

}

export default Map;
