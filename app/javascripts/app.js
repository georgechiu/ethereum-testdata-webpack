// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3 } from 'web3';
import { default as Contract } from 'truffle-contract';
// https://github.com/emn178/js-sha256
import { sha256 } from 'js-sha256';

// Import our contract artifacts and turn them into usable abstractions.
import testdata_artifacts from '../../build/contracts/TestdataFactory.json';

// Testdata is our usable abstraction, which we'll use through the code below.
var Testdata = Contract(testdata_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  start: function () {
    // Bootstrap the Echo abstraction for Use.
    Testdata.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
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

  setStatus: function (message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  setReceipt: function (receipt) {
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

  clearReceipt: function () {
    document.getElementById("receipt").innerHTML = "";
  },

  getFilesByOwner: function (owner) {
    var testdata;
    var file_ids;
    Testdata.deployed().then(function (instance) {
      testdata = instance;
      file_ids = testdata.getAllTestdata(owner);
    });
    return file_ids;
  },

  displayFiles: function (file_ids) {
    var files_span = document.getElementById("files");
    var testdata;

    files_span.innerHTML = "";

    Testdata.deployed().then(function (instance) {
      testdata = instance;
      for (file_id of file_ids) {
        testdata.getTestdata(file_id).then(function (file) {
          files_span.innerHTML += "<ul><li>File Name: " + file.name + "</li><li>Size: " + file.size + "</li></ul>";
        });
      }
    });
  },

  getFilename: function () {
    var fullPath = document.getElementById('testfile').value;

    if (fullPath) {
      var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
      var filename = fullPath.substring(startIndex);
      if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
        filename = filename.substring(1);
      }
      document.getElementById('filename').value = filename;
    }
  },

  getFileSizeAndHashcode: function () {
    var reader = new FileReader();
    reader.onload = function () {
      var text = reader.result;
      var size = document.getElementById('filesize');
      size.value = text.length;

      var hashcode = document.getElementById('hashcode');
      hashcode.value = sha256(text);
    };
    var input = document.getElementById('testfile');
    reader.readAsBinaryString(input.files[0]);
  },

  changeFile: function () {
    var self = this;
    self.getFilename();
    self.getFileSizeAndHashcode();
  },

  uploadFile: function () {
    var self = this;
    var filename = document.getElementById("filename").value;
    var filesize = document.getElementById("filesize").value;
    var hashcode = document.getElementById("hashcode").value;
    var files_span = document.getElementById("files");

    self.clearReceipt();
    self.setStatus("Initiating transaction... (please wait)");

    var testdata;
    Testdata.deployed().then(function (instance) {
      testdata = instance;

      var NewTestdataEvent = testdata.NewTestdataEvent();
      NewTestdataEvent.watch(function (error, result) {
        if (!error) {
          testdata.getAllTestdata(account).then(function (file_ids) {
            files_span.innerHTML = "";
            files_span.innerHTML += "<ul>Your file list:";
            for (var file_id of file_ids) {
              testdata.getTestdata(file_id, { from: account }).then(function (result) {
                files_span.innerHTML += "<li>File Name: " + result[0] + ", Size: " + result[1] + ", Hash Code: " + result[2] + "</li>";
              });
            }
            files_span.innerHTML += "</ul>";
          });
        } else {
          console.log(error);
        }
      });

      testdata.createTestdata(filename, filesize, hashcode, { from: account }).then(function (tx) {
        console.log(tx.receipt);
        self.setStatus("Successfully uploaded file: " + filename);
        self.setReceipt(tx.receipt);
      });
    }).catch(function (e) {
      console.log(e);
      self.setStatus("Error uploading file; see log.");
    });
  }
};

window.addEventListener('load', function () {
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
