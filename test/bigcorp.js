var BigCorp = artifacts.require("./BigCorp.sol");


contract('BigCorp', function(accounts) {

  //
  it("should grant the creator the initial shares", function() {
    return BigCorp.deployed().then(function(instance) {
      return instance.balanceOf.call(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 1000, "creator wasn't given 1000 shares");
    });
  });

  //
  it("should make the creator able to elect the president", function() {
    var big_corp;

    var creator = accounts[0];
    var toElect = accounts[1];
    var president;
    var creatorBacks;
    var toElectBackingShares;

    return BigCorp.deployed().then(function(instance) {
      big_corp = instance;
      return instance.voteForPresident(creator, {from: creator});
    }).then(function() {
      return big_corp.voteForPresident(toElect, {from: creator});
    }).then(function() {
      return big_corp.president();
    }).then(function(res) {
      president = res;
      return big_corp.candidateSupportedBy(creator);
    }).then(function(res) {
      creatorBacks = res;
      return big_corp.sharesVotingFor(toElect);
    }).then(function (res) {
      toElectBackingShares = res;
      assert.equal(toElect, president, "toElect should be president");
      assert.equal(creatorBacks, toElect, "creator backs toElect");
      assert.equal(toElectBackingShares, 1000, "toElect backed by all shares");
    });
  });

  //
  it("should unback president if elector sells shares", function() {
    var big_corp;

    var creator = accounts[0];
    var toElect = accounts[1];
    var buyer   = accounts[2];
    var president;
    var creatorBacks;
    var toElectBackingShares;

    return BigCorp.deployed().then(function(instance) {
      big_corp = instance;
      return instance.voteForPresident(toElect, {from: creator});
    }).then(function() {
      return big_corp.president();
    }).then(function(res) {
      president = res;
      assert.equal(toElect, president, "elected man should be president");
      return big_corp.transfer(buyer, 501, {from: creator});
    }).then(function() {
      return big_corp.president();
    }).then(function(res) {
      president = res;
      return big_corp.candidateSupportedBy(creator);
    }).then(function(res) {
      creatorBacks = res;
      return big_corp.sharesVotingFor(toElect);
    }).then(function(res) {
      toElectBackingShares = res;
      assert.equal(president, 0, "creator should be president");
      assert.equal(creatorBacks, toElect, "creator backs himself");
      assert.equal(toElectBackingShares, 499, "creator backed by all shares");
    }).then(function(res) {
      // Revert
      return big_corp.transfer(creator, 501, {from: buyer});
    });
  });

  //
  it("should change president if backers acquire enough shares", function() {
    var big_corp;

    var creator = accounts[0];
    var buyer1 = accounts[1];
    var buyer2 = accounts[2];
    var toElect = accounts[3];
    var president;
    var creatorBacks;
    var toElectBackingShares;

    return BigCorp.deployed().then(function(instance) {
      big_corp = instance;
      return big_corp.voteForPresident(toElect, {from: buyer1});
    }).then(function() {
      return big_corp.voteForPresident(toElect, {from: buyer2});
    }).then(function() {
      return big_corp.transfer(buyer1, 500, {from: creator});
    }).then(function() {
      return big_corp.president();
    }).then(function(res) {
      president = res;
      assert.equal(president, 0, "no president should yet be elected");
      return big_corp.transfer(buyer2, 1, {from: creator});
    }).then(function() {
      return big_corp.president();
    }).then(function(res) {
      president = res;
      return big_corp.sharesVotingFor(toElect);
    }).then(function (res) {
      toElectBackingShares = res;
      assert.equal(toElect, president, "toElect should be president");
      assert.equal(toElectBackingShares, 501, "toElect backed by buyers' shares");
    });
  });



});
