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
            showAddFruitPopup: false,
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

    toggleAddFruitPopup = () => {
        this.setState(prevState => ({
            showAddFruitPopup: !prevState.showAddFruitPopup,
            // Reset form when opening popup
            currentLocation: !prevState.showAddFruitPopup ? null : prevState.currentLocation,
            fruitType: !prevState.showAddFruitPopup ? '' : prevState.fruitType,
            notes: !prevState.showAddFruitPopup ? '' : prevState.notes
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
                // Reset form and close popup
                this.setState({
                    currentLocation: null,
                    fruitType: '',
                    notes: '',
                    showAddFruitPopup: false
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

            {/* Main action buttons */}
            <div className="action-buttons">
                <button
                    type="button"
                    onClick={(e) => {
                    e.preventDefault();
                    window.location.href='index.html';}}
                    className="action-btn"
                    >home</button>

                <button
                    type="button"
                    onClick={this.toggleAddFruitPopup}
                    className="action-btn add-fruit-btn"
                    >add fruit</button>

                <button
                    type="button"
                    onClick={(e) => {
                    e.preventDefault();
                    alert('My pins functionality coming soon!');}}
                    className="action-btn"
                    >my pins</button>
            </div>

            {/* Add Fruit Popup */}
            {this.state.showAddFruitPopup && (
                <div className="add-fruit-popup-overlay">
                    <div className="add-fruit-popup">
                        <div className="popup-header">
                            <h4>Add Fruit Tree</h4>
                            <button 
                                className="close-btn"
                                onClick={this.toggleAddFruitPopup}
                                disabled={this.state.submitting}
                            >
                                ×
                            </button>
                        </div>

                        <div className="popup-content">
                            {/* Location Section */}
                            <div className="popup-section">
                                <label>Location:</label>
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
                                        <small>
                                            {this.state.currentLocation.lat.toFixed(6)}, {this.state.currentLocation.lng.toFixed(6)}
                                        </small>
                                    </div>
                                )}
                            </div>

                            {/* Fruit Type Section */}
                            <div className="popup-section">
                                <label htmlFor="popup-fruit-type">Fruit or Tree Type:</label>
                                <input 
                                    type="text" 
                                    id="popup-fruit-type"
                                    value={this.state.fruitType}
                                    onChange={(e) => this.handleInputChange('fruitType', e.target.value)}
                                    placeholder="e.g., lemon, orange, avocado"
                                    maxLength="50"
                                    disabled={this.state.submitting}
                                />
                            </div>

                            {/* Notes Section */}
                            <div className="popup-section">
                                <label htmlFor="popup-notes">Notes (optional):</label>
                                <textarea
                                    id="popup-notes"
                                    value={this.state.notes}
                                    onChange={(e) => this.handleInputChange('notes', e.target.value)}
                                    placeholder="Add details about this fruit tree location... (up to 500 words)"
                                    rows="4"
                                    maxLength="3000"
                                    disabled={this.state.submitting}
                                />
                            </div>
                        </div>

                        <div className="popup-footer">
                            <button 
                                type="button"
                                onClick={this.toggleAddFruitPopup}
                                disabled={this.state.submitting}
                                className="cancel-btn"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                onClick={this.submitPin}
                                disabled={this.state.submitting || !this.state.currentLocation || !this.state.fruitType.trim()}
                                className="submit-btn"
                            >
                                {this.state.submitting ? 'Submitting...' : 'Submit Pin'}
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
