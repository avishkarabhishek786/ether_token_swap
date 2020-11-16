const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

module.exports = async function(deployer) {
  await deployer.deploy(Token);
  const token = await Token.deployed();
  
  await deployer.deploy(EthSwap, token.address);
  const ethSwap = await EthSwap.deployed();
       
  const ethSwapAddr = ethSwap.address;

  await token.transfer(ethSwapAddr, '1000000000000000000000000');

  let ethSwapBalance = await token.balanceOf(ethSwapAddr);

  console.log(ethSwapBalance.toString());

};
