Number.prototype.toRad = function() {
  return this * Math.PI / 180;
}

GoogleMaps = (function(){

var residentMarkers = [];
var businessMarkers = [];
var you = 0;


function clearResidents(){
  for(var i=0; i < residentMarkers.length; i++){
    residentMarkers[i].setMap(null);
  }
}

function clearBusinesses(){
  for(var i=0; i < businessMarkers.length; i++){
    businessMarkers[i].setMap(null);
  }
}

function addResidentMarker(customer){
  
  var marker = new google.maps.Marker({
          position: {lat: customer['residence'][0], lng: customer['residence'][1]},
          map: map,
          title: customer.haircutTime.theTime+"\n"+customer.haircutTime.waitTol,
          icon:"http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|00FFFF"
      });
  residentMarkers.push( marker );
  customer.marker = marker;
   
}


function addBusinessMarker(business, isYou){
    
  var lat = business['lat'];
  var lng = business['lng'];
    
  var markerObj = {
      position: {lat: lat, lng: lng},
      map: map,
      title: business[0],
        icon:"http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FF765A"
    };
    
  if( isYou ){
      markerObj.zIndex= google.maps.Marker.MAX_ZINDEX + 1000;
      markerObj.icon = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|32CD32"
      
      you = [businessMarkers.length-1, markerObj];
      
  }
  var marker = new google.maps.Marker(markerObj);
    
  businessMarkers.push(marker);
  
}

function updateMarkerPaid(customer){
        customer.marker.setIcon("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FFA500");
        customer.marker.setZIndex( google.maps.Marker.MAX_ZINDEX + 1000);
        
}    
      
function calculateDistance(lat1, lon1, lat2, lon2) {
  var R = 6371000; // meters
  var dLat = (lat2 - lat1).toRad();
  var dLon = (lon2 - lon1).toRad(); 
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
          Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  var d = R * c;
  return d;
}
    
function isInRadiusAll(personObj){
      
      //get all of the competitors and get you 
      //and determine if the player is in your sphere
      // of influence or closer to a competitor
      
      //these are the data structures you need
      //businessLoc
      //competitorMarkers (array number should match businessLoc)
      //you [indexInBusinessLoc, marker]
      var youIndex = you[0];
      var youLat = businessLoc[youIndex][1];
      var youLng = businessLoc[youIndex][2];
      
      var distance = calculateDistance(youLat, youLng, personObj.lat, personObj.lng);
      var compWin = 0;
      
      for(var i = 0; i < businessLoc.length; i++){
        if(i== youIndex){
          continue;
        }
        var compDist = calculateDistance( businessLoc[i][1], businessLoc[i][2], personObj.lat, personObj.lng);
        if(compDist < distance){
          compWin = 1;
          break;
        }
      }
      
      return distance < 600 && !compWin;
}

function compare(a,b) {
  if (a.dist < b.dist)
    return -1;
  if (a.dist > b.dist)
    return 1;
  return 0;
}




function isInRadiusAllArray(personObj){
      
      //get all of the competitors and list them in a multidimensional array,
      //
      var lat = personObj.residence[0];
      var lng = personObj.residence[1];
      
      var theArray = [];
      
      app.businessList.each(function(item, index, collection){
        var dist = calculateDistance( item.get('lat'), item.get('lng'), lat, lng);
        theArray.push({
          id:index,
          dist:dist
        });
        
      })
      
      theArray.sort(compare);
      
      return theArray;
}
    
function isInRadius( firstObj, secondObj ){
      
      var radius = 100;
      //var firstObj = cell$('td').eq(index1).offset();
      //var secondObj = cell$('td').eq(index2).offset();
      
      var xc = firstObj.top;
      var yc = firstObj.left;
      
      var xp = secondObj.top;
      var yp = secondObj.left;
      
      var pointDistance =(Math.pow(xp-xc, 2) + Math.pow(yp-yc, 2)) ;
      
      //use pythagorean distance formula here
      return [( pointDistance <= Math.pow(radius,2) ), pointDistance];
      
}

return {
  addResidentMarker:addResidentMarker,
  clearResidents:clearResidents,
  clearBusinesses:clearBusinesses,
  addBusinessMarker:addBusinessMarker,
  updateMarkerPaid:updateMarkerPaid,
  isInRadiusAllArray:isInRadiusAllArray
  
  }
    
})();