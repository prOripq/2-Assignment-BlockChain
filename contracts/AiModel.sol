// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AIModelMarketplace {
    struct Model {
        string name;
        string description;
        uint256 price;
        address payable creator;
        uint256 ratingSum;
        uint256 ratingCount;
    }

    Model[] public models;
    mapping(address => uint256) public balances;

    event ModelListed(uint256 modelId, string name, uint256 price);
    event ModelPurchased(uint256 modelId, address buyer);
    event ModelRated(uint256 modelId, uint8 rating);

    function listModel(string memory _name, string memory _description, uint256 _price) public {
        models.push(Model(_name, _description, _price, payable(msg.sender), 0, 0));
        emit ModelListed(models.length - 1, _name, _price);
    }

    function purchaseModel(uint256 _modelId) public payable {
        Model storage model = models[_modelId];
        require(msg.value == model.price, "Incorrect price sent");
        model.creator.transfer(msg.value);
        emit ModelPurchased(_modelId, msg.sender);
    }

    function rateModel(uint256 _modelId, uint8 _rating) public {
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");
        Model storage model = models[_modelId];
        model.ratingSum += _rating;
        model.ratingCount++;
        emit ModelRated(_modelId, _rating);
    }

    function withdrawFunds() public {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No funds to withdraw");
        balances[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    function getModelDetails(uint256 _modelId) public view returns (string memory, string memory, uint256, address, uint256) {
        Model storage model = models[_modelId];
        uint256 averageRating = model.ratingCount > 0 ? model.ratingSum / model.ratingCount : 0;
        return (model.name, model.description, model.price, model.creator, averageRating);
    }
}
