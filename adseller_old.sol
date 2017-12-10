pragma solidity ^0.4.15;

contract adseller {
    address private owner;

    address[] public registered_address_list;

    mapping (address => uint256) public bidDueTime;
    mapping (address => uint) public marginRatio;

    mapping (address => string) public hostWebUrl;

    mapping (address => string) public currentAdContent;
    mapping (address => string) public currentWebpage;
    mapping (address => address) public currentAdOwner;
    mapping (address => uint256) private currentAdValue;
    
    mapping (address => string)  private nextAdContent;
    mapping (address => string)  private nextWebpage;
    mapping (address => address) private nextAdOwner;
    mapping (address => uint256) public highestBid;

    mapping (address => uint256) public revenue;
    mapping (address => bool) public registered;
    
    function adseller(){
        owner=msg.sender;
    }
    
    function register(){
        if(registered[this_user]==true) revert();
        
        address this_user = msg.sender;
        // Change duration to 5 minutes for demo
        bidDueTime[this_user] = now + 5 minutes;
        registered[this_user] = true;
        registered_address_list.push(this_user);
    }
    
    function gotoNext(address ad_id) returns(bool success){
        if(bidDueTime[ad_id] > now){
            return false;
        }
        else{
            bidDueTime[ad_id] = now + 5 minutes;
            address redeemaddress = currentAdOwner[ad_id];
            uint256 redeemvalue = marginRatio[ad_id]*currentAdValue[ad_id]/(marginRatio[ad_id]+1);
            uint256 revenue_value = currentAdValue[ad_id] - redeemvalue;
            
            // Update current Values
            currentAdValue[ad_id] = highestBid[ad_id];
            currentAdContent[ad_id] = nextAdContent[ad_id];
            currentAdOwner[ad_id] = nextAdOwner[ad_id];
            currentWebpage[ad_id] = nextWebpage[ad_id];

            nextAdContent[ad_id] = "https://i.supload.com/H1eiRgO8ZM.png";
            nextWebpage[ad_id] = "-";
            nextAdOwner[ad_id] = 0x0;
            highestBid[ad_id] = 0;
            
            revenue[ad_id] += revenue_value;
            redeemaddress.transfer(redeemvalue);
            return true;
        }
    }
    
    function bid(string ad_content, address ad_id) payable returns(bool success){
        require(registered[ad_id]==true);
        if(bidDueTime[ad_id] < now){
            gotoNext(ad_id);
        }
        if(msg.value*105<=100*highestBid[ad_id]){
            revert();
            return false;
        }
        else{
            address redeemaddress = nextAdOwner[ad_id];
            uint256 redeemvalue = highestBid[ad_id];
            nextAdContent[ad_id] = ad_content;
            nextAdOwner[ad_id] = msg.sender;
            highestBid[ad_id] = msg.value;

            if(redeemaddress!=0x0)
                redeemaddress.transfer(redeemvalue);
            return true;
        }
    }
    
    function judge(address ad_id) returns(bool success){
        require(msg.sender==owner);
        
        uint256 revenue_value = currentAdValue[ad_id];
        currentAdValue[ad_id] = 0;
        currentAdContent[ad_id] = "-";
        currentAdOwner[ad_id] = 0x0;
        currentWebpage[ad_id] = "-";
        
        revenue[ad_id] += revenue_value;
        
        return true;
    }
    
    function collect() returns(bool success){
        revenue[msg.sender] = 0;
        msg.sender.transfer(revenue[msg.sender]);
        return true;
    }
    
    function setRatio(uint newRatio) returns(bool success){
        marginRatio[msg.sender] = newRatio;
        return true;
    }
    
    // set and get the url of the ad hosting site 
    function setHostWebUrl(string mainweburl) returns(bool success){
        hostWebUrl[msg.sender] = mainweburl;
        return true;
    }
    function get_host_web_url(address id) returns(string url){
        return hostWebUrl[id];
    }


    function get_ad_id_list() returns (address[] address_list){
        return registered_address_list;
    }

    function get_bid_due_time(address id) returns(uint256 t) {
        return bidDueTime[id];
    }
    function get_currentAdValue(address id) returns(uint256 v) {
        return currentAdValue[id];
    }
    
    function get_currentWebpage(address id) returns(string w) {
        return currentWebpage[id];
    }

    function get_marginRatio(address id) returns(uint r){
        return marginRatio[id];
    }
    function get_currentAdContent(address id) returns(string content){
        return currentAdContent[id];
    }
    function get_highestBid(address id) returns(uint256 b){
        return highestBid[id];
    }
    function get_revenue(address id) returns(uint256 r){
        return revenue[id];
    }
    function get_registered(address id) returns(bool r){
        return registered[id];
    }
    function get_currentAdOwner(address id) returns(address adowner){
        return currentAdOwner[id];
    }
    
    // needed private
    function get_nextAdContent(address id) returns(string content){
        return nextAdContent[id];
    }
    
    // function get_nextWebpage(address id) returns(string w){
    //     return nextWebpage[id];
    // }
    // private
    function get_nextAdOwner(address id) returns(address adowner){
        return nextAdOwner[id];
    }

}

