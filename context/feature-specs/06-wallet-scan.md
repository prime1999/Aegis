We are to create the wallet scanning functionality using Alchemy

## Create the Alchemy scan functionality

Create the Alchemy client

- Create the Alchemy client for the mantle sepolia network in the `lib/alchemy.ts`

## Create the Alchemy scan functionality

We will be using the API route for the wallet scan

- Check if the user is logged in and the wallet is connected first
- Create the API route to handle the scaning using Alchemy
- carry out the scaning for the category `["external", "erc20", "erc721"]`
- log the result to the console and nothing more
- The scan should be from the user's past three months activities

Do not attach any functionalities after the Scanning

### Check when done

- new components compile without TypeScript errors
- no lint errors
- The layout responds perfectly on all screen sizes
- The user wallet is scanned and the the user is logged to the console
