const ERR_MSG = "Internal Server Error"

document.addEventListener('DOMContentLoaded', () => {
  function openModal($el) {
    $el.classList.add('is-active');
  }

  function closeModal($el) {
    $el.classList.remove('is-active');
  }

  function closeAllModals() {
    (document.querySelectorAll('.modal') || []).forEach(($modal) => {
      closeModal($modal);
    });
  }

  // Add a click event on buttons to open a specific modal
  (document.querySelectorAll('.set-tl-modal-trigger, .view-tl-modal-trigger, .tl-checker-modal-trigger') || []).forEach(($trigger) => {
    const modal = $trigger.dataset.target;
    const $target = document.getElementById(modal);
    //console.log($target);

    $trigger.addEventListener('click', () => {
      openModal($target);
    });
  });

  // Add a click event on various child elements to close the parent modal
  (document.querySelectorAll('.delete, .modal-card-foot .cancel') || []).forEach(($close) => {
    const $target = $close.closest('.modal');

    $close.addEventListener('click', () => {
      closeModal($target);
    });
  });

  // Add a keyboard event to close all modals
  document.addEventListener('keydown', (event) => {
    const e = event || window.event;

    if (e.keyCode === 27) { // Escape key
      closeAllModals();
    }
  });
});

const setTLBtn = document.getElementById("set-tl-btn");
const delTLBtn = document.getElementById("del-tl-btn");
const sendXRPBtn = document.getElementById("send-xrp-btn");
const sendNonXRPBtn = document.getElementById("send-nonxrp-btn");
const viewAcctsInfo = document.getElementById("view-accts-info");
const tlCheckerBtn = document.getElementById("tl-checker-btn");
const body = document.querySelector("body");

setTLBtn.addEventListener("click", runProcess);
delTLBtn.addEventListener("click", runProcess);
sendXRPBtn.addEventListener("click", runProcess);
sendNonXRPBtn.addEventListener("click", runProcess);
viewAcctsInfo.addEventListener("click", viewInfo);
tlCheckerBtn.addEventListener("click", trustlineChecker)

async function runProcess(e){
  const target_name = e.target.id
  let accounts = document.querySelectorAll('input[name=accts]:checked');

  if(accounts.length > 0 && confirm("Are you sure?") == true){
    switch(target_name){
      case "set-tl-btn" : {
        setTrustline(accounts);
        break;
      }
      case "del-tl-btn" : {
        deleteTrustline(accounts);
        break;
      }
      case "send-xrp-btn" : {
        sendXRP(accounts);
        break;
      }
      case "send-nonxrp-btn" : {
        sendNonXRP(accounts);
        break;
      }
    }
  }
  else if(accounts.length == 0){
    alert("Please select an account.")
  }
  
  return;
}


async function setTrustline(accounts){
  const DESCRIPTION = "setTL"
  const acctlist = []
  const token_issuer = document.getElementById("token-issuer").value
  const currency = document.getElementById("currency").value
  const limit = document.getElementById("limit").value

  accounts.forEach(acct => acctlist.push(acct.value))

  const trustline = {
    token_issuer: token_issuer,
    currency: currency,
    limit: limit
  }

  const data = JSON.stringify({
    acctlist: acctlist,
    trustline: trustline
  })

  preRequest(DESCRIPTION)

  let response = await fetch('/settl', {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: data
  })

  if(response.ok){
    response = await response.json()

    alert(`[STATUS 200] Processing done. Pls check server log for more information.`)
    clearAccounts()

  }else{
    clearAccounts()
    alert(`[ERROR] Internal Server Error. No transaction was submitted. Please check server log.`)
    document.getElementById('set-tl-modal-close').click()
  }

  postRequest(DESCRIPTION)
  return
}

async function deleteTrustline(accounts){
  const DESCRIPTION = "delTL"
  const token_issuer = document.getElementById("token-issuer").value
  const currency = document.getElementById("currency").value
  const limit = document.getElementById("limit").value
  const acctlist = []

  accounts.forEach(acct => acctlist.push(acct.value))
  
  const trustline = {
    token_issuer: token_issuer,
    currency: currency,
    limit: limit
  }

  const data = JSON.stringify({
    acctlist: acctlist,
    trustline: trustline
  })

  preRequest(DESCRIPTION)

  let response = await fetch('/deltl', {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: data
  })

  if(response.ok){  
    response = await response.json()
    alert(`[STATUS 200] Processing done. Pls check server log for more information.`)
    clearAccounts()
    //clearTrustlineInfo();
  }else{
    clearAccounts()
    alert(`[ERROR] Internal Server Error. No transaction was submitted. Please check server log.`)
    document.getElementById('set-tl-modal-close').click()
  }

  postRequest(DESCRIPTION)

  return
}

async function sendXRP(accounts){
  const DESCRIPTION = "sendXRP"
  const acctlist = []
  const sender = document.getElementById("sender-xrp").value
  const xrp_amount = document.getElementById("sender-xrp-amount").value

  accounts.forEach(acct => acctlist.push(acct.value))

  const data = JSON.stringify({
    sender: sender,
    xrp_amount: xrp_amount,
    acctlist: acctlist
  })

  preRequest(DESCRIPTION)

  let response = await fetch('/sendxrp', {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: data
  })

  if(response.ok){  
    response = await response.json()
    clearAccounts();
    alert(`[STATUS 200] Processing done. Pls check server log for more information.`)
    //clearXRPScatterInfo();
  }else{
    clearAccounts()
    alert(`[ERROR] Internal Server Error. No transaction was submitted. Please check server log.`)
    document.getElementById('set-tl-modal-close').click()
  }

  postRequest(DESCRIPTION)
  return
}

async function sendNonXRP(accounts){
  const DESCRIPTION = "sendNonXRP"
  const acctlist = []
  const receiver = document.getElementById("receiver-nonxrp").value
  const token_issuer = document.getElementById("receiver-nonxrp-issuer").value
  const currency = document.getElementById("receiver-nonxrp-currency").value
  const nonxrp_amount = document.getElementById("receiver-nonxrp-amount").value

  accounts.forEach(acct => acctlist.push(acct.value));

  preRequest(DESCRIPTION)

  const data = JSON.stringify({
    receiver: receiver,
    issuer: token_issuer,
    currency: currency,
    nonxrp_amount: nonxrp_amount,
    acctlist: acctlist
  })

  let response = await fetch('/sendnonxrp', {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: data
  })

  if(response.ok){  
    response = await response.json();
    clearAccounts();
    alert(`[STATUS 200] Processing done. Pls check server log for more information.`)
    //clearTokenAggregatorInfo();
  }else{
    clearAccounts()
    alert(`[ERROR] Internal Server Error. No transaction was submitted. Please check server log.`)
    document.getElementById('set-tl-modal-close').click()
  }

  postRequest(DESCRIPTION)

  return
}


async function viewInfo(){
  document.getElementById("view-accts-modal-content").innerHTML = '';
  document.getElementById("view-accts-modal-header").innerText = "Please Wait..."
  document.body.style.cursor = "wait"
  

  let response = await fetch('/viewinfo')
  
  if(response.ok){
    
    response = await response.json()

    account_infos = response.accounts_info
    createSummaryElement(account_infos)
    
    account_infos.forEach(account_info => createAccountInfoElement(account_info))
  }

  document.getElementById("view-accts-modal-header").innerText = "Account Informations"
  document.body.style.cursor = "default"
}


function createSummaryElement(_account_infos){
  let total_avail_bal = total_bal = 0

  _account_infos.forEach(account_info => {
    total_bal += Number(account_info.total_bal)
    total_avail_bal += Number(account_info.avail_balance)
  })

  const parent = document.getElementById("view-accts-modal-content")
  const summaryElement1 = document.createElement("div")
  summaryElement1.classList.add("block")
  summaryElement1.classList.add("is-size-6")
  summaryElement1.style.fontWeight = "bold"

  const summaryText1 = document.createTextNode("Total XRP Balance: " + total_bal + " XRP")
  
  const summaryElement2 = document.createElement("div")
  summaryElement2.classList.add("block")
  summaryElement2.classList.add("is-size-6")
  summaryElement2.style.fontWeight = "bold"

  const summaryText2 = document.createTextNode("Total Available Balance: " + total_avail_bal + " XRP")
  
  summaryElement1.appendChild(summaryText1)
  summaryElement2.appendChild(summaryText2)
  parent.appendChild(summaryElement1)
  parent.appendChild(summaryElement2)

  return
}


function createAccountInfoElement(account_info){
  const parent = document.getElementById("view-accts-modal-content")

  const divElement = document.createElement("div")
  divElement.classList.add("block")

  const pElement = document.createElement("p")
  const pElementText = document.createTextNode("(" + account_info.account_name + ") " + account_info.wallet_address)
  pElement.style.fontWeight = "bold"

  if(Number(account_info.avail_balance) < 2){
    pElement.style.color = "red"
  }

  const pElement2 = document.createElement("p")
  const pElementText2 = document.createTextNode("Available Balance: " + account_info.avail_balance + " XRP")

  const pElement3 = document.createElement("p")
  const pElementText3 = document.createTextNode("Number of current trustlines: " + account_info.tl_count + " trustlines")

  const pElement4 = document.createElement("p")
  const pElementText4 = document.createTextNode("Number of current offers: " + account_info.offer_count + " offers")

  pElement.appendChild(pElementText)
  pElement2.appendChild(pElementText2)
  pElement3.appendChild(pElementText3)
  pElement4.appendChild(pElementText4)

  divElement.appendChild(pElement)
  divElement.appendChild(pElement2)
  divElement.appendChild(pElement3)
  divElement.appendChild(pElement4)

  parent.append(divElement)

  return
}


async function trustlineChecker(){
  document.getElementById("tl-checker-modal-content").innerHTML = ""
  document.body.style.cursor = "wait"
  document.getElementById("tl-checker-modal-header").innerText = "Please Wait..."
  
  const trustline = document.getElementById("tl-checker-currency").value

  data = JSON.stringify({
    trustline: trustline
  })

  let response = await fetch('/tlchecker', {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: data
  })

  if(response.ok){
    response = await response.json()
    const trustline_accounts = response.trustline_accounts
    trustline_accounts.forEach(trustline_account => {
      createTrustlineAccountsElement(trustline_account.wallet_addresses, trustline_account.account_names)
    })
  }

  document.getElementById("tl-checker-modal-header").innerText = "Accounts with trustline"
  document.body.style.cursor = "default"

  return
}


function createTrustlineAccountsElement(wallet_address, account_name){
  console.log(wallet_address);
  const parent = document.getElementById("tl-checker-modal-content")

  const divElement = document.createElement("div")
  divElement.classList.add("block")

  const pElement = document.createElement("p")
  const pElementText = document.createTextNode("(" + account_name + ") " + wallet_address)
  pElement.style.fontWeight = "bold"

  pElement.appendChild(pElementText)
  divElement.appendChild(pElement)

  parent.append(divElement)

  return;
}


function preRequest(request_name){
  if(request_name == "setTL"){
    setTLBtn.classList.add("is-loading")
    delTLBtn.classList.add("is-static")
    sendXRPBtn.classList.add("is-static")
    sendNonXRPBtn.classList.add("is-static")
  }
  else if(request_name == "delTL"){
    delTLBtn.classList.add("is-loading")
    setTLBtn.classList.add("is-static")
    sendXRPBtn.classList.add("is-static")
    sendNonXRPBtn.classList.add("is-static")
  }
  else if(request_name == "sendXRP"){
    sendXRPBtn.classList.add("is-loading")
    setTLBtn.classList.add("is-static")
    delTLBtn.classList.add("is-static")
    sendNonXRPBtn.classList.add("is-static")
  }
  else if(request_name == "sendNonXRP"){
    sendNonXRPBtn.classList.add("is-loading")
    setTLBtn.classList.add("is-static")
    delTLBtn.classList.add("is-static")
    sendXRPBtn.classList.add("is-static")
  }
  return;
}


function postRequest(request_name){
  if(request_name == "setTL"){
    setTLBtn.classList.remove("is-loading")
    delTLBtn.classList.remove("is-static")
    sendXRPBtn.classList.remove("is-static")
    sendNonXRPBtn.classList.remove("is-static")
  }
  else if(request_name == "delTL"){
    delTLBtn.classList.remove("is-loading")
    setTLBtn.classList.remove("is-static")
    sendXRPBtn.classList.remove("is-static")
    sendNonXRPBtn.classList.remove("is-static")
  }
  else if(request_name == "sendXRP"){
    sendXRPBtn.classList.remove("is-loading")
    setTLBtn.classList.remove("is-static")
    delTLBtn.classList.remove("is-static")
    sendNonXRPBtn.classList.remove("is-static")
  }
  else if(request_name == "sendNonXRP"){
    sendNonXRPBtn.classList.remove("is-loading")
    setTLBtn.classList.remove("is-static")
    delTLBtn.classList.remove("is-static")
    sendXRPBtn.classList.remove("is-static")
  }

  return
}


function validateTLCheckerInput(){
  const currency = document.getElementById("tl-checker-currency").value
  
  document.getElementById("tl-checker-btn").disabled = currency != "" ? false : true

  return
}


function validateSetTLInput(){
  const token_issuer = document.getElementById("token-issuer").value
  const currency = document.getElementById("currency").value
  const limit = document.getElementById("limit").value
  
  if(token_issuer != "" && currency != "" && limit != ""){
    document.getElementById("add-accts-btn").disabled = false
  }else{
    document.getElementById("add-accts-btn").disabled = true
  }

  return
}


function validateTokenAggregatorInput(){
  const receiver_address = document.getElementById("receiver-nonxrp").value
  const token_issuer = document.getElementById("receiver-nonxrp-issuer").value
  const currency = document.getElementById("receiver-nonxrp-currency").value
  const amount = document.getElementById("receiver-nonxrp-amount").value
  
  if(receiver_address != "" && token_issuer != "" && currency != "" && amount != ""){
    document.getElementById("aggregator-add-sender").disabled = false
  }else{
    document.getElementById("aggregator-add-sender").disabled = true
  }

  return;
}


function validateXRPScatterInput(){
  const token_issuer = document.getElementById("sender-xrp").value
  const amount = document.getElementById("sender-xrp-amount").value
  
  if(token_issuer != "" && amount != ""){
    document.getElementById("sender-xrp-btn").disabled = false
  }else{
    document.getElementById("sender-xrp-btn").disabled = true
  }

  return;
}


function accountToggle(source) {
  checkboxes = document.getElementsByName('accts')
  for(var i=0, n=checkboxes.length;i<n;i++) {
    checkboxes[i].checked = source.checked
  }

  return;
}


function clearAll(){
  document.getElementById("tl-checker-currency").value = ""  
  document.getElementById("token-issuer").value = ""
  document.getElementById("currency").value = ""
  document.getElementById("limit").value = ""
  document.getElementById("receiver-nonxrp").value = ""
  document.getElementById("receiver-nonxrp-issuer").value = ""
  document.getElementById("receiver-nonxrp-currency").value = ""
  document.getElementById("receiver-nonxrp-amount").value = ""
  document.getElementById("sender-xrp").value = ""
  document.getElementById("sender-xrp-amount").value = ""

  return
}


function clearAccounts(){
  const checkboxes = document.getElementsByName('accts')
  const selectall = document.getElementById('select-all-btn')
  for(var i=0, n=checkboxes.length;i<n;i++) {
    checkboxes[i].checked = false
  }
  selectall.checked = false

  return
}


function clearTrustlineInfo(){
  document.getElementById("token-issuer").value = ''
  document.getElementById("currency").value = ''
  document.getElementById("limit").value = ''

  return
}


function clearXRPScatterInfo(){
  document.getElementById("sender-xrp").value = ''
  document.getElementById("sender-xrp-amount").value = ''

  return
}


function clearTokenAggregatorInfo(){
  document.getElementById("receiver-nonxrp").value = ''
  document.getElementById("receiver-nonxrp-issuer").value = ''
  document.getElementById("receiver-nonxrp-currency").value = ''
  document.getElementById("receiver-nonxrp-amount").value = ''

  return
}