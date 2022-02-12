# XAutomation - XRPL Trustline Tools 


### USE AT YOUR OWN RISK. 
#### Your secret keys are safe from outside the network. Transaction signing is done locally. [Look how it works](https://xrpl.org/set-up-secure-signing.html#use-a-client-library-with-local-signing) 

##### REQUIREMENTS:
1. Modern Browsers
2. Node JS (download here https://nodejs.org/en/)
3. Activated Wallet
4. Internet Connection

##### HOW TO SETUP YOUR WALLET ADDRESSES AND SECRET KEYS:
1. create file called .env in root directory
2. copy paste this inside .env
```
#account1
account1secret=111111 111111 111111 111111 111111 111111 111111 111111
#account2
account2secret=111111 111111 111111 111111 111111 111111 111111 111111
```
3. replace 111111 111111 111111 111111 111111 111111 111111 111111 with your secret key
4. you can add more secrets if you like
5. Find this line of code inside index.html 

```
<label class="checkbox">
 <div class="control is-size-6 mb-4">
     <input type="checkbox" class="accts" name="accts" value="rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz">
         account1 rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz
 </label>
</div>
```
 
6. replace account1 with your wallet name and rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz with your wallet address
7. you can add more. just simply copy paste and update the wallet name and wallet address
8. go to server.js, find this comments and apply instruction to codes below it
 - // replace with your wallet address and xumm account name
 - // replace "process.env.account1secret" with the name in your .env file
 - // replace "process.env.account1secret" with the name in your .env file
 
9. Done. You can now run XAutomation.
 
 
##### HOW TO RUN XAutomation
1. Open your command prompt
2. Check first if your node.js is installed already using command `node -v` if your node.js is not yet installed download [node.js](https://nodejs.org/en/)
3. Run command `nodemon server` in XAutomation folder. "Server started at port 3000" should appear.
4. Open your browser. Type in URL the `http://localhost:3000/`
5. Done.



