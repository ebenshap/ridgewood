class LostCustomers{

  constructor( lostCustomers ){
  
    this.lostCustomers = lostCustomers ;
  
    this.costPerLead = 50;
    
    var that = this;
    $(window).on("dayChange", function(){
      
      var customerLength = that.lostCustomers.length;
      
      var lostCustomers = [];
      var toBeAssigned = [];
      for(var i = 0; i< customerLength; i++){
        var temp = that.lostCustomers[i];
        
        if(day == temp.haircutDay){
          
          toBeAssigned.push(temp);
          
        }else{
          
          lostCustomers.push(temp);
          
        }
        
      }
      that.lostCustomers = lostCustomers;
      
      
      var toBeAssignedLength = toBeAssigned.length;
      for(var i = 0; i< toBeAssignedLength; i++){
        //$10 per lead
        var leadWon = 0;
        
        app.businessList.each(function(item){
          if(leadWon) return;
          
          var money = item.get('marketingMoney');
          console.log(that.costPerLead)
          if(money >= that.costPerLead){
            leadWon = item.bizObj.buyLead(toBeAssigned[i], that.costPerLead);
            console.log(leadWon)
            if(leadWon){
              money = money - that.costPerLead;
              item.set('marketingMoney', money );
            }
          }
        });
        
        //or go to the closest business
        if(!leadWon){
          var closestBiz = toBeAssigned[i].bizByDist[0].id;
          var closestBizObj = app.businessList.at(closestBiz);
          
          closestBizObj.bizObj.buyLead(toBeAssigned[i], 0);
          console.log(closestBizObj);
        }
        leadWon = 0;
      }
    
    });
  }

}