// SPDX-License-Identifier: MIT

pragma solidity 0.8.12;

contract lotteryContract {
    address public contractOwner;
    address public lastWinner;
    uint public lastWinnerPot;

    // Current lottery Id
    uint private lotteryId = 1;

    // Mapping of registered players
    // Usefull to check if a player have already a ticket
    mapping (uint => mapping(address => bool)) public registeredPlayers;

    // Array of registered players
    // Usefull to generate random winner
    // based on this array length
    address[] private playersAddresses;

    /*
     * Set contract owner on deploy
     */
    constructor() {
        contractOwner = msg.sender;
    }

    /*
     * This modifier excute code only if sender is the contract owner
     */
    modifier onlyOwner() {
        require(contractOwner == msg.sender, "Only owner get do this");
        _;
    }

    /*
     * Event when winner is draw
     * send winner address 
     */
    event drawEnded(address winner, uint gain);

    /*
     * Event when ticket was purchased
     */
    event ticketPurchased(address player, uint pot, uint participants);

    /*
     * Function to draw winner of the current lottery
     */
    function drawWinner() public onlyOwner {
        uint index = random() % playersAddresses.length;
        lastWinner = playersAddresses[index];

        uint gain = getCurrentPot();
        lastWinnerPot = gain;

        // send 80% of the pot to the winner
        payable (lastWinner).transfer(gain);

        // Send rest to contract owner
        payable (contractOwner).transfer(address(this).balance);

        emit drawEnded(lastWinner, gain);

        // reset playersAddress and create a new lottery id
        lotteryId += 1;
        playersAddresses = new address[](0);
    }

    /*
     * Get current lottery pot
     */
    function currentPot() public view returns(uint) {
        return getCurrentPot();
    }

    /*
     * Get if send has a ticket
     */
    function hasTicket() public view returns(bool) {
        return registeredPlayers[lotteryId][msg.sender];
    }

    /*
     * Get number of participants
     */
    function countParticipants() public view returns(uint) {
        return playersAddresses.length;
    }

    /*
     * Let player buy ticket
     * Price is 0.02 eth
     * And only one ticket by address
     */
    function buyTicket() external payable {
        require (msg.value == 0.02 ether, "Ticket coast 0.02 ETH !");
        require (!registeredPlayers[lotteryId][msg.sender], "You have almost a ticket !");
        require (msg.sender != contractOwner, "Admin can't participate");

        registeredPlayers[lotteryId][msg.sender] = true;
        playersAddresses.push(msg.sender);

        emit ticketPurchased(msg.sender, getCurrentPot(), playersAddresses.length);
    }

    /*
     * Private function for generate random using
     * the current timestamp and playersAddresses
     */
    function random() private view returns (uint) {
        return uint (keccak256(abi.encode(block.timestamp, playersAddresses)));
    }

    function getCurrentPot() private view returns(uint) {
        return address(this).balance * 80 / 100;
    }
}