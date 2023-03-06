# Alchemy's Road to Web3 Week 2

This repository covers the modified code following Alchemy's Road to Web3 Week 2.

## Development Environment Setup

Ensure you have npm installed.

## Organization

`/contracts` The hardhat contract repo including test and deployment scripts.
`/web` The web front end originally ported from the replit fork.

## Hardhat

Ensure you are under the `/contracts` directory.

### Install Dependencies

    npm i

### Testing

To run the general test suit execute the following:

    npx hardhat test

To test the withdraw script execute the following:

    npx hardhat run scripts/withdraw.js

### Deployment

    npx hardhat run scripts/deploy.js

## Web Frontend

Ensure you are under the `/web` directory.

### Install Dependencies

    npm i

### Running

    npm run dev

Then open a browser to `http://localhost:3000`.
