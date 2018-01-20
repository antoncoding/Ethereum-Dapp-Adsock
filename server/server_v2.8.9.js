// web3 0.20.1
// geth --testnet --rpc --rpcapi "eth,net,web3" --cache=1024  --rpcport 8545 --rpcaddr 127.0.0.1 --rpccorsdomain '*'
const express = require('express');
const bodyParser = require('body-parser')
var app = express();

const Web3 = require('web3');
// const etherUrl = "http://140.112.106.232:17777";
const etherUrl = "http://localhost:8546";
const abi = [{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"AdList","outputs":[{"name":"adname","type":"bytes32"},{"name":"content","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"adID","type":"bytes32"},{"name":"bidInTokens","type":"uint256"}],"name":"bidForAd","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"count_ad","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"adID","type":"bytes32"}],"name":"highestBidderFor","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"adname","type":"bytes32"},{"name":"content","type":"bytes32"}],"name":"addAd","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"playerInfo","outputs":[{"name":"playerAddress","type":"address"},{"name":"tokensBought","type":"uint256"},{"name":"balanceTokens","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"tokensSold","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"adID","type":"bytes32"}],"name":"highestBidFor","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"userAdr","type":"address"}],"name":"voterDetails","outputs":[{"name":"","type":"uint256"},{"name":"","type":"bytes32[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"highestBid","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalTokens","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"tokenPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"allCandidates","outputs":[{"name":"","type":"bytes32[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"account","type":"address"}],"name":"transferTo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"buy","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"highestBidder","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"balanceTokens","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"adID","type":"bytes32"}],"name":"indexOfAd","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"tokens","type":"uint256"},{"name":"pricePerToken","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]
const web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider(etherUrl));

// console.log(web3);

const Contract = web3.eth.contract(abi);
const instance = Contract.at("0x87F2F8809D7609b00145725f9A559c197A68c911");


app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());
app.get('/queryId', (req, res) => {
	// res.send(req.query.id);
	var name =req.query.name;
	var id = instance.indexOfAd.call(name)['c'][0];
	var Ad = instance.AdList.call(id);
	console.log(web3.toUtf8(Ad[1]));
});
app.listen(8545)



