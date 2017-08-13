var BigCorp = artifacts.require("./BigCorp.sol");

module.exports = function(deployer) {
  deployer.deploy(BigCorp, 1000);
};
