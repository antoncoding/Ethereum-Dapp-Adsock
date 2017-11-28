// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'


import Adseller_artifacts from '../../build/contracts/adseller.json'

var Adseller = contract(Adseller_artifacts);

let AddressList = [] 

let tokenPrice = null;

window.bidForAd = function(ad) {
  let AdId = $("#bid_for_adID").val();
  let content = $("#bid_content").val();


  Adseller.deployed().then(function(contractInstance) {
    let Tokens = $("#vote-tokens").val();
    contractInstance.bid(content, AdId, {value: web3.toWei(Tokens, 'ether'), gas: 500000, from: getCurrentAccount() }).then(function(success) {
      window.alert('Submitted')
    });
  });
}


window.register = function(){
  let adID = $("#ad_id").val();
  $("#ad-msg").html("Register request has been submitted. Please wait.");
  Adseller.deployed().then(function(contractInstance) {
    contractInstance.register({gas: 140000, from: getCurrentAccount()}).then(function() {
      $("#ad-msg").html("");
    })
  });
}

window.update = function(){
  let this_user = getCurrentAccount();
  Adseller.deployed().then(function(contractInstance) {
    contractInstance.gotoNext(this_user,{gas: 180000, from: getCurrentAccount()}).then(function(success) {
      if(success==true){window.alert("Success")}
    })
  });
}

window.changeWeb = function(){
  Adseller.deployed().then(function(contractInstance) {
    var new_url = $("#new-url").val();
    contractInstance.setHostWebUrl(new_url,{gas: 140000, from: getCurrentAccount()}).then(function(success) {
      if(success==true){window.alert("Success")}
    })
  });
}

window.changeRatio = function(){
  Adseller.deployed().then(function(contractInstance) {
    var new_ratio = $("#new-margin-ratio").val();
    contractInstance.setRatio(new_ratio,{gas: 160000, from: getCurrentAccount()}).then(function(success) {
      if(success==true){window.alert("Success")}
    })
  });
}

window.Withdraw = function(){
  Adseller.deployed().then(function(contractInstance) {
    contractInstance.collect({gas: 140000, from: getCurrentAccount()}).then(function(success) {
      if(success==true){window.alert("Withdraw Success")}
    })
  });
}


window.lookupVoterInfo = function() {
  let address = $("#voter-info").val();
  Adseller.deployed().then(function(contractInstance) {
    contractInstance.voterDetails.call(address).then(function(v) {
      $("#tokens-bought").html("Total Tokens bought: " + v[0].toString());
      let involvedAds = v[1];
      $("#votes-cast").empty();
      $("#votes-cast").append("Bid records:<br>");
      for(let i=0; i < involvedAds.length; i++) {
        $("#votes-cast").append(web3.toUtf8(involvedAds[i]) + "<br>");
      }
    });
  });
}

function populateAds() {
  let this_user = getCurrentAccount();
  Adseller.deployed().then(function(contractInstance) {
    
    // check is registered
    contractInstance.get_registered.call(this_user).then(function(r) {
      if(r==true){
        $("#user-title").html("You have Already Login");
        $("#register_button_div").html(""); 
      }
      else{
        $("#dashboard-tables").html("");
      }
    })



    contractInstance.get_ad_id_list.call().then(function(address_list){
      AddressList = address_list;
      AddressList = AddressList.filter( onlyUnique );

      for(var i=0; i< AddressList.length; i++){
        let addr = AddressList[i];
        // recall hell
        contractInstance.get_nextAdContent.call(addr).then(function(nc){
           contractInstance.get_bid_due_time.call(addr).then(function(t){
              contractInstance.get_highestBid.call(addr).then(function(b){
                contractInstance.get_currentAdContent.call(addr).then(function(cc){
                var date = new Date(t*1000);
                b = b/1000000000000000000;
                $("#ad-rows").append("<tr><td>"+addr+"</td><td id='cc_"+addr+"'>"+cc+"</td><td id='due_" 
                + addr + "'>" +date + "</td><td id='highest_" +addr+ "'>"+ b +"</td><td id='nc_" +addr+ "'>"+nc+"</td></tr>");
            })
          })
        })
       })      
      }
    });
  });

  

  Adseller.deployed().then(function(contractInstance) {
    contractInstance.get_registered.call(this_user).then(function(v) {
      if(v==true){
        $("#title-msg-small").html('Dashboard');

        // get all the setting and dashboard info:
        // Dashboard First:
        contractInstance.get_currentAdContent.call(this_user).then(function(c){
          $("#owner_current_content").html(c);
        });
        contractInstance.get_highestBid.call(this_user).then(function(b){
          b = b/1000000000000000000;
          $("#owner_highest_bid").html(b);
        });
        contractInstance.get_nextAdContent.call(this_user).then(function(c){

          $("#owner_next_content").html(c);
        });
        contractInstance.get_bid_due_time.call(this_user).then(function(time){
          var date = new Date(time*1000);
          $("#owner_due_time").html(date);
        });


        // Setting
        contractInstance.get_marginRatio.call(this_user).then(function(ratio){
          ratio = ratio/1;
          $('#owner_margin').html(ratio);
        });
        contractInstance.get_host_web_url.call(this_user).then(function(url){
          $('#owner_web').html(url);
        });
        contractInstance.get_revenue.call(this_user).then(function(r){
          //window.alert(r);
          r = r/1000000000000000000;
          $("#owner_revenue").html(r);
        });
      }
    });
  });

}
function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}


function getCurrentAccount(){
  var account = web3.eth.accounts[0];
  var accountInterval = setInterval(function() {
    if (web3.eth.accounts[0] !== account) {
      account = web3.eth.accounts[0];
    }
  }, 100);
  return account;
}

window.addEventListener('load', function() {
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source like Metamask")
    window.web3 = new Web3(web3.currentProvider);
    if (web3.currentProvider.isMetaMask === true) {
      console.warn("Using Metamask...");
    }
    else {
      console.warn("No web3 detected. Falling back to http://localhost:8545.");
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
  } 
  
  Adseller.setProvider(web3.currentProvider);
  populateAds();
});