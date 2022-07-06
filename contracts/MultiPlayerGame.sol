//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

//        _                                   _     _ _   
//       | |                                 | |   (_) |  
//    ___| |__   ___  ___ ___  ___  _ __ ___ | |__  _| |_ 
//   / __| '_ \ / _ \/ __/ __|/ _ \| '_ ` _ \| '_ \| | __|
//  | (__| | | |  __/\__ \__ \ (_) | | | | | | |_) | | |_ 
//   \___|_| |_|\___||___/___/\___/|_| |_| |_|_.__/|_|\__|

// v0.0.1
// This smart contract is designed to be used as a standard for simple 2 players game,
// where the game logic runs on an external server and the winner is defined by the server.
// This contract should only be used, if the gas price for the game logic, or the complexity
// of the game logic is too high to be ran on the blockchain.

contract MultiPlayerGame {
    event GameId(uint _gameId);

    struct Game {
        uint amount;
        address player1;
        address player2;
        address payable winner;
    }

    Game[] public games;
    
    address payable owner;

    constructor() {
        // Set the transaction sender as the owner of the contract.
        owner = payable(msg.sender);
    }

    // create a new game, set an amount bigger than 0
    // emit the game ID, to allow users to join the game through this ID
    function createGame(uint _amount) public payable validAddress {
        require(msg.value > 0, "Amount must be bigger than 0");
        require(msg.value == _amount, "Amounts do not match");
        this.transfer(msg.value*0.05, owner);
        Game memory g = Game(_amount*0.95, msg.sender, address(0), payable(address(0)));
        games.push(g);

        // return the game ID
        uint gameId = games.length - 1;

        emit GameId(gameId);
    }

    // join a game by ID if the game is still open
    // Player 1 and Player 2 can't have the same address
    function joinGame(uint _gameId) public payable validAddress isGameOpen(_gameId) {
        // require(msg.value == games[_gameId].amount, "Enter the same amount to join.");
        require(msg.sender != games[_gameId].player1, "P1 must be different than P2");
        games[_gameId].amount = games[_gameId].amount + msg.value;
        games[_gameId].player2 = msg.sender;
    }

    // the winner can only be set by the admin
    function setWinner(uint _gameId, address _winner) public payable onlyOwner{
        games[_gameId].winner = payable(_winner);
    }

    function claim(uint _gameId) public payable {
        require(msg.sender == games[_gameId].winner, "You are not the winner");
        games[_gameId].winner.transfer(games[_gameId].amount);
    }

    // get game winner
    function getWinner(uint _gameId) public view returns(address) {
        return games[_gameId].winner;
    }

    // @TODO: Remove this function
    function getBalanceOfGame(uint _gameId) public view returns(uint) {
        return games[_gameId].amount;
    }

    // @TODO: Remove this function
    function getBalance() public view returns(uint) {
        return address(this).balance;
    }

    // Modifier to check that the caller is the owner of
    // the contract.
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // Modifiers can take inputs. This modifier checks that the
    // address passed in is not the zero address.
    modifier validAddress() {
        require(msg.sender != address(0), "Not valid address");
        require(msg.sender != owner, "Owner cannot play :(");
        _;
    }

    modifier isGameOpen(uint _gameId) {
        require(games[_gameId].player2 == address(0), "Game is closed");
        _;
    }
}
