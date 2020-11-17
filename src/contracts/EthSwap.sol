pragma solidity ^0.5.0;

import "./Token.sol";

contract EthSwap {
    string public name = 'EthSwap Instant Exchange';
    Token public token;
    uint public rate = 100;
    bool public Flagg;

    event TokensPurchased(
        address account,
        address token,
        uint amount,
        uint rate
    );

    event TokensSold(
        address account,
        address token,
        uint amount,
        uint rate
    );

    constructor(Token _token) public {
        token = _token;
    }


    // Check for  re-entrancy attack 
    // https://medium.com/coinmonks/protect-your-solidity-smart-contracts-from-reentrancy-attacks-9972c3af7c21#:~:text=A%20reentrancy%20attack%20can%20occur,before%20it%20resolves%20any%20effects.&text=All%20an%20attacker%20needs%20to,fallback%20function%20that%20calls%20withdraw.
    function buyTokens() public payable {

        // tokens = ether sent * rate
        uint tokenAmount = msg.value * rate;

        // check if contract has enough token balance
        require(token.balanceOf(address(this)) >= tokenAmount && !Flagg);

        Flagg = true;

        token.transfer(msg.sender, tokenAmount);

        emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);

        Flagg = false;
    }

    function sellTokens(uint _tokenAmount) public {

        // Check if seller has sufficient tokens
        require(token.balanceOf(msg.sender) >= _tokenAmount);

        // Calculate equivalent amount of ether to transfer to seller
        uint eth_eq = _tokenAmount / rate;

        // Check if contract has sufficient ether to transfer
        require(address(this).balance >= eth_eq);

        // transfer the tokens back to the contract
        token.transferFrom(msg.sender, address(this), _tokenAmount);

        // Send the ETH back to the seller
        msg.sender.transfer(eth_eq);

        emit TokensSold(msg.sender, address(token), _tokenAmount, rate);

    }

}