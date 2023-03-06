//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.19;

// Deployed to Goerli at 0x97eD63a8945F8591D79E54418503f67aB26f03aA

contract BuyMeACoffee {
    // event to emit when a Memo is created.
    event NewMemo(
        address indexed from,
        uint256 timestamp,
        string name,
        string message
    );

    // Memo struct.
    struct Memo {
        address from;
        uint256 timestamp;
        string name;
        string message;
    }

    string constant ERROR_UNAUTHORIZED = "Unauthorized call.";

    // List of all memos received from friends.
    Memo[] memos;

    // Address of contract deployer.
    address payable owner;

    // Deploy logic.
    constructor() {
        owner = payable(msg.sender);
    }

    /**
     * @dev transfers ownership to a new address
     * @param _newOwner the new owner address
     */
    function transferOwnership(address _newOwner) public {
        require(msg.sender == owner, ERROR_UNAUTHORIZED);
        owner = payable(_newOwner);
    }

    /**
     * @dev retrives the owner address
     */
    function getOwner() public view returns (address) {
        return owner;
    }

    /**
     * @dev buy a coffee for contract owner
     * @param _name name of the coffee buyer
     * @param _message a nice message from the coffee buyer
     */
    function buyCoffee(string memory _name, string memory _message)
        public
        payable
    {
        require(msg.value > 0, "Can't buy coffee with 0 eth");

        // Add memo to blockchain storage
        memos.push(Memo(msg.sender, block.timestamp, _name, _message));

        // emit a log event when a new memo is created.
        emit NewMemo(msg.sender, block.timestamp, _name, _message);
    }

    /**
     * @dev send the entier balance stored in this contract to the owner
     */
    function withdrawTips() public {
        require(msg.sender == owner, ERROR_UNAUTHORIZED);
        owner.transfer(address(this).balance);
    }

    /**
     * @dev retrieve all the memos received and stored on the blockchain
     */
    function getMemos() public view returns (Memo[] memory) {
        return memos;
    }
}
