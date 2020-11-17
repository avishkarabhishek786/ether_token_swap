const { assert } = require('chai');

const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

require('chai')
    .use(require('chai-as-promised'))
    .should()


function tokens(n) {
    return web3.utils.toWei(n, 'ether');
}

contract('EthSwap', (accounts)=>{

    let token, ethSwap;

    before(async()=>{
        token = await Token.new()
        ethSwap = await EthSwap.new(token.address)
    })

    describe('EthSwap deployment', async () => {

        it('contract has a name', async()=>{
            const name = await token.name();
            assert.equal(name, 'DApp Token');
        })
        
        it('contract has a name', async () => {
            const name = await ethSwap.name();
            assert.equal(name, 'EthSwap Instant Exchange');
        })

        it('contract has balance', async () => {

            await token.transfer(ethSwap.address, tokens('1000000'))

            let balance = await token.balanceOf(ethSwap.address);
            assert.equal(balance.toString(), tokens('1000000'));
        })

    });

    describe('buyTokens()', async () => {
        
        let result;

        before(async () => {
            result = await ethSwap.buyTokens({
                from: accounts[1],
                value: web3.utils.toWei('1', 'ether')
            })
        })
        
        it('should allow sender to buy tokens', async () => {
            let newBalance = await token.balanceOf(accounts[1]);
            assert.equal(newBalance, tokens('100'))

            let ethSwapBalance = await token.balanceOf(ethSwap.address);
            assert.equal(ethSwapBalance, tokens('999900'))

            let ethSwapBalanceEth = await web3.eth.getBalance(ethSwap.address);
            assert.equal(ethSwapBalanceEth.toString(), web3.utils.toWei('1', 'Ether'));

            //console.log(result);

            const event = result.logs[0].args;
            assert.equal(event.account, accounts[1]);
            assert.equal(event.token, token.address);
            assert.equal(event.amount.toString(), tokens('100').toString());
            assert.equal(event.rate.toString(), '100');

        })

    })

    describe('sellTokens()', async () => {
        
        let result;

        before(async () => {

            await token.approve(ethSwap.address, tokens('100'), {from: accounts[1]})

            result = await ethSwap.sellTokens(
                tokens('100'),    
                {from: accounts[1]}
            )
        })

        it('should allow users to sell tokens for ethers', async () => {
            
            // Check user balance after 
            let userBalance = await token.balanceOf(accounts[1]);
            assert.equal(userBalance.toString(), tokens('0'));

            // check ethSwap balance after purchase
            let ethSwapBalance;
            ethSwapBalance = await token.balanceOf(ethSwap.address);
            assert.equal(ethSwapBalance.toString(), tokens('1000000'));
            ethSwapBalance = await web3.eth.getBalance(ethSwap.address);
            assert.equal(ethSwapBalance.toString(), web3.utils.toWei('0', 'Ether'))

            

        })

    })

})