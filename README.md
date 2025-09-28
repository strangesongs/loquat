
# Loquat: Fruit Tree Map of Los Angeles

## Overview
Loquat is a web application for tracking the location of fruit trees across Los Angeles. Users can view a map, add new tree locations, and save their favorite spots. The project uses Node.js, Express, React, and AWS DynamoDB for data persistence.

## Features
- Interactive map of fruit trees in Los Angeles
- Add and save tree locations
- User authentication (planned)
- Data persistence with AWS DynamoDB
- Responsive UI with React

## Project Structure

```
├── server.js                # Express server entry point
├── package.json             # Project dependencies and scripts
├── client/                  # Frontend code
│   ├── index.html           # Main HTML file
│   ├── index.js             # Entry JS for React
│   ├── main.js              # Main logic
│   ├── map-index.html       # Map page HTML
│   ├── map.js / map.jsx     # Map logic/components
│   ├── sidebar.jsx          # Sidebar React component
│   └── stylesheets/         # CSS files
├── server/
│   ├── controllers/         # Express route controllers
│   └── schemas/             # DynamoDB integration
```


## Installation & Setup

1. **Clone the repository:**
	```sh
	git clone https://github.com/strangesongs/solo-project.git
	cd solo-project
	```
2. **Install dependencies:**
	```sh
	npm install
	```
3. **Set up AWS credentials:**
	- For local development, configure credentials via AWS CLI (`aws configure`) or `~/.aws/credentials`.
	- For AWS hosting, use IAM roles or environment variables.
4. **Set environment variables:**
	- Create a `.env` file or set in your deployment config:
	  ```
	  AWS_REGION=us-west-2
	  DYNAMODB_TABLE=LoquatUsers
	  ```
5. **Start the server:**
	```sh
	npm start
	```
	The server will run on [http://localhost:3000](http://localhost:3000).

## Data Persistence

- User and pin data are stored in AWS DynamoDB (`LoquatUsers` table).
- Requires AWS credentials and region configuration.
- Data is persistent and scalable for cloud hosting.

## Usage

- Visit `http://localhost:3000` to access the main page.
- Log in with any username (no password required).
- Use the map to view and add fruit tree locations.
- Save pins; your pins are stored per username in DynamoDB.


## Development Notes

- Backend uses AWS DynamoDB for user and pin data (see `server/schemas/schemas.js`).
- No authentication or password required; login is username-only.
- MongoDB and Mongoose are no longer required.
- Frontend uses React (Leaflet/Mapbox integration planned for future).


## DynamoDB Setup

1. **Create a DynamoDB table named `LoquatUsers`:**
	- Partition key: `userName` (type: String)
	- No sort key required
2. **Set environment variables:**
	- In `.env` or your deployment config:
	  ```
	  AWS_REGION=us-west-2
	  DYNAMODB_TABLE=LoquatUsers
	  ```
3. **Configure AWS credentials:**
	- For local dev: use AWS CLI (`aws configure`) or `~/.aws/credentials`
	- For AWS hosting: use IAM roles or environment variables
4. **Troubleshooting:**
	- Ensure your IAM user/role has DynamoDB read/write permissions
	- Check region and table name match your setup
	- Use AWS Console or CLI to verify table exists and is accessible

## Contributing
Pull requests and suggestions are welcome! Please open issues for bugs or feature requests.

## License
ISC

