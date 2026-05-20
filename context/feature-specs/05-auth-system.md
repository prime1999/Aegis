<!-- We are to create the authentication workflow from user nonce been created to the user profile been created

## when the user clicks the sign in button

- The nonce gets generated in the supabase DB with this schema address, nonce, and expires_at
- The expires_at will be in 10 minutes time to th time of creation
- Then after the nnce is created, it is read from the db and then the nonce is used by SIWE to carry out the SIWE process
- after the SIWE process is successful, then the auth process is created in the supabase DB
- and then the user is check if the auth was successful and a session was created successfully to create te user's profile in the supabase DB using this schema wallet_address, username, last_login

## layout

- When the user clicks sign In, a shadcn dislog should open up and then it should ask for a user name from the user, after the user inputs the username, the app should check the db if a user with the same username already exist
- If they do then the user get an error to change the user name else the auth process starts
- after auth is successful the sign in button in the popover should change to a log out button

Do not attach any functionalities after the authentication

### Check when done

- new components compile without TypeScript errors
- no lint errors
- The layout responds perfectly on all screen sizes
- The user session is gotten from supabase -->

We are to create the authentication workflow from user nonce been created to the user profile been created

## remove current auth system

We are not using the current auth system anymore

- Remove the current auth system flow, and clean up the related file

## use the supabase sign in with web3

- read the `lib/supabase/config.toml` file
- enable the supabase sign-in with web 3
- when user successfully signs in, get the session and update the UI immediately

Do not attach any functionalities after the authentication and do no remove files that don't have to do with the SIWE auth flow

### Check when done

- new components compile without TypeScript errors
- no lint errors
- The layout responds perfectly on all screen sizes
- The user session is gotten from supabase
