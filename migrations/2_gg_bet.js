const GGbet = artifacts.require('GGbet');

module.exports = async function (deployer) {
  await deployer.deploy(GGbet);
};
