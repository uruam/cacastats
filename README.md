# [caca.gg](https://caca.gg)

Web-based application designed to provide a comprehensive scoreboard and player profiles with detailed statistics for a RatMod Clan Arena game server. It allows users to effortlessly access both the overall game statistics and individual player metrics from the last 30 days, enhancing their gaming experience.

## Requirement

[Node.js](https://nodejs.org) ≥ 8.3.0

[Python](https://www.python.org) ≥ 3.0.0

## Installation

To run the project locally:

Clone the repository

```
git clone https://github.com/uruam/caca.gg.git
```

Navigate to the `server` directory

```
cd caca.gg/server
```

Install server dependencies

```
npm install
```

Create a .env file in the server directory and add your `PORT` environment variable, which specifies the port on which the app will run, and the `API_URL` environment variable, which specifies the location of the matches.json file. For example:

```
PORT=3000
API_URL=https://my-rat-server.com/

```

Start the server

```
npm run start
```

Navigate to the `client` folder

```
cd ../client
```

Install dependencies

```
npm install
```

Automatically transcompile and bundle the client code during development whenever source files change

```
npm run dev
```

Transcompile and bundle the client code for production deployment

```
npm run build
```

## Usage

The server will be running locally on port 3000. Access the application by opening a web browser and going to [http://localhost:3000](http://localhost:3000).

## Code Style

The project utilizes ESLint and Prettier for code linting and formatting. While these tools are integrated into the build process for the client using webpack, the server code needs to be linted separately.

Steps:

After editing the server code, navigate to the server directory

```
cd server
```

Run ESLint to check for any code style violations

```
npm run lint
```

Resolve any reported issues based on ESLint's recommendations

## Credits

icons: [RatMod authors](https://ratmod.github.io)

oaquery: [Rodent Control](https://github.com/rdntcntrl)

## License

This project is licensed under the [GPL-2.0 license](https://github.com/uruam/caca.gg#GPL-2.0-1-ov-file).
