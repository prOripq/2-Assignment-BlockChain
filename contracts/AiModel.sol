// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AIModelMarketplace {
    struct Model {
        string name;
        string description;
        uint256 price;
        address payable creator;
        uint8 ratingCount;
        uint256 totalRating;
    }

    mapping(uint256 => Model) public models;
    uint256 public modelCount;
    address public owner;
    uint256 public funds;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can perform this action");
        _;
    }

    constructor() payable {
        owner = msg.sender;
        modelCount = 0;
        funds = 0;
    }

    function listModel(string memory _name, string memory _description, uint256 _price) public {
        modelCount++;
        models[modelCount] = Model({
            name: _name,
            description: _description,
            price: _price,
            creator: payable(msg.sender),
            ratingCount: 0,
            totalRating: 0
        });
    }

    function purchaseModel(uint256 _modelId) public payable {
        Model storage model = models[_modelId];
        require(msg.value == model.price, "Incorrect payment amount");

        // Transfer payment to the model creator
        model.creator.transfer(msg.value);
        funds += msg.value;
    }

    function rateModel(uint256 _modelId, uint8 _rating) public {
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");

        Model storage model = models[_modelId];
        model.ratingCount++;
        model.totalRating += _rating;
    }

    function getModelDetails(uint256 _modelId) public view returns (string memory, string memory, uint256, address, uint8, uint256) {
        Model memory model = models[_modelId];
        return (
            model.name,
            model.description,
            model.price,
            model.creator,
            model.ratingCount,
            model.totalRating
        );
    }

    function withdrawFunds() public onlyOwner {
        uint256 amount = funds;
        funds = 0;
        payable(owner).transfer(amount);
    }
}
