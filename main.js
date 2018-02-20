//If your displacements aren't too great (less than a few kilometers) and you're not right
//at the poles, use the quick and dirty estimate that 111,111 meters (111.111 km) in 
//the y direction is 1 degree (of latitude) and 111,111 * cos(latitude) meters in the x 
//direction is 1 degree (of longitude).

var mapInit = 0;

function initMap() {
        
  mapInit = 1;
        
  var myLatLng = {lat: 40.98, lng: -74.115};
        
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: myLatLng
  });
  
  getData();

}

  
function getData(){

  $(document).ready(function() {
  
    $.ajax({
      type: "GET",
      url: "businessPlaceDetailInfo2-final.csv",
      dataType: "text"
        //success: function(data) {processData2(data);}
    }).then(function(businessInfo){
      //console.log(hello)
      $.ajax({
        type: "GET",
        url: "ridgewoodWithCoordinates.csv",
        dataType: "text"
        //success: function(data) {processData(data);}
      }).then(function(residentInfo){
        //console.log(hello2)
        //console.log(hello)
        processData(businessInfo, residentInfo)
       
      }); 
    });
  
  });

}
//split up the text and then send it off to be rendered

var businessInfoArray, residentInfoArray;
var residentLoc = [], businessLoc = [];


app = {}; // create namespace for our app
app.Business = Backbone.Model.extend({
  defaults: {
    name: '',
    lat:'',
    lng:'',
    isYou:0,
    customersLost:0,
    costOfHaircut:0,
    customersServiced:0,
    expensesToPay:0,
    customersWaiting:0,
    totalMoney:0,
    marketingMoney:0,
    customerJustPaid:null
    
  },
  initialize:function(){
    
    this.bizObj= new Business(
    this,
    this.get('name'), 
    this.get('numOfEmps'), 
    this.get('costOfHaircut'), 
    this.get('lat'), 
    this.get('lng')) ;
    
    this.comments = new app.CommentCollection();
    
    if( !this.get('isYou') ){
      this.bizObj.assignCustomerBases(customers);
    }else{
      this.bizObj.customers=[];
    }
      
  }
});

app.Comment = Backbone.Model.extend({
  comment:'',
  id:null
})

app.CommentCollection = Backbone.Collection.extend({
  model: app.Comment
});

app.BusinessList = Backbone.Collection.extend({
  model: app.Business
  
});


// instance of the Collection
//is interacted with when new todo items are created
app.businessList = new app.BusinessList();
console.log(app.businessList)
  
////////////////

// set this to listen to the changes in particular
app.BusinessHud = Backbone.View.extend({
  el: '#hud',
  events: {
        "change #businessDropdown": "businessSelected",
        "change #showTimes": "showTimeConfig"
    
    },
  initialize:function(bizCollection, bizIndex){
    
    var dropDown = this.$el.find('#businessDropdown');
   
    
    this.bizCollection = bizCollection;
    
    this.showTimes = false;
    
    /*
    $(window).on('paid', function(e, index){
      that.updateMarkerPaid(index, that.biz.bizObj.customers);
    })*/
    
    var html = '';
    
    
    bizCollection.each(function(model, index, list){
      
      var bizNameTemp = model.get('name');
      if(model.get('isYou')){
        bizNameTemp += " -- You";
      }
    
      html += '<option value="'+ index +'" >'+bizNameTemp+'</option>';
    });
    
    dropDown.html(html);
    dropDown.val(bizIndex);
    
    this.changeBusiness(bizIndex);
    var that = this;
    
    this.$el.find('[id*=start]').click(function(e){
      
      
      var money = parseInt($('#marketingCost').val() );
      if(isNaN(money)) money = 0;
      
      that.biz.set('marketingMoney', money)
      
      var daysToRun = parseInt($(e.target).attr('id').split('-').pop() );
      if(isNaN(daysToRun)) daysToRun = 1;
      
      //if(day < 30){
      //resetClock();
      //startClock(daysToRun, that.showTimes);
      $("#dayControls").css("visibility", "hidden");
      dayRunStart(daysToRun, that.showTimes);
         
      //} 
    });
    
    $(window).on("endday", function(){
      that.dayRunning = 0;
      that.render();
    });
    
    $(window).on("dayChange", function(){
      
      console.log(day)
      that.dayRunning = 1;
      
      that.$el.find('#day').html(dayReal);
      that.gamelog("\nDay "+(dayReal)+"\n~~~~~~~~~~~~~~", 1);
      
      if(that.showTimes){
        that.highlightTheDay(day, that.biz.bizObj.customers);
      }
    })
    
    $(window).on("theTime", function(){
      if(that.showTimes){
        $("h2 .hour").html(hourCounter);
        $("h2 .minute").html(pad(minCounter, 2));
        $("h2 .am_pm").html(am_pm);
      }
    });
    
    
    $(window).on("showControls", function(){
    
     if(reportDay(dayReal)){

       app.businessList.each(function(item, index, collection){

         item.bizObj.endMonthActions();

       });

       that.monthlyReport(); 
       reportModal.open();
       
     }
    
     $("#dayControls").css("visibility", "visible");
     
    });
    
    this.biz.on('change:marketingMoney', this.updateMarketingMoney, this);
    
   
  },
  
  monthlyReport:function(){
  
    var facilities_available = this.biz.get('numOfEmps');
    var average_cost_per_service = this.biz.get('costOfHaircut');
    var daily_hours_of_operation = 8;
    var days_open_per_month = 30;

    var gross_service_sales = this.biz.bizObj.monthProfitsStore[this.biz.bizObj.monthProfitsStore.length-1];
     
    
    var total_1 = facilities_available * daily_hours_of_operation;
    var total_2 = total_1 * days_open_per_month;
 
    var total_4 = total_2 * average_cost_per_service;
    
    var final_total = (gross_service_sales/total_4 * 100).toFixed(0);
     console.log(this.biz)
    
    var reportString = "You were open "+days_open_per_month+" days this month, "+daily_hours_of_operation+" hours a day. With "+facilities_available+" stylists.<br>";
    reportString += "The store brought in a gross sale of $"+gross_service_sales+"<br>";
    reportString += "Making your Occupancy Rate: %"+final_total;
    reportString += "<br><br>";
    reportString += "After expenses, $"+ this.biz.bizObj.monthlyMin +", you have $"+ this.biz.get('totalMoney');

    reportModal.$wrapper.find('p').html(reportString);
    
  },
  
  showTimeConfig:function(evt){
    var val = $(evt.target).is(':checked');
    
    this.showTimes = val;
    //this.showTimes = ( val == 'true');;
  },
  
  businessSelected: function(evt){
    
    var val = $(evt.target).val();
    this.changeBusiness(val);
//    businessDropdown
  },
  
  changeBusiness:function(val){
    this.maprender(val);
    this.render(val);
    
    if(this.biz){
      this.biz.off('change:customersServiced');
      this.biz.off('change:customersLost');
      this.biz.off('change:totalMoney');
      this.biz.off('change:gamelog');
    }
    
    this.biz = this.bizCollection.at(val);
    this.biz.on('change:customersServiced', this.updateCustomerService, this);
    this.biz.on('change:customersLost', this.updateCustomerLost, this);
    this.biz.on('change:totalMoney', this.updateTotalMoney, this);
    this.biz.on('change:gamelog', this.updateGamelog, this);
    
  },
  
  updateMarketingMoney:function(){
    this.$el.find('#marketingCost').val(this.biz.get('marketingMoney'))
  },
  updateCustomerService:function(){
  
    if(!this.showTimes && this.dayRunning) return;
    this.$el.find('.c-serviced span').html(this.biz.get('customersServiced'));
    this.updateMarkerPaid(this.biz.get('customerJustPaid'), this.biz.bizObj.customers);
    this.$el.find('#customerBase span').html( this.biz.bizObj.customers.length);
  },
  
  updateCustomerLost:function(){
    if(!this.showTimes && this.dayRunning) return;
    this.$el.find('.c-lost span').html(this.biz.get('customersLost'))
  },
  
  updateTotalMoney:function(){
    if(!this.showTimes && this.dayRunning) return;
    this.$el.find('.total-money span').html(this.biz.get('totalMoney'))
  },
  
  updateGamelog:function(){
    if(!this.showTimes && this.dayRunning) return;
    this.gamelog(this.biz.get('gamelog'))
  },
  
  updateMarkerPaid:function(index, customers){
    if(!this.showTimes && this.dayRunning) return;
    GoogleMaps.updateMarkerPaid( customers[index] );
  },
  
  maprender:function(youIndex){
  
    var isYou = 0;
    GoogleMaps.clearBusinesses();
    this.bizCollection.each(function(model, index, list){
      if( index == youIndex ){
        isYou = 1;
      }
      GoogleMaps.addBusinessMarker(model.bizObj, isYou);
      isYou = 0;
    })
  },
  
  render: function(val){
    
    var biz = this.biz;
    if(val || val===0){
      biz = this.bizCollection.at(val);
    }
    
    this.$el.find('#price-per-haircut span').html(biz.get('costOfHaircut'));
    
    this.$el.find('#employee-num span').html(biz.get('numOfEmps'));
    
    this.$el.find('.total-money span').html(biz.get('totalMoney'));
    
    this.$el.find('.c-serviced span').html(biz.get('customersServiced'));
    this.$el.find('.c-lost span').html(biz.get('customersLost'));
    
    
    this.$el.find('.costPerLead').html( lostCustomers.costPerLead );
    
    this.$el.find('#expenses span').html( biz.bizObj.monthlyMin)
    
    this.$el.find('#minCustomerBase span').html( biz.bizObj.customerBaseMin)
    
    this.$el.find('#customerBase span').html( biz.bizObj.customers.length);
    
  },
  
  highlightTheDay: function(theDay, customers){
  
    GoogleMaps.clearResidents();
  
    for(i=0; i < customers.length; i++){
    
      if(customers[i].haircutDay == theDay){
      
        GoogleMaps.addResidentMarker(customers[i]);
      
      }
    }
  },
  
  gamelog: function(msg, override){
      
    if(!this.showTimes && !override) return;  
      
    $("textarea").val( $("textarea")
    .val() +"\n"+msg ).scrollTop($("textarea")[0]
    .scrollHeight);
      
  }
  
  
});

function processData(businessInfo, residentInfo) {
  
  businessInfoArray = businessInfo.split(/\n/);
  residentInfoArray = residentInfo.split(/\n/);
     
  for(item in residentInfoArray){
    
    residentInfoArray[item] = residentInfoArray[item].split(/,/);
    lng = parseFloat(residentInfoArray[item].pop());
    lat = parseFloat(residentInfoArray[item].pop());
      
    residentLoc.push([lat, lng]);
          
  }
  

  var residenceTotal = 25500;
  pop = new Population(residenceTotal);
  pop.assignResidence(residentLoc);
  
  var name, lng, lat, numOfEmps, approxNumOfEmps, price;
  
  var totalCustomers = 0;
  
  
  customers = shuffle(pop.population.slice(0));

  var tenPercent = Math.floor(residenceTotal/10);
  var tenCount = 0;
  _.each(customers, function(item, index, collection){
    if(tenCount < tenPercent){
      item.isSneezer=1;
    }

    tenCount++;
  });

  customers = shuffle(customers);

  console.log(customers);
  
  lostCustomers = new LostCustomers(customers.splice(0, 200));
  
  var you = 0;
  
  var bizCount = 0;
  for(item in businessInfoArray){
      
    businessInfoArray[item] = businessInfoArray[item].split(/,/);
    
    name = businessInfoArray[item][0];
    
    price = Math.floor(parseFloat(businessInfoArray[item][2]));
    
    lat = parseFloat(businessInfoArray[item][4]);
    lng = parseFloat(businessInfoArray[item][5]);
    numOfEmps = parseInt(businessInfoArray[item][6]);
    approxNumOfEmps = parseInt(businessInfoArray[item][7]);
    
    numOfEmps = numOfEmps || approxNumOfEmps;
    
    console.log(name+': '+numOfEmps)
    
    if(!numOfEmps) continue;
    
    if(you == bizCount){
      app.businessList.add({
      
        name: name,
        numOfEmps:2,
        costOfHaircut:price,
        lat:lat,
        lng:lng,
        isYou:1,
        totalMoney:200
      
      });
    
    }else{
      app.businessList.add({
      
        name: name,
        numOfEmps:numOfEmps,
        costOfHaircut:price,
        lat:lat,
        lng:lng
      
      });
    }
    
    bizCount++;
    
  }

  businessHud = new app.BusinessHud(app.businessList, you);
  
  for(item in pop.population){
    var tempPerson = pop.population[item];
    tempPerson.bizByDist = GoogleMaps.isInRadiusAllArray(tempPerson);
  }
  console.log(pop.population)

  new views.Comments({
    collection:app.businessList.at(you).comments
  })

 
}

