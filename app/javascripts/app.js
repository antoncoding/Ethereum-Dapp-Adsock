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
      // window.alert('Submitted')
    });
  });
}


window.register = function(){
  let minutes = $("#time-interval-minute").val();
  let hours = $("#time-interval-hour").val();
  let days = $("#time-interval-day").val();
  let in_second = 86400*days + 3600*hours + 60*minutes;
  let adID = $("#ad_id").val();
  $("#ad-msg").html("Register request has been submitted. Please wait.");
  
  Adseller.deployed().then(function(contractInstance) {
    contractInstance.register(in_second, {gas: 180000, from: getCurrentAccount()}).then(function() {
      $("#ad-msg").html("");
      // Update url seperately
      var new_url = $("#new-url").val();
        contractInstance.setHostWebUrl(new_url,{gas: 240000, from: getCurrentAccount()}).then(function(success) {
        if(success==true){window.alert("Successfully registered, please refresh the page!")}
    })
    })
  });
}

window.update = function(){
  let this_user = getCurrentAccount();
  Adseller.deployed().then(function(contractInstance) {
    contractInstance.gotoNext(this_user,{gas: 240000, from: getCurrentAccount()}).then(function(success) {
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
    
    contractInstance.registered.call(this_user).then(function(r) {
      if(r==true){
        $("#user-title").html("You have Already Login");
        $("#signup-div").html("<button>"+getCurrentAccount()+"</button>");

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
        contractInstance.nextAdContent.call(addr).then(function(nc){
           contractInstance.bidDueTime.call(addr).then(function(t){
              contractInstance.highestBid.call(addr).then(function(b){
                contractInstance.hostWebUrl.call(addr).then(function(cw){
                var date = new Date(t*1000);
                b = b/1000000000000000000;
                makeShort(nc, "nc_"+addr);
                makeShort(cw, "cw_"+addr);
                $("#ad-rows").append("<tr><td>"+addr+"</td><td id='cw_"+addr+"'>"+cw+"</td><td id='due_" 
                + addr + "'>" +date + "</td><td id='highest_" +addr+ "'>"+ b +"</td><td id='nc_" +addr+ "'></td></tr>");
            })
          })
        })
       })      
      }
    });
  });

  
  Adseller.deployed().then(function(contractInstance) {
    contractInstance.registered.call(this_user).then(function(v) {
      if(v==true){
        $("#title-msg-small").html('Dashboard');

        contractInstance.currentAdContent.call(this_user).then(function(c){
          var str_div = '<img style="max-height:200px" src="' + c + '" />'
          $("#owner_current_content").html(str_div);
        });
        contractInstance.highestBid.call(this_user).then(function(b){
          b = b/1000000000000000000;
          $("#owner_highest_bid").html(b);
        });
        contractInstance.nextAdContent.call(this_user).then(function(c){
          var str_div = '<img style="max-height:200px" src="' + c + '" />'
          $("#owner_next_content").html(str_div);
        });
        contractInstance.bidDueTime.call(this_user).then(function(time){
          var date = new Date(time*1000);
          $("#owner_due_time").html(date);
        });

        // Setting
        contractInstance._marginRatio.call(this_user).then(function(ratio){
          ratio = ratio/1;
          $('#owner_margin').html(ratio);
        });
        contractInstance.hostWebUrl.call(this_user).then(function(url){
          var url_link = '<a href="' + url + '">' + url + '</a>';
          $('#owner_web').html(url_link);
        });
        contractInstance.revenue.call(this_user).then(function(r){
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

function makeShort(longurl, id) 
{
    // console.log(longurl);
    var request = gapi.client.urlshortener.url.insert({
    'resource': {
      'longUrl': longurl
  }
    });

  var result = '';
    request.execute(function(response) 
  {
    
    if(response.id != null)
    {
      // alert(response.id);
      // let result = response.id;
      $("#"+id).html(response.id);
    }
    else
    {
      // alert('not converting');
      // let result = longurl;
      $("#"+id).html(longurl);
    }
    });
  return result;
 }

function getShortInfo()
{
var shortUrl=document.getElementById("shorturl").value;

    var request = gapi.client.urlshortener.url.get({
      'shortUrl': shortUrl,
  'projection':'FULL'
    });
    request.execute(function(response) 
  {
    
    if(response.longUrl!= null)
    {
      str ="<b>Long URL:</b>"+response.longUrl+"<br>";
      str +="<b>Create On:</b>"+response.created+"<br>";
      document.getElementById("output").innerHTML = str;
    }
    else
    {
      alert("error: unable to get URL information");
    }
  
    });

}
function load()
{
  gapi.client.setApiKey('AIzaSyAHAIWbhnlOgm2eUWQTn7Q8h8CWz6osJec'); //get your ownn Browser API KEY
  gapi.client.load('urlshortener', 'v1',function(){});

}
window.onload = load;

window.addEventListener('load', function() {
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source like Metamask")
    window.web3 = new Web3(web3.currentProvider);
    if (web3.currentProvider.isMetaMask === true) {
      console.warn("Using Metamask...");
      $('#metamask-warning').html('You are using Metamask right now.');
    }
    else {
      console.warn("No web3 detected. Falling back to http://localhost:8545.");
      $('#metamask-warning').html = 'No Metamask detected, fetching localhost:8545';
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

    }
  } 
  
  Adseller.setProvider(web3.currentProvider);
  $('#address-warning').html(getCurrentAccount())
  populateAds();
});