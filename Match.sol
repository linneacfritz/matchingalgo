
pragma solidity ^0.4.9;

contract Match {

  struct Comp
  {
    uint hardware;
    uint software;
  }

  Comp[] matches;
  uint numberOfMatches;
  uint public nodeId;

  function Match() payable {
  }

  event query (address sender, uint node);
  event matchAdded (address sender, uint hardware, uint software);
  event matchesFull ();

  function askForMatch(uint n){
    nodeId=n;
    query(msg.sender, n);
    //Comp memory myComp = Comp (0,0);
    //matches[0]= myComp;
    //numberOfMatches=0;
  }

  function addMatch(uint h, uint s)
  {
    matches.push(Comp(h, s));
    matchAdded(msg.sender, h, s);
    //matches[numberOfMatches] = Comp(h, s);
    //numberOfMatches++;
    if (matches.length>9){
      matchesFull();
      //bubbleSort();
    }
  }

  function bubbleSort()
  {
    for (uint j=0; j<9; j++)
    {
      for (uint i = j; i<9; i++)
      {
        if (matches[i].software > matches[i+1].software)
        {
          swap(i, i+1);
        }
      }
    }
  }

  function swap(uint index1, uint index2)
  {
    Comp memory temp = matches[index1];
    matches[index1] = matches[index2];
    matches[index2] = temp;
  }

  function findBest(uint index, uint b) returns (uint){
    if (index >= matches.length-1){
      return b;
    }
    uint tracker=1;
    while (matches[index].software == matches[index+1].software){
      tracker++;
      index++;
    }
    if (tracker > b){
      findBest(index+1, tracker);
    }
    else {
      findBest(index+1, b);
    }
  }


  function getLast() constant returns (uint, uint){
    uint last=matches.length-1;
    return (matches[last].hardware, matches[last].software);
  }

  function getMatch(uint n) constant returns (uint, uint){
    return (matches[n].hardware, matches[n].software);
  }

  function getLengthOfMatches() constant returns (uint){
    return matches.length;
  }
}
