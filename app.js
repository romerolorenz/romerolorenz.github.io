// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css"

// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import hasherArtifacts from '../../build/contracts/Hasher.json'

var Hasher = contract(hasherArtifacts); //Hasher as contract abstraction
var dateFormat = require('dateformat'); //dateFormat library

var instance;                           //placeholder for contract instance

// Components
var inputHash = document.getElementById("inputHash"),
    set = document.getElementById("set"),
    txId = document.getElementById("txId"),
    get = document.getElementById("get"),
    currentTx = document.getElementById("currentTx"),
    details = document.getElementById("details"),
    showTxId = document.getElementById("showTxId");

// initialize web3
window.addEventListener('load', function() {
  if (typeof web3 !== 'undefined') {
    window.web3 = new Web3(web3.currentProvider);
  } else {
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }
  Hasher.setProvider(web3.currentProvider);
})    

window.App = {
  
  txTable: function(eventStored) {
    var tbl = "";
    eventStored.get(function(error, result){
      if(!error) {
        for(var i = 0; i < result.length; i++) {
          var argsKeys = Object.keys(result[i].args);
          var argsArray = []; 
          tbl += "<tr>";
                      
          //push details into argsArray
          argsArray.push(result[i].args._txId);
          argsArray.push(result[i].args._txHash);
          argsArray.push(dateFormat(new Date(result[i].args._time * 1000), "HH:MM:ss mm/dd/yyyy"));
    
          for(var j = 0; j < argsKeys.length; j++) {
            tbl += `<td>${argsArray[j]}</td>`;            
          }
          tbl += "</tr>";
        }
        document.getElementById("history").innerHTML = tbl;
      } else console.error(error);
    })          
  },

  filter: function(multiple) {
    var filterArray = [1,2,3,4,5,6,7,8,9,10]
    for(var i = 0; i < 10; i++) {
      filterArray[i] += (multiple * 10)
    }
    return filterArray
  },

  storeHash: function() {
    var x = "0x" + inputHash.value;
    Hasher.deployed().then(function(hasher) {
      instance = hasher;
      document.getElementById("inputHash").value = "";
      console.log("From account: " + web3.eth.accounts[0]);
      return instance.storeDetails.estimateGas(x, {from:web3.eth.accounts[0]});
    }).then(function(gas) {
      console.log("Gas estimate: " + gas);
      instance.storeDetails(x, {gas:gas, from:web3.eth.accounts[0]}).then(function(result){
        console.log("Tx Hash: " + result.tx);
      })
    }).catch(function(error){   
      console.error(error);                   
    })
  },

  getDetails: function() {
    Hasher.deployed().then(function(hasher) {
      instance = hasher;
      return instance.showTxDetails(txId.value)
    }).then(function(result){
      showTxId.innerHTML = `<strong>TxID: </strong>${txId.value}`;
      document.getElementById("txId").value = "";
      var hash = result[0],
          date = new Date(result[1] * 1000);
      if(hash == "0x0000000000000000000000000000000000000000000000000000000000000000") { hash = "No transaction hash stored" };
      (result[1] == 0) ? date = "<br>" : date = `<strong>Stored: </strong>${dateFormat(date, "hh:MM:ssTT mmm dS, yyyy")}`;
      txHash.innerHTML = hash;
      timestamp.innerHTML = date;
    }).catch(function(error){
      console.error(error);
    })
  },

}

set.addEventListener('click', function() {
  App.storeHash();
})

get.addEventListener('click', function() {
  App.getDetails();
})

window.addEventListener('load', function() {
  Hasher.deployed().then(function(hasher) {
    instance = hasher;
    return instance.Stored({}, {fromBlock:0, toBlock:"latest"})
  }).then(function(eventStored){
    eventStored.watch(function(error, result){
      if(!error) {
        currentTx.innerHTML = `Current Tx ID: -${result.args._txId}-`;
        App.txTable(eventStored);
      } else console.error(error);
    })
  })
})

