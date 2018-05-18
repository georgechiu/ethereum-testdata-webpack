// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3 } from 'web3';
import { default as Contract } from 'truffle-contract';

// Import our contract artifacts and turn them into usable abstractions.
import echo_artifacts from '../../build/contracts/Echo.json';

// Echo is our usable abstraction, which we'll use through the code below.
var Echo = Contract(echo_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  start: function() {
    // Bootstrap the Echo abstraction for Use.
    Echo.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length === 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  setReceipt: function(receipt) {
    var receipt_span = document.getElementById("receipt");
    var html_text = "<br>Receipt: <br>Block Hash: " + receipt.blockHash;
    html_text += "<br>Block Number: " + receipt.blockNumber;
    html_text += "<br>Transaction Hash: " + receipt.transactionHash;
    html_text += "<br>Transaction Index: " + receipt.transactionIndex;
    html_text += "<br>Cumulative Gas Used: " + receipt.cumulativeGasUsed;
    html_text += "<br>Gas Used: " + receipt.gasUsed;
    html_text += "<br>Status: " + receipt.status;
    receipt_span.innerHTML = html_text;
  },

  sendWords: function() {
    var self = this;
    var words = document.getElementById("words").value;

    self.setStatus("Initiating transaction... (please wait)");

    var echo;
    Echo.deployed().then(function(instance) {
      echo = instance;

      var echoEvent = echo.EchoEvent();
      echoEvent.watch(function(error, result) {
        if (!error) {
          self.setStatus(result.args.message);
        } else {
          console.log(error);
        }
      });

      echo.echo(words, { from: account }).then(function(tx) {
        console.log(tx.receipt);
        self.setReceipt(tx.receipt);
      });
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending words; see log.");
    });
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask");
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
  }

  App.start();
});
