//http://www.loopnet.com/Listing/44-56-Franklin-Ave-Ridgewood-NJ/6270191/
//$25.00 /SF/Yr
//Space Available	2,136 SF
//$4450

class Business{

  constructor( model, name, numOfEmps, priceOfHaircut, lat, lng){
    // 

    //haircut business logic
    
    
    this.barbers = [];
    for(var i=0; i< numOfEmps; i++){
      this.barbers.push(null);
    }
    this.waitQueue = [];


    var rentPerSqFt = 2;
    var sqFtPer4Emps = 750;
    
    this.model = model;
    
    this.numOfEmps = numOfEmps;
    this.priceOfHaircut = priceOfHaircut;
    this.name = name;
    this.lat = lat;
    this.lng = lng;
    this.avgWage = 20000;
    
    var isHighEnd = 0
    if(priceOfHaircut > 30){
      isHighEnd++;
      this.avgWage = 30000;
    }
    if(priceOfHaircut > 60){
      isHighEnd++;
      this.avgWage = 40000;
    }
    
      
    if (numOfEmps <= 4 ){
      numOfEmps=4;
    } 
    
    this.isHighEnd = isHighEnd;
    this.theRent = ((Math.floor(numOfEmps/4)+ ( numOfEmps%4 ? 1 : 0 )) * sqFtPer4Emps) * (rentPerSqFt+isHighEnd);
    
    this.monthlyMin = Math.round( (this.avgWage/12)*this.numOfEmps+this.theRent );
    
    this.monthlyHaircutsMin = Math.round( this.monthlyMin/this.priceOfHaircut );
    this.monthlyHaircutsPerEmpMin = Math.round( this.monthlyHaircutsMin/this.numOfEmps );
    this.customerBaseMin = Math.round(this.monthlyHaircutsMin +(this.monthlyHaircutsMin /2));

    this.monthProfits = 0;
    this.monthProfitsStore = [0];
    
    
    console.log(this.customerBaseMin)
    
    var that = this;
    $(window).on("theTime", function(e, day, time){      
      that.checkPeople(day, time, that.customers);
    });
    
    $(window).on("endday", function(e, time){      
      that.endday(time);
    });
    
  }
  
  assignCustomerBases(population){
    
    this.customers = population.splice(0, this.customerBaseMin);
    console.log(this.customers.length)
  }
  
  
  
  addMoney(num){
  
    num = parseInt(num);
    var money = this.model.get('totalMoney');
  
    this.model.set('totalMoney', num+money);

    this.monthProfits += num;
  }
  
  subtractMoney(num){
  
    num = parseInt(num);
    var money = this.model.get('totalMoney');
    //if(num <= money ){
      this.model.set('totalMoney', money - num);
      return 1;
    //}
  
    //return 0;
  }

  getAvailableBarber(){
  
    var barber = '';
    for( var i =0; i < this.barbers.length; i++ ){
      if(this.barbers[i]===null){
        barber = i;
        break;
      }
      
    }
  
    return barber;
  }
  
  isStillWorking(){
    
    var stillWorking = 0;
    this.barbers.forEach(function(element){
      if(element !==null ){
        stillWorking++;
      }
    });
    
    return stillWorking;
  }
  
  finishWork(time){
  
    var that = this;
    
    this.barbers.forEach(function(element, index){
      if(element !==null ){
        
        that.gamelog(time+" , Customer "+element+" is finshed and paid.");
        
        that.model.set('customerJustPaid', element );
        that.model.set('customersServiced', that.model.get('customersServiced') + 1 );
      
        that.addMoney(that.model.get('costOfHaircut'));
        that.barbers[index] = null;
       
        if(that.customers[element].isSneezer){ 
          that.model.comments.add({
            id:element,
            "comment":'I had a really good hair cut.'
          })
        }
      
        that.waitQueue=[];
        
      }
    });
  }
  
  giveHaircut(index, time, customers){
      var msg = "";
      
      var barber = this.getAvailableBarber();
      if(barber !== ""){
        this.barbers[barber] = index;
        
        this.customers[index].finishTime = addTime(time, 15);
        
        msg = "and is getting a haircut";
      }else{
        this.waitQueue.push(index);
        msg = "and is in the waiting line";
        this.customers[index].haircutTime.waitTolTime = addTime(
        time, this.customers[index].haircutTime.waitTol);
      }
      return msg;
  }
  
  checkHaircutFinished(day, time, customers){
     
    var that = this; 
     
    this.barbers.forEach(function(element, index){
      
      if(element!==null && customers[element].finishTime== time){
        
        that.gamelog(time+" , Customer "+element+" is finshed and paid.");
        
        //update the serviced
        that.model.set('customerJustPaid', element );
        that.model.set('customersServiced', that.model.get('customersServiced') + 1 );
        
        
        that.addMoney( that.model.get('costOfHaircut') );

        if(that.customers[element].isSneezer){ 
          that.model.comments.add({
            "id":element,
            "comment":'I had a really good hair cut.'
          })
        }
        
        that.barbers[index] = null;
        
        if(that.waitQueue.length){
          that.gamelog(time+" , Customer "+element+ that.giveHaircut(that.waitQueue.shift(), time, customers) );
        }
      
      }
    
    }); 
      
  }
  
  checkPeople(day, time){
  
    var customers = this.customers;
    
      for(var index in customers){
      
        //if it's person's time to go to store
        if(customers[index].haircutDay == day && 
        customers[index].haircutTime.theTime == time
         /* && isInRadiusAll(population[index])*/
        ){
          
          
          //is person in your radius of influence?
          
          //how about your competitors?
          var msg = this.giveHaircut(index, time, customers);
          this.gamelog(time+", Customer "+index+" has entered the store "+msg);
                  
        }
      }
      this.checkHaircutFinished(day, time, customers);
      this.checkWaitTolerance(time, customers);
  }
  
  checkWaitTolerance(time, customers){
      if(this.waitQueue.length){
        
        var waitQueue = this.waitQueue;
        var that = this;
        
        $.each(waitQueue, function(index, item){
          
          if(item && customers[item].haircutTime.waitTolTime == time ){
            
            waitQueue.splice(index,1);
            that.gamelog(time+", Customer "+item+" has left the salon");
            
            that.model.set('customersLost', that.model.get('customersLost') + 1 );
          }
        })
      }
  }

  endMonthActions(){
    
    this.monthProfitsStore.push(this.monthProfits);
    this.monthProfits = 0;

    this.subtractMoney(this.monthlyMin);
  }
  
  gamelog(msg, options, cb){
    this.model.set('gamelog', msg);
  }
  
  
  endday(time){
    this.finishWork(time);
  }
  
  
  buyLead(lead, money){
    
    var didBuy = 0;
    if(this.subtractMoney(money)){
      didBuy=1;
    }
    
    this.customers.push(lead);
    
    return didBuy;
  }

}
