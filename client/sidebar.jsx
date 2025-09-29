import React, { Component } from 'react';
import loquatIcon from '../loquat-48.png';

import './stylesheets/sidebar.css';

export default class Sidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // Pin submission form state
            currentLocation: null,
            fruitType: '',
            notes: '',
            submitting: false,
            showNotesPopup: false,
            currentUser: 'anonymous' // TODO: Get from login
        }
    };

    getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.setState({
                        currentLocation: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        }
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert('Unable to get location. Please check your browser settings.');
                }
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    };

    handleInputChange = (field, value) => {
        this.setState({ [field]: value });
    };

    toggleNotesPopup = () => {
        this.setState(prevState => ({
            showNotesPopup: !prevState.showNotesPopup
        }));
    };

    submitPin = async () => {
        const { currentLocation, fruitType, notes, currentUser } = this.state;

        if (!currentLocation) {
            alert('Please get your current location first');
            return;
        }

        if (!fruitType.trim()) {
            alert('Please enter a fruit type');
            return;
        }

        this.setState({ submitting: true });

        try {
            const response = await fetch('http://localhost:8080/api/pins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    coordinates: currentLocation,
                    fruitType: fruitType.trim(),
                    notes: notes.trim(),
                    submittedBy: currentUser
                })
            });

            const result = await response.json();

            if (result.success) {
                alert('Pin submitted successfully!');
                // Reset form
                this.setState({
                    currentLocation: null,
                    fruitType: '',
                    notes: '',
                    showNotesPopup: false
                });
                // Notify parent component to refresh map if callback provided
                if (this.props.onPinSubmitted) {
                    this.props.onPinSubmitted(result.pin);
                }
            } else {
                alert('Error submitting pin: ' + result.message);
            }
        } catch (error) {
            console.error('Error submitting pin:', error);
            alert('Error submitting pin. Please try again.');
        } finally {
            this.setState({ submitting: false });
        }
    };

   

    render () {
        return (
        <div className="sidebar">
            {/* Logo and branding at top */}
            <div className="header-section">
                <p>loquat 2.0</p>
                <p>street fruit for all // always open source</p>
                <img className="lil-fruit" src={loquatIcon} alt={"loquat"}/>
            </div>

            <div className="top-bar">
                <button
                    type="button"
                    onClick={(e) => {
                    e.preventDefault();
                    window.location.href='index.html';}}
                    >home</button>
            </div>

        <div className="add-marker">
            <h4>add fruit</h4>
            
            {/* Location Section */}
            <div className="form-section">
                <button 
                    type="button" 
                    onClick={this.getCurrentLocation}
                    className="location-btn"
                    disabled={this.state.submitting}
                >
                    get current location
                </button>
                {this.state.currentLocation && (
                    <div className="location-display">
                        <p>
                            location: {this.state.currentLocation.lat.toFixed(6)}, {this.state.currentLocation.lng.toFixed(6)}
                        </p>
                    </div>
                )}
            </div>

            {/* Fruit Type Section */}
            <div className="form-section">
                <label htmlFor="fruit-type">type:</label>
                <input 
                    type="text" 
                    id="fruit-type"
                    value={this.state.fruitType}
                    onChange={(e) => this.handleInputChange('fruitType', e.target.value)}
                    placeholder="e.g., lemon, orange, avocado"
                    maxLength="50"
                    disabled={this.state.submitting}
                />
            </div>

            {/* Notes Section */}
            <div className="form-section">
                <label htmlFor="notes">notes:</label>
                <button 
                    type="button" 
                    onClick={this.toggleNotesPopup}
                    className="notes-toggle-btn"
                    disabled={this.state.submitting}
                >
                    {this.state.notes ? 'edit notes' : 'add notes'}
                </button>
                {this.state.notes && (
                    <div className="notes-preview">
                        <small>{this.state.notes.substring(0, 50)}{this.state.notes.length > 50 ? '...' : ''}</small>
                    </div>
                )}
            </div>

            {/* Submit Button */}
            <button 
                type="submit" 
                onClick={this.submitPin}
                disabled={this.state.submitting || !this.state.currentLocation || !this.state.fruitType.trim()}
                className="submit-pin-btn"
            >
                {this.state.submitting ? 'submitting...' : 'submit pin'}
            </button>
        </div>

        {/* Notes Popup */}
        {this.state.showNotesPopup && (
            <div className="notes-popup-overlay">
                <div className="notes-popup">
                    <h4>Add Notes (up to 500 words)</h4>
                    <textarea
                        value={this.state.notes}
                        onChange={(e) => this.handleInputChange('notes', e.target.value)}
                        placeholder="Add details about this fruit tree location..."
                        rows="6"
                        maxLength="3000" // Rough character limit for 500 words
                    />
                    <div className="popup-buttons">
                        <button onClick={this.toggleNotesPopup}>save</button>
                        <button 
                            onClick={() => {
                                this.setState({ notes: '', showNotesPopup: false });
                            }}
                        >
                            clear
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Logout button at bottom */}
        <div className="bottom-section">
            <button
                type="button"
                onClick={(e) => {
                e.preventDefault();
                window.location.href='index.html';}}
                >logout</button>
        </div>
        </div>
        )
    };

};
