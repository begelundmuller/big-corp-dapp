// Import CSS
import "../stylesheets/app.css";

// Import JS libraries
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract';

// Import our contract artifact
import bigcorp_artifacts from '../../build/contracts/BigCorp.json'

// Instantiate abstracted contract
var BigCorp = contract(bigcorp_artifacts);

// App
window.App = {
  // Account exposed by web3 (set in +start+)
  account: null,

  // Initializer, called on window load (see below)
  start: function() {
    var self = this;

    // Set web3 provider on abstracted contract
    BigCorp.setProvider(web3.currentProvider);

    // Get accounts
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      // Set account
      self.account = accs[0];

      // Refresh interface
      self.refreshUI();

      // Listen for events; update UI on new events
      BigCorp.deployed().then(function(instance) {
        var watcher = function(err, res) {
          self.refreshUI();
        };

        var event = instance.Transfer({fromBlock: 0, toBlock: 'latest'});
        event.watch(watcher);

        var event = instance.PresidentChanged({fromBlock: 0, toBlock: 'latest'});
        event.watch(watcher);
      });
    });
  },

  // Updates status box
  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  // Refreshes UI components that rely on data from blockchain
  refreshUI: function() {
    this.refreshShares();
    this.refreshPresident();
    this.refreshVoting();
  },

  // Refreshes number of shares owned by user
  refreshShares: function() {
    var self = this;

    var corp;
    var sharesOwned;
    var totalShares;

    BigCorp.deployed().then(function(instance) {
      corp = instance;
      return corp.balanceOf.call(self.account, {from: self.account});
    }).then(function(value) {
      sharesOwned = value.valueOf();
      return corp.totalSupply.call();
    }).then(function(value) {
      totalShares = value.valueOf();

      var sharesString = "";
      sharesString += (sharesOwned / totalShares * 100).toFixed(1);
      sharesString += "% (" + sharesOwned + " shares)"

      var sharesElem = document.getElementById("shares");
      sharesElem.innerHTML = sharesString;

      self.setStatus("");
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting shares; see log.");
    });
  },

  // Refreshes who is currently president of BigCorp
  refreshPresident: function() {
    var self = this;

    var corp;
    var president;
    var backedByShares;
    var totalShares;

    BigCorp.deployed().then(function(instance) {
      corp = instance;
      return corp.president.call();
    }).then(function(value) {
      president = value.valueOf();
      return corp.sharesVotingFor.call(president);
    }).then(function(value) {
      backedByShares = value.valueOf();
      return corp.totalSupply.call();
    }).then(function(value) {
      totalShares = value.valueOf();

      var presidentString;
      if (self.isNullAddress(president)) {
        presidentString = "no one"
      } else {
        presidentString = president.substring(0, 8);
        presidentString += " who has " + (backedByShares / totalShares * 100).toFixed(1);
        presidentString += "% support (" + backedByShares + " shares)";
      }

      var presidentElem = document.getElementById("president");
      presidentElem.innerHTML = presidentString;

      self.setStatus("");
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting president info; see log.");
    });
  },

  // Refresh info on who the user is backing, and how much support his/her
  // candidate has
  refreshVoting: function() {
    var self = this;

    var corp;
    var currentlyVotingFor;
    var sharesVotingForCandidate;
    var totalShares;

    BigCorp.deployed().then(function(instance) {
      corp = instance;
      return corp.candidateSupportedBy.call(self.account);
    }).then(function(value) {
      currentlyVotingFor = value;
      return corp.sharesVotingFor.call(currentlyVotingFor);
    }).then(function(value) {
      sharesVotingForCandidate = value.valueOf();
      return corp.totalSupply.call();
    }).then(function(value) {
      totalShares = value.valueOf();

      var backingString;
      if (self.isNullAddress(currentlyVotingFor)) {
        backingString = "no one";
      } else {
        backingString = currentlyVotingFor.substring(0, 8);
        backingString += " who has " + (sharesVotingForCandidate / totalShares * 100).toFixed(1);
        backingString += "% support (" + sharesVotingForCandidate + " shares)";
      }

      var backingElem = document.getElementById("backing");
      backingElem.innerHTML = backingString;

      self.setStatus("");
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting president info; see log.");
    });
  },

  vote: function() {
    var self = this;

    var candidateAddress = document.getElementById("candidate_address").value;

    self.setStatus("Sending transaction, please wait...");

    var corp;
    BigCorp.deployed().then(function(instance) {
      corp = instance;
      return instance.voteForPresident(candidateAddress, {from: self.account});
    }).then(function(res) {
      console.log(res);
      self.setStatus("Transaction complete. Refreshing...");
      self.refreshVoting();
      self.refreshPresident();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error backing candidate; see log.");
    });
  },

  isNullAddress: function(address) {
    return address == "0x0000000000000000000000000000000000000000";
  },

  transfer: function() {
    var self = this;

    var amount = parseInt(document.getElementById("transfer_amount").value);
    var recipient = document.getElementById("transfer_recipient").value;

    this.setStatus("Sending transaction, please wait...");

    var corp;
    BigCorp.deployed().then(function(instance) {
      corp = instance;
      return corp.transfer(recipient, amount, {from: self.account});
    }).then(function() {
      self.setStatus("Transfer completed.");
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545.");
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }
  App.start();
});
