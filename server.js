const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const xrpl = require('xrpl')
const {Account} = require('xrpl-secret-numbers')
require('dotenv').config()

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules/bulma')));
app.use(bodyParser.json());


const PUBLIC_SERVER  = "wss://xrplcluster.com/"
const client = new xrpl.Client(PUBLIC_SERVER) // will connect to closest full node


// replace with your wallet address and xumm account name
const accounts = {
  rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz: 'account1',
  rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz: 'account2',
  rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz: 'account3',
  rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz: 'account4',
  rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz: 'account5',
  rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz: 'account6',
  rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz: 'account7',
  rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz: 'account8',
}


// Based on XUMM Wallet
const FEE_LOW = 0.000015
const FEE_MEDIUM = 0.000225
const FEE_HIGH = 0.0055

// change this to change all the fee of all processes
const current_fee = FEE_LOW

const ACTIVATE_WALLET = 10000000 // 10 xrp
const RESERVED_TRUSTLINE = 2000000 // 2 xrp
const RESERVED_OFFER = 2000000 // 2 xrp


// replace "process.env.account1secret" with the name in your .env file
const address_secrets = {
  rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz: process.env.account1secret,
  rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz: process.env.account2secret,
  rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz: process.env.account3secret,
  rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz: process.env.account4secret,
  rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz: process.env.account5secret,
  rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz: process.env.account6secret,
  rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz: process.env.account7secret,
  rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz: process.env.account8secret,
  rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz: process.env.account9secret,
  rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz: process.env.account10secret
}

// replace "process.env.account1secret" with the name in your .env file
const secrets = [
process.env.account1secret,
process.env.account2secret,
process.env.account3secret,
process.env.account4secret,
process.env.account5secret,
process.env.account6secret,
process.env.account7secret,
process.env.account8secret,
process.env.account9secret,
process.env.account10secret
]

app.listen(port);
console.log('Server started at http://localhost:' + port);

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'))
});

app.post('/settl', async (req, res) => {
  await client.connect().then(() => {
    console.log('---------------------SET TRUSTLINE---------------------------')
    console.log('You are now connected to ' + PUBLIC_SERVER)
    console.log('--------------------------------------------------------------')
  })
  .catch(reject => {
    console.log("Failed to connect to " + PUBLIC_SERVER + "\n" + reject)
  })


  const {token_issuer, currency, limit} = req.body.trustline
  const wallet_addresses = req.body.acctlist
  console.log(`Token Issuer: ${token_issuer}`)
  console.log(`Currency: ${currency}`)
  console.log(`Limit: ${limit}`)
  console.log('--------------------------------------------------------------')
  
  
  await runSetTrustlineProcess(wallet_addresses, token_issuer.trim(), currency.trim(), limit.trim())
  .then(msg => {
    console.log(msg);
    res.status(200).json({status: 'ok'})
  })
  .catch(reject => {
    //console.log(reject)
    res.status(404).json({status: 'Bad Request'})
  })

  client.disconnect()
})



app.get('/viewinfo', async(req, res) => {
  await client.connect().then(() => {
    console.log('----------------VIEW ACCOUNT INFORMATION----------------------')
    console.log('You are now connected to ' + PUBLIC_SERVER)
    console.log('--------------------------------------------------------------')
  })
  .catch(reject => {
    console.log("Failed to connect to " + PUBLIC_SERVER + "\n" + reject)
    client.disconnect()
  })  

  await runViewAccountInfo(client)
  .then(accounts_info => {
    client.disconnect()
    res.status(200).json({status:"ok", accounts_info: accounts_info})
  })
  .catch(reject => {
    client.disconnect()
    res.status(400).json({status: "Bad Request"})
  })
})

app.post('/tlchecker', async (req, res) => {
  await client.connect().then(() => {
  console.log('-------------------Trustline Checker--------------------------')
  console.log('You are now connected to ' + PUBLIC_SERVER)
  console.log('--------------------------------------------------------------')
  })
  .catch(reject => {
    console.log("Failed to connect to " + PUBLIC_SERVER + "\n" + reject)
    client.disconnect()
  })

  const trustline = req.body.trustline

  
  await runTrustlineChecker(trustline)
  .then(trustline_accounts => {
    client.disconnect()
    res.status(200).json({status:"ok", trustline_accounts: trustline_accounts})
  })
  .catch(reject => {
    console.log(reject);
    client.disconnect()
    res.status(400).json({status: "Bad Request"})
  })

})

app.post('/deltl', async (req, res) => {
  await client.connect().then(() => {
    console.log('---------------------DELETE TRUSTLINE---------------------------')
    console.log('You are now connected to ' + PUBLIC_SERVER)
    console.log('--------------------------------------------------------------')
  })
  .catch(reject => {
    console.log("Failed to connect to " + PUBLIC_SERVER + "\n" + reject)
    client.disconnect()
  })  

  const {token_issuer, currency, limit} = req.body.trustline;
  const wallet_addresses = req.body.acctlist
  console.log(`Token Issuer: ${token_issuer}`);
  console.log(`Currency:  ${currency}`);
  console.log(`Limit:  ${limit}`);
  console.log('--------------------------------------------------------------')

  await runDeleteTrustlineProcess(wallet_addresses, token_issuer.trim(), currency.trim(), 0)
  .then(msg => {
    client.disconnect()
    console.log(msg);
    res.status(200).json({status:"ok"})
  })
  .catch(reject => {
    client.disconnect()
    console.log(reject);
    res.status(400).json({status: "Bad Request"})
  })

  client.disconnect()
})

app.post('/sendxrp', async (req, res) => {
  await client.connect().then(() => {
    console.log('---------------------SEND XRP---------------------------')
    console.log('You are now connected to ' + PUBLIC_SERVER)
    console.log('--------------------------------------------------------------')
  })
  .catch(reject => {
    console.log("Failed to connect to " + PUBLIC_SERVER + "\n" + reject)
    client.disconnect()
  })  

  const sender = req.body.sender;
  const recipient_addresses = req.body.acctlist;
  const xrp_amount = req.body.xrp_amount;
  console.log('Sender: ' + sender);
  console.log('Amount: ' + xrp_amount);
  console.log('--------------------------------------------------------------')

  await runSendXRPProcess(sender.trim(), xrp_amount.trim(), recipient_addresses)
  .then(msg => {
    console.log(msg);
    res.status(200).json({status:"ok"})
  })
  .catch(reject => {
    client.disconnect()
    console.log(reject);
    res.status(400).json({status: "Bad Request"})
  })

  client.disconnect()
})

app.post('/sendnonxrp', async(req, res) => {
  await client.connect().then(() => {
    console.log('---------------------SEND NON XRP---------------------------')
    console.log('You are now connected to ' + PUBLIC_SERVER)
    console.log('--------------------------------------------------------------')
  })
  .catch(reject => {
    console.log("Failed to connect to " + PUBLIC_SERVER + "\n" + reject)
    client.disconnect()
  })  

  const receiver_address = req.body.receiver;
  const token_issuer = req.body.issuer;
  const currency = req.body.currency;
  const nonxrp_amount = req.body.nonxrp_amount;
  const sender_addresses = req.body.acctlist;
  
  console.log('Receiver: ' + receiver_address);
  console.log('issuer: ' + token_issuer);
  console.log('currency: ' + currency);
  console.log('nonxrp_amount: ' + nonxrp_amount);
  console.log('sender_address: ' + sender_addresses);
  console.log('--------------------------------------------------------------')   

  await runSendNonXRPProcess(receiver_address.trim(), token_issuer.trim(), currency.trim(), nonxrp_amount.trim(), sender_addresses)
  .then(msg=> {
    console.log(msg);
    client.disconnect()
    res.status(200).json({status: "ok"})
  })
  .catch(reject => {
    client.disconnect()
    console.log(reject);
    res.status(400).json({status: "Bad Request"})
  })

  client.disconnect()
})

async function runSetTrustlineProcess(_wallet_addresses, _token_issuer, _currency, _limit){
  let result
  
  if(_limit == 0 || _limit == undefined) {
    return Promise.reject("Limit Value cannot be 0 or empty.")
  }else {
    result = await Promise.allSettled(_wallet_addresses.map(async (wallet_address) => {
      let tl_count, offer_count, avail_bal = 0
      const account = new Account(address_secrets[wallet_address]) // derive account from secret
      const wallet = xrpl.Wallet.fromSeed(account.getFamilySeed()) // derive address from account
      
      const response1 = await client.request({
        command: 'account_lines',
        account: wallet.address,
        ledger_index: 'validated'        
      })

      tl_count = response1.result.lines.length
      const lines = response1.result.lines

      try {
        lines.forEach(line => {
          if(line.account == _token_issuer && line.currency == _currency){
            throw ('Trustline is already set on address ' + wallet.address + ' (' + accounts[wallet.address] + ').')
          }
        })

        const response2 = await client.request({
        command: 'account_offers',
        account: wallet.address
        })

        offer_count = response2.result.offers.length
        const response3 = await client.request({
          command: 'account_info',
          account: wallet.address,
          strict: true,
          ledger_index: 'current'
        })      

        const total_balance = response3.result.account_data.Balance
        const trustline_reserved_balance = tl_count * RESERVED_TRUSTLINE
        const offer_reserved_balance = offer_count * RESERVED_OFFER
        avail_bal = total_balance - ACTIVATE_WALLET - 
        trustline_reserved_balance - offer_reserved_balance


        if(avail_bal < (RESERVED_TRUSTLINE + current_fee)){
          throw('Insufficient XRP to set trustline. Your available balance is ' + xrpl.dropsToXrp(avail_bal) + ' XRP for ' + wallet.address + ' (' + accounts[wallet.address] + ').')
        }

        // FEE_LOW default
        const prepared_tx = await client.autofill({
          TransactionType: 'TrustSet',
          Account: wallet.address,
          Fee: xrpl.xrpToDrops(current_fee.toString().trim()),
          LimitAmount: {
            currency: _currency.trim(), 
            issuer: _token_issuer.trim(), 
            value: _limit.trim()
          },
          Flags: {
            tfSetNoRipple: true // 131072
          }
        })

        // sign transaction
        const signed_tx = wallet.sign(prepared_tx)

        // display tx hash
        printSubmitAndWait(signed_tx.hash)


        // submit transaction to network
        const result = await client.submitAndWait(signed_tx.tx_blob)

        // display result
        printLedgerResponseTrustRemoval(result)
      }catch(error){
        // uncomment to see full error log.
        // console.log(error); 
        console.log(`Bad Request. ${error}`);
      } 
    })
    )
  }

  return `Done`
}

async function runDeleteTrustlineProcess(_wallet_addresses, _token_issuer, _currency, _limit){
  if(_wallet_addresses == '' || _token_issuer == '' || _currency == '')
    return Promise.reject(`Invalid Trustline Information. Please try again.`)

  await Promise.allSettled(_wallet_addresses.map(async (wallet_address) => {
      const account = new Account(address_secrets[wallet_address])
      const wallet = xrpl.Wallet.fromSeed(account.getFamilySeed())

      const response1 = await client.request({
        command: 'account_lines',
        account: wallet.address,
        ledger_index: 'validated'        
      }) 
      
      const lines = response1.result.lines

      try {
        let isPresent = false

        lines.forEach(line => {
          if(line.account == _token_issuer && Number(line.balance) > 0)
            throw ('Your account ' + wallet.address + ' (' + accounts[wallet.address] + ') ' + ' still have balance and cannot be deleted.')

          if(line.account == _token_issuer)
            isPresent = true   
        }) 

        if(isPresent == false)
          throw('Your account ' + wallet.address + ' (' + accounts[wallet.address] + ') don\'t have this trustline')
              
        // reset everything to delete trustline
        const prepared_tx = await client.autofill({
          TransactionType: 'TrustSet',
          Flags: 2149711872,
          LimitAmount: {
            currency: _currency, 
            issuer: _token_issuer, 
            value: _limit.toString().trim()
          },
          Fee: xrpl.xrpToDrops(current_fee.toString()),
          Account: wallet.address
        })

        const signed_tx = wallet.sign(prepared_tx);
        
        printSubmitAndWait(signed_tx.hash);
        const result = await client.submitAndWait(signed_tx.tx_blob)

        printLedgerResponseTrustRemoval(result)

      }catch(error){
        // uncomment to see full error log.
        // console.log(error);
        console.log(`Bad Request. ${error}`);
      }
    })
  )
  return `Done`
}

async function runSendXRPProcess(_sender, _xrp_amount, _recipient_addresses){
  const sender_account = new Account(address_secrets[_sender])
  const sender_wallet = xrpl.Wallet.fromSeed(sender_account.getFamilySeed()) 

  _recipient_addresses.forEach(recipient_address => {
    if(_sender == recipient_address)
      throw `Sender can't be a recipient`
  })

  // verify if sender has enough funds to send
  const line_response = await client.request({
     command: 'account_lines',
     account: sender_wallet.address,
     ledger_index: 'validated'
  })

  tl_count = line_response.result.lines.length

  let acct_offers_response = await client.request({
    command: "account_offers",
    account: sender_wallet.address
  })

  offer_count = acct_offers_response.result.offers.length

  let acct_info_response = await client.request({
    command: "account_info",
    account: sender_wallet.address,
    strict: true,
    ledger_index: 'current'
  })

  const total_balance = acct_info_response.result.account_data.Balance
  const trustline_reserved_balance = tl_count * RESERVED_TRUSTLINE
  const offer_reserved_balance = offer_count * RESERVED_OFFER

  avail_bal = total_balance - ACTIVATE_WALLET - 
  trustline_reserved_balance - offer_reserved_balance

  if(xrpl.dropsToXrp(avail_bal) < Number(_xrp_amount) || xrpl.dropsToXrp(avail_bal) < (Number(_xrp_amount) * _recipient_addresses.length)){
    return Promise.reject(`Insufficient Funds of sender ${sender_wallet.address} (${accounts[sender_wallet.address]})`)
  }else{
    // synchronous. Sequence Number of sender should increment by 1 sequentially
    for(let recipient_address of _recipient_addresses){
      const account = new Account(address_secrets[recipient_address])
      const recipient_wallet = xrpl.Wallet.fromSeed(account.getFamilySeed())   

      const prepared_tx = await client.autofill({
         TransactionType: "Payment",
         Account: sender_wallet.address,
         Amount: xrpl.xrpToDrops(_xrp_amount).toString(),
         Destination: recipient_wallet.address,
         Fee: xrpl.xrpToDrops(current_fee.toString())
      })

      const signed = sender_wallet.sign(prepared_tx)

      printSubmitAndWait(signed.hash)
      const result = await client.submitAndWait(signed.tx_blob)

      printLedgerResponseSendXRP(result, sender_wallet.address, recipient_wallet.address)
    }
  }
  

  return `Done`
}

async function runSendNonXRPProcess(_receiver_address, _token_issuer, _currency, _nonxrp_amount, _sender_addresses){
  const receiver = new Account(address_secrets[_receiver_address])
  const receiver_wallet = xrpl.Wallet.fromSeed(receiver.getFamilySeed()) 

  _sender_addresses.forEach(sender_address => {
    if(_receiver_address == sender_address)
      throw `Receiver address can't be a sender address`
  })

  const result = await Promise.allSettled(  
    _sender_addresses.map(async (sender_address) => {
      const sender = new Account(address_secrets[sender_address])
      const sender_wallet = xrpl.Wallet.fromSeed(sender.getFamilySeed())      

      const response1 = await client.request({
          command: 'account_lines',
          account: sender_wallet.address,
          ledger_index: 'validated'
      })

      const lines = response1.result.lines

      try{
        let isPresent = false

        lines.forEach(line => {
          if(line.currency == _currency)
            isPresent = true

          else if(line.currency == _currency && Number(_nonxrp_amount) > Number(line.balance))
            throw('Sender ' + sender_wallet.address + ' (' + accounts[sender_wallet.address] + ') ' + 'has insufficient balance.')
        })

        if(!isPresent)
            throw('Sender ' + sender_wallet.address + ' (' + accounts[sender_wallet.address] + ') ' +  'don\'t have this trustline.') 

        const prepared = await client.autofill({
          TransactionType: "Payment",
          Account: sender_wallet.address.trim(),
          Destination: receiver_wallet.address.trim(),
          Amount: {
            issuer: _token_issuer,
            currency: _currency,
            value: _nonxrp_amount
          },
          Fee: xrpl.xrpToDrops(current_fee.toString())
        })

        const signed = sender_wallet.sign(prepared)
        printSubmitAndWait(signed.hash)

        const result = await client.submitAndWait(signed.tx_blob);

        printLedgerResponseSendNonXRP(result.result, receiver_wallet.address);
      }catch(error){
        console.log(error);
        return Promise.reject(error)
      }
    })
  )
  return `Done`
}

async function runViewAccountInfo(client){
  let total_avail_bal = 0, total_bal = 0, accounts_data = [];

  result = await Promise.allSettled(secrets.map(async (secret) => {
    let tl_count, offer_count, avail_bal = 0
    const account = new Account(secret)
    const wallet = xrpl.Wallet.fromSeed(account.getFamilySeed())

    const line_response = await client.request({
       command: 'account_lines',
       account: wallet.address,
       ledger_index: 'validated'
    })

    tl_count = line_response.result.lines.length

    let acct_offers_response = await client.request({
      command: "account_offers",
      account: wallet.address
    })

    offer_count = acct_offers_response.result.offers.length

    let acct_info_response = await client.request({
      command: "account_info",
      account: wallet.address,
      strict: true,
      ledger_index: 'current'
    })

    const total_balance = acct_info_response.result.account_data.Balance
    const trustline_reserved_balance = tl_count * RESERVED_TRUSTLINE
    const offer_reserved_balance = offer_count * RESERVED_OFFER

    avail_bal = total_balance - ACTIVATE_WALLET - 
    trustline_reserved_balance - offer_reserved_balance

    const account_info = {
      account_name: accounts[wallet.address],
      wallet_address: wallet.address,
      avail_balance: xrpl.dropsToXrp(avail_bal),
      total_bal: xrpl.dropsToXrp(total_balance),
      tl_count: tl_count,
      offer_count: offer_count
    }

    accounts_data.push(account_info)
    })
   )
   
   return accounts_data
}

async function runTrustlineChecker(_trustline){
  let trustline_accounts = []

  await Promise.allSettled(secrets.map(async (secret) => {
    const account = new Account(secret)
    const wallet = xrpl.Wallet.fromSeed(account.getFamilySeed())
    const line_response = await client.request({
       command: 'account_lines',
       account: wallet.address,
       ledger_index: 'validated'
    })
    lines = line_response.result.lines
    let isPresent = false
    lines.forEach(line => {
      if(_trustline == line.currency){
        isPresent = true
      }
    })
    if(isPresent){
      const trustline_account = {
        wallet_addresses: wallet.address,
        account_names: accounts[wallet.address]
      }
      console.log(`${wallet.address} have this trustline.`);
      trustline_accounts.push(trustline_account)
    }
   })
  )

  console.log(trustline_accounts)
  return trustline_accounts
}

function printSubmitAndWait(_tx_hash){
  console.log(_tx_hash + ' transaction was submitted. Please wait bro :)')

  return
}

function printLedgerResponseTrustRemoval(_tx){
  console.log('Account Name: ' + accounts[_tx.result.Account] + ' - ' + _tx.result.Account)
  console.log('Transaction Result: ' + _tx.result.meta.TransactionResult)
  console.log('Validated: ' + _tx.result.validated)
  console.log('Fee: ' + xrpl.dropsToXrp(_tx.result.Fee) + ' XRP')
  console.log('Transaction Hash: ' + _tx.result.hash)
  console.log('Transaction Type: ' + _tx.result.TransactionType)
  console.log('--------------------------------------------------------------');
  //console.log("Balance changes:", JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2))

  return
}

function printLedgerResponseSendXRP(_response, _sender_wallet_address, _recipient_wallet_address){
  console.log('Validated: ' + _response.result.validated)
  console.log('Transaction Hash: ' + _response.result.hash)
  console.log('Fee: ' + xrpl.dropsToXrp(_response.result.Fee) + ' XRP')
  console.log('Sender: ' + accounts[_sender_wallet_address])
  console.log('Destination: ' + accounts[_recipient_wallet_address])
  console.log('Amount: ' + xrpl.dropsToXrp(_response.result.Amount) + ' XRP')
  console.log('--------------------------------------------------------------')

  return
}

function printLedgerResponseSendNonXRP(_result, _receiver_address){
  console.log('Transaction Result: ' + _result.meta.TransactionResult)
  console.log('Validated: ' + _result.validated)
  console.log('Transaction Type: ' + _result.TransactionType)
  console.log('Transaction Hash: ' + _result.hash)
  console.log('Fee: ' + xrpl.dropsToXrp(_result.Fee) + ' XRP')
  console.log('Sender: ' + _result.Account + ' (' + accounts[_result.Account] + ')')
  console.log('Destination: ' + _result.Destination + ' (' + accounts[_receiver_address] + ')')
  console.log('Amount: ' + _result.Amount.value + ' ' + _result.Amount.currency)
  //console.log("Balance changes:", JSON.stringify(xrpl.getBalanceChanges(result.meta), null, 2))
  console.log('--------------------------------------------------------------')

  return
}

function printUnsignedTransaction(_prepared){
  const max_ledger = _prepared.LastLedgerSequence
  console.log('Prepared transaction instructions: ' + _prepared)
  console.log('Transaction cost: ' + xrpl.dropsToXrp(_prepared.Fee) + ' XRP')
  console.log('Transaction expires after ledger: ' + max_ledger)
  console.log('Account sequence: ' + _prepared.Sequence)

  return
}

function printLedgerResponseTrustSet(_tx, _available_balance){
  console.log('Account Name: ' + accounts[_tx.result.Account]  + ' - ' + _tx.result.Account)
  console.log('New XRP Balance: ' + (xrpl.dropsToXrp(_available_balance - RESERVED_TRUSTLINE - xrpl.xrpToDrops(FEE_LOW)))+ ' XRP');
  console.log('Transaction Result: ' + _tx.result.meta.TransactionResult)
  console.log('Validated: ' + _tx.result.validated)
  console.log('Currency: ' + _tx.result.LimitAmount.currency)
  console.log('Fee: ' + xrpl.dropsToXrp(_tx.result.Fee) + ' XRP')
  console.log('Transaction Hash: ' + _tx.result.hash)
  console.log('Transaction Type: ' + _tx.result.TransactionType)
  console.log('--------------------------------------------------------------');
  //console.log("Balance changes:", JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2))
  
  return
}