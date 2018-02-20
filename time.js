//timeObj



var timeIndex=[];     
var timeStruct = [ [9,10,11], [12,1,2,3,4,5] ];
   
var am_pm = "AM";
var minCounter = 0;
var hourCounter = 9;
var day = 0;  
var dayReal = 0;  
   
function makeTime(){
     var am_pm = getRandomInt(0,1);
     var hourRange = timeStruct[am_pm];
     am_pm= am_pm==1 ? "PM" : "AM";
     
     var hour = hourRange[getRandomInt(0,hourRange.length-1)];
     var minute = getRandomInt(0, 59);
     
     var theTime= hour+":"+pad(minute, 2)+" "+am_pm;
     
     if(!timeIndex[theTime]){
       timeIndex[theTime] =1;
     }else{
       timeIndex[theTime]++;
     }
     
     return {
       theTime:theTime,
       weight: timeIndex[theTime],
       waitTol:getRandomInt(0, 30)
     }
}

function addTime(time, addMinutes){
  var timeArray = time.split(' ');
  var am_pm = timeArray[1];
  timeArray = timeArray[0].split(":");
  var hour = parseInt(timeArray[0]);
  var min = parseInt(timeArray[1]);
  
  min += addMinutes;
  
  if(min > 59){
    min-=59;
    hour++;
    if(hour ==12){
      am_pm = "PM";
    }
    if(hour ==13){
      hour = 1;
    }
  }
  
  return hour+":"+pad(min, 2)+" "+am_pm;
}
     

function resetClock(){

  am_pm = "AM";
  minCounter = 0;
  hourCounter = 9;

  $("h2 .hour").html(hourCounter);
  $("h2 .minute").html(pad(minCounter, 2));
  $("h2 .am_pm").html(am_pm);
}

function endDay(time){
  $(window).trigger('endday', time);
}


function runTheDay(){
   
   minCounter ++;
  
  if( minCounter >59){
    hourCounter++;
    minCounter=0;
  }
  
  if(hourCounter == 12){
    am_pm="PM";
  }
  
  if(hourCounter > 12){
    hourCounter = 1;
  }
  
  var isEnd = 0;
  
  if(hourCounter == 6 && am_pm=="PM"){
  
    endDay("6:00 PM");
    //gamelog("\nRun a street marketing campaign?", ["y", "n"], runStreetCampaign);
    
    isEnd = 1;
    
  }

  $(window).trigger("theTime", [ day , hourCounter+":"+pad(minCounter, 2)+" "+am_pm]);
  
  
  if(isEnd){
    
    if(cow){
      clearInterval(cow);
      if(--cowCount && !reportDay(dayReal) ){
        startClock(cowCount);
      }else{
        $(window).trigger('showControls');
      }
      
    }
    
    return 0;
  }
  
  return 1;
}

function runDayWrap(){
  
  while(runTheDay()){
    //console.log('adsdsfadf')
  }
}

function startClock(count){
  
  dayInc();
        
  cowCount = count;
  cow = setInterval(runTheDay);
}

function dayInc(){
  day++;
  dayReal++;
  if(day>42) day=1;
  resetClock();
  $(window).trigger('dayChange');

}

function reportDay(day){
  if (day===0){
    return;
  }
  if(day%30===0){
    return 1; 
  }

}

function recursiveTimeout(count){
  
  dayInc();
  setTimeout(function(){
    runDayWrap();
    if(count && !reportDay(dayReal) ){
      
      recursiveTimeout(--count);
    
    }else{
      $(window).trigger('showControls');
    }
  
  },1)

}

var cowCount = 0;
var cow=null;
function dayRunStart(numOfDays, showTimes){
  
  cowCount = 0;
  cow=null;
  
  setTimeout(function(){
    if(showTimes){
      console.log('asdfasdfasd')
      startClock(numOfDays);
    }else{
      console.log('recurse')
      recursiveTimeout( numOfDays-1 )
      
    }
  },50);
}

    
