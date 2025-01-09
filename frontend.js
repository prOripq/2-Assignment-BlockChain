// Initialize Web3
const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");


const contractABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_price",
				"type": "uint256"
			}
		],
		"name": "listModel",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_modelId",
				"type": "uint256"
			}
		],
		"name": "purchaseModel",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_modelId",
				"type": "uint256"
			},
			{
				"internalType": "uint8",
				"name": "_rating",
				"type": "uint8"
			}
		],
		"name": "rateModel",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "payable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "withdrawFunds",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "funds",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_modelId",
				"type": "uint256"
			}
		],
		"name": "getModelDetails",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "modelCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "models",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "address payable",
				"name": "creator",
				"type": "address"
			},
			{
				"internalType": "uint8",
				"name": "ratingCount",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "totalRating",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
const contractAddress = "0xdc37321189d81d9043cb8a5d43511b8f59abe588";

const contract = new web3.eth.Contract(contractABI, contractAddress);

// Connect to MetaMask
async function connectMetaMask() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    loadModels();
}

// Function to List a New Model
document.getElementById("listForm").onsubmit = async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const price = web3.utils.toWei(document.getElementById("price").value, 'ether');

    const accounts = await web3.eth.getAccounts();
    await contract.methods.listModel(name, description, price).send({ from: accounts[0] });
    alert('Model listed successfully!');
    loadModels();
};

async function loadModels() {
    const modelList = document.getElementById("modelList");
    const modelCount = await contract.methods.modelCount().call();

    modelList.innerHTML = '';  // Clear current list
    for (let i = 1; i <= modelCount; i++) {
        const model = await contract.methods.getModelDetails(i).call();

        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${model[0]}</strong><br>
            Price: ${web3.utils.fromWei(model[2], 'ether')} ETH<br>
            Rating: ${(model[5] / (model[4] || 1))} ⭐<br>
            <button onclick="viewModelDetails(${i})">View Details</button>
            <button onclick="purchaseModel(${i})">Purchase</button>
        `;
        modelList.appendChild(li);
    }
}


// Function to View Model Details
async function viewModelDetails(modelId) {
    try {
        const model = await contract.methods.getModelDetails(modelId).call();
        alert(`
            Model Name: ${model[0]}
            Description: ${model[1]}
            Price: ${web3.utils.fromWei(model[2], 'ether')} ETH
            Creator: ${model[3]}
            Total Ratings: ${model[4]}
        `);
    } catch (error) {
        console.error("Error showing model details:", error);
        alert('Failed to show model details.');
    }
}

// Function to Purchase a Model
async function purchaseModel(modelId) {
    const accounts = await web3.eth.getAccounts();
    const price = await contract.methods.models(modelId).call().then(model => model.price);

    await contract.methods.purchaseModel(modelId).send({ from: accounts[0], value: price });
    alert('Model purchased successfully!');
    loadModels();
}

// Function to Rate a Model
document.getElementById("rateForm").onsubmit = async (event) => {
    event.preventDefault();

    const modelId = document.getElementById("rateModelId").value;
    const rating = document.getElementById("rating").value;

    const accounts = await web3.eth.getAccounts();
    await contract.methods.rateModel(modelId, rating).send({ from: accounts[0] });
    alert('Model rated successfully!');
    loadModels();
};


document.getElementById("listForm").onsubmit = async (event) => {
    event.preventDefault();
    try {
        const name = document.getElementById("name").value;
        const description = document.getElementById("description").value;
        const price = web3.utils.toWei(document.getElementById("price").value, 'ether');

        console.log("Listing Model:", { name, description, price });

        const accounts = await web3.eth.getAccounts();
        console.log("Using Account:", accounts[0]);

        await contract.methods.listModel(name, description, price).send({ from: accounts[0] });
        alert('Model listed successfully!');
        loadModels();
    } catch (error) {
        console.error("Error Listing Model:", error);
        alert("Failed to list the model. Check console for details.");
    }
};

// Withdraw
// Function to display the funds in the contract
async function displayFunds() {
    const funds = await contract.methods.funds().call();
    const fundsInfo = document.getElementById("fundsInfo");
    fundsInfo.innerText = `Contract Funds: ${web3.utils.fromWei(funds, 'ether')} ETH`;
}

// Function to withdraw funds
document.getElementById("withdrawFundsButton").onclick = async () => {
    try {
        const accounts = await web3.eth.getAccounts();
        await contract.methods.withdrawFunds().send({ from: accounts[0] });
        alert('Funds withdrawn successfully!');
        displayFunds();
    } catch (error) {
        console.error("Error withdrawing funds:", error);
        alert('Failed to withdraw funds. Ensure you are the contract owner.');
    }
};

// Call displayFunds on page load
displayFunds();



connectMetaMask();