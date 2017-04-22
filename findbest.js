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


var contractAddress = fs.readFileSync('/home/linnea/matchings/addressInfo.txt','utf8');
var contractABI = fs.readFileSync('/home/linnea/matchings/abi.txt','utf8');
var contract = web3.eth.contract(JSON.parse(contractABI));
var myContract = contract.at(contractAddress);
var workbook;
var sheet_name_list;
var node_exists = true;
var counter =0;


module.exports = function(callback) {};
createWorkBook();
getClientNumber();

function randomId(){
  //var worksheet = workbook.Sheets[sheet_name_list[sheet_number]];
  var worksheet = workbook.Sheets[sheet_name_list[0]];
  var range = worksheet['!ref'];
  var myRange = XLSX.utils.decode_range(range);
  var cellNumber=Math.floor(Math.random() * (myRange.e.r - 1 + 1)) + 1;
  var row = 'A'+cellNumber;
  var value = worksheet[row].v;
  return value;
}

function runTests(){
  var i=1;
  while(i>0){
    sendQuery();
    i--;
  }
}

function sendQuery(){
  //counter=0;
  var nodeIdToAskAbout=randomId();
  console.log("asking about node: " + nodeIdToAskAbout);
  myContract.askForMatch(nodeIdToAskAbout, 2000000, {from: web3.eth.accounts[0]});
}

function getClientNumber(){
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Which client are you running? ', (answer) => {
    setProv(answer);

    if (answer==1){
      sendQuery();
      //var listFull =myContract.matchesFull();
      //var h = myContract.askForMatch(randomId(), 2000000, {from: web3.eth.accounts[0]});
      //console.log("h: " + h);
      var matchAddedToList = myContract.matchAdded();
      //for(var j=0; j<3; j++){

        matchAddedToList.watch(function(err, result){
          //listFull.watch(function(err, result){
          console.log("This account has added a match: " + result.args.sender);
          counter++;
          console.log("counter: " + counter);
        //})}
        if (counter==2){
          counter=0;

        sendQuery()
      }
        //console.log("The list is full!");
        return;

        //matchAddedToList.stopWatching();
            })
        //listFull.stopWatching();
        //}
      }

      

      else {
        var matchRequested = myContract.query();
        matchRequested.watch(function(err, result) {
          if (err) {
            console.log(err)
            return;
          }
          else {

            console.log("Account: " + result.args.sender + " just asked about node: " + result.args.node);
            var list = matchingAlgo(result.args.node);
            var nr= myContract.addMatch(list[0], list[1], 2000000, {from: web3.eth.accounts[0]});
            //TODO: Is return correct in this context?
            return;
            //matchRequested.stopWatching();
          }
        });
      }
      rl.close();
    });
  }

  function setProv(cN){
    web3.setProvider(new web3.providers.HttpProvider(ports[cN-1]));
  }


  function createWorkBook(){
    if (typeof require !== 'undefined') XLSX = require('/usr/lib/node_modules/xlsx');
    workbook = XLSX.readFile('/home/linnea/matchings/out.ods');
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
    var answer2=0;

    if (answer1!=0){
      answer2=table(answer1, 1);
    }

    if (answer2!=0){
      console.log("answer 1: " + answer1 + " and answer 2: " + answer2);
      node_exists=true
      //var hej = myContract.addMatch(answer1, answer2, 2000000, {from: web3.eth.accounts[0]});
      var answers = [answer1, answer2];
      return answers;
    }

    else console.log("that node does not exist!");
  };

  function getInfo(){
    console.log("Length of the list of numbers: " + myContract.lengthOfMatchList.call());
  }
