var TestdataFactory = artifacts.require("./TestdataFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(TestdataFactory);
};
