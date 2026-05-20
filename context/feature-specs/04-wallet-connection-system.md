We need to create a wallet connection around the mantle network system

## layout

This will say how the connection system will look like

- The connect button in the navbar should open a popover when user is connected which will ask if te user wants to switch to another wallet
- But when the wallet is not connectd clicking the button should start the conection process
- the popover will hold the switch wallet button, sign in and the disconnect button (this will only come up if te user is connected already)

## connection network

The connection network must be the mantle sepolia network

- If a user is already on the network then connection goes through
- If the user is not on the network then the network should be automatically switch to the mantle sepolia network wen the user clicks the button
- And if the user does not even have the network on there wallet, then it should be added and then switched has the current network

## After connection

After the user is connected you are to create a helper function to like encode the user address like this '0x33rt......986' in the `lib/helperfunctions.tsx` to shouw the user address in the conect button instead of connect

Do not attach any functionalities after the connection except for the address encoding helper function for now

### Check when done

- new components compile without TypeScript errors
- no lint errors
- The layout responds perfectly on all screen sizes
- The connection/disconnection works just perfectly
