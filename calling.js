const Web3 = require("/usr/lib/node_modules/web3");
const web3 = new Web3();
const fs = require('fs');
const readline = require('readline');
const ports=["http://localhost:8545",
"http://localhost:8546",
"http://localhost:8547",
"http://localhost:8548",
"http://localhost:8549",
"http://localhost:8550",
"http://localhost:8551",
"http://localhost:8552",
"http://localhost:8553",
"http://localhost:8554"];


var contractAddress = fs.readFileSync('/home/linnea/callback/addressInfo.txt','utf8');
var contractABI = fs.readFileSync('/home/linnea/callback/abi.txt','utf8');
var contract = web3.eth.contract(JSON.parse(contractABI));
var myContract = contract.at(contractAddress);
var workbook;
var sheet_name_list;
var node_exists = true;
var counter =0;
var logFile = '/home/linnea/callback/logFile.txt'
var args = process.argv.slice(2);


createWorkBook();
setProv(args[0]);
startProgram(args[0]);

function startProgram(clientNumber){
  if (clientNumber==1) asking();
  else process2();
}

function setProv(n){
  web3.setProvider(new web3.providers.HttpProvider(ports[n-1]));
}

function process2(){
  waiting();
}

function asking(){
  var ran = randomId();
  var hash = myContract.askForMatch(ran, 2000000,{from: web3.eth.accounts[0]});
  getAnswer();
}

function waiting(){
  var querySent = myContract.query();
  querySent.watch(function(err,res){
    console.log("Received request for node: " + res.args.node);
    var answers = matchingAlgo(res.args.node);
    var hash=myContract.addMatch(answers[0], answers[1], 200000,{from: web3.eth.accounts[0]})
    console.log("hash: " + hash);
    //querySent.stopWatching();
  });
}

function getAnswer(){
  var finished = myContract.answerFound();
  finished.watch(function (err,res){
    console.log("Answer:" + res.args.software);
    web3.eth.getBlock("latest", true, function(error, result){
      if(!error){
        console.log(result);
        fs.appendFileSync(logFile, '\n'+JSON.stringify(result.timestamp));
      }
      else
      console.error(error);
    })
    finished.stopWatching();
  });
}

function randomId(){
  var worksheet = workbook.Sheets[sheet_name_list[0]];
  var range = worksheet['!ref'];
  var myRange = XLSX.utils.decode_range(range);
  var cellNumber=Math.floor(Math.random() * (myRange.e.r - 1 + 1)) + 1;
  var row = 'A'+cellNumber;
  var value = worksheet[row].v;
  return value;
}

function createWorkBook(){
  if (typeof require !== 'undefined') XLSX = require('/usr/lib/node_modules/xlsx');
  workbook = XLSX.readFile('/home/linnea/callback/out.ods');
  sheet_name_list = workbook.SheetNames;
}

function table(id, sheet_number){
  //this needs to be hardcoded to avoid extra computations
  var worksheet = workbook.Sheets[sheet_name_list[sheet_number]];
  var range = worksheet['!ref'];
  var myRange = XLSX.utils.decode_range(range);
  var end = myRange.e.r;
  for(var i=1; i<=end; i++){
    var row = 'A'+i;
    var value = worksheet[row].v;
    if(value == id){
      console.log("value: " + value);
      return (worksheet['B'+i].v);
    }
  }
  return 0;
}

function matchingAlgo(number){
  var answer1 = table(number, 0);
  console.log("answer1:" + answer1);
  var answer2=0;

  if (answer1!=0){
    answer2=table(answer1, 1);
  }

  if (answer2!=0){
    console.log("answer 1: " + answer1 + " and answer 2: " + answer2);
    node_exists=true;
    var answers = [answer1, answer2];
    return answers;
  }
  else console.log("that node does not exist!");
};
