We have to seperate the wallet scan and the Ai analyzer

## Seperate the calls

We will move the Ai-Analyzer api call from the scan route to the useWalletScan

- remove the AI-Analyzer api call from the scan route and call it in the useWalletScan
- Also move the scan api call to a react-query then call it in the useWalletScan hook, so we can record the states.
- Also call the AI-Analyzer from the useWalletScan using a react-query after the wallet scan is succesful, and pass the resul from the wallet scan for the Ai-Analyzer to use
- Now that we have seperation of concerns and different loading, error and success state for them using react-query, we can show the use like a step loading in te UI for them to know whats happening.
- log the result to the console

Do not attach any other functionalities

### Check when done

- new components compile without TypeScript errors
- no lint errors
- Each result is checked and the AI analyzes the all result in the array
- Also the layout is responsive on all screen sizes
