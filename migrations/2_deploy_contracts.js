var ConvertLib = artifacts.require("./ConvertLib.sol");
var MetaCoin = artifacts.require("./MetaCoin.sol");

var strings = artifacts.require("./strings.sol");
var Echo = artifacts.require("./Echo.sol");

var TestdataFactory = artifacts.require("./TestdataFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, MetaCoin);
  deployer.deploy(MetaCoin);

  deployer.deploy(strings);
  deployer.link(strings, Echo);
  deployer.deploy(Echo);

  deployer.deploy(TestdataFactory);
};
