pragma solidity ^0.4.15;

contract adseller {
    address public owner;
    address[] public registered_address_list;

    mapping (address => uint256) public bidDueTime;
    mapping (address => uint) public marginRatio;
    mapping (address => uint) public _marginRatio;
    mapping (address => uint) public timeInterval;
    mapping (address => string) public hostWebUrl;
    mapping (address => uint) public counter;

    mapping (address => string) public currentAdContent;
    mapping (address => address) public currentAdOwner;
    mapping (address => uint256) public currentAdValue;

    mapping (address => string)  public nextAdContent;
    mapping (address => address) public nextAdOwner;
    mapping (address => uint256) public highestBid;

    mapping (address => uint256) public revenue;
    mapping (address => bool) public registered;
    
    function adseller(){
        owner=msg.sender;
    }
    
    function register(uint256 _timeInterval){
        timeInterval[msg.sender] = _timeInterval;
        if(!registered[msg.sender]){
            bidDueTime[msg.sender] = now + _timeInterval;
            registered_address_list.push(msg.sender);
        }
        registered[msg.sender] = true;
    }
    
    function gotoNext(address ad_id) returns(bool success){
        if(bidDueTime[ad_id] > now){
            return false;
        }
        else{
            bidDueTime[ad_id] = now + timeInterval[ad_id];
            address redeemaddress = currentAdOwner[ad_id];
            uint256 redeemvalue = marginRatio[ad_id]*currentAdValue[ad_id]/(marginRatio[ad_id]+1);
            uint256 revenue_value = currentAdValue[ad_id] - redeemvalue;
            currentAdValue[ad_id] = highestBid[ad_id];
            currentAdContent[ad_id] = nextAdContent[ad_id];
            currentAdOwner[ad_id] = nextAdOwner[ad_id];
            nextAdContent[ad_id] = "https://i.supload.com/H1eiRgO8ZM.png";
            nextAdOwner[ad_id] = 0x0;
            highestBid[ad_id] = 0;
            marginRatio[ad_id] = _marginRatio[ad_id];
            counter[ad_id]+=1;

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
        
        revenue[ad_id] += revenue_value;
        
        return true;
    }
    
    function collect() returns(bool success){
        uint256 _revenue = revenue[msg.sender];
        revenue[msg.sender] = 0;
        //uint256 fee = _revenue/50;
        //_revenue -= fee
        //revenue[owner] += fee;
        msg.sender.transfer(_revenue);
        return true;
    }
    
    function setRatio(uint newRatio) returns(bool success){
        _marginRatio[msg.sender] = newRatio;
        return true;
    }

    function setHostWebUrl(string mainweburl) returns(bool success){
        hostWebUrl[msg.sender] = mainweburl;
        return true;
    }

    function get_ad_id_list() returns (address[] address_list){
        return registered_address_list;
    }
}