// var ConvertLib = artifacts.require("./ConvertLib.sol");
// var MetaCoin = artifacts.require("./MetaCoin.sol");
var adseller = artifacts.require("./adseller.sol")

module.exports = function(deployer) {
  deployer.deploy(adseller);
};
// module.exports = function(deployer) {
//   deployer.deploy(ConvertLib);
//   deployer.link(ConvertLib, MetaCoin);
//   deployer.deploy(MetaCoin);
// };
