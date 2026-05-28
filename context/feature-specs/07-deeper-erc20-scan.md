We will scan the contract address based on the category of eac result

## Set up the viem provider

Create a viem client

- Create the viem client `lib/viem/client` using the alchemy url in the .env file

## Create an API endpoint

- create a ERC-20 Abi `contants` we will use to get the functions to call
- Create an endpoint `api/scanInfo` where the viem code will run
- loop through the results gotten from te wallet analysis and check the categories
- based on if the category is equal 'erc20' run the scan
- the scan sohould get the name and the protocol interacted with for that specific scan

## Then run a frontend function to read the contract

Create a frontend function to read the contract in the api route

- create a function to read the contract
- log the result to the console

Do not attach any functionalities after the Scanning

### Check when done

- new components compile without TypeScript errors
- no lint errors
- Each result is checked and only the erc20 category is gotten
