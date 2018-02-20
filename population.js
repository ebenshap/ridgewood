var haircutDay = 1;
class Person{

  constructor(gender, age, isSneezer){
    this.gender = gender;
    this.age = age;
    this.haircutTime = makeTime();
    this.haircutDay = haircutDay;

    this.isSneezer = isSneezer;
    
    haircutDay++;
    if(haircutDay > 42){
      haircutDay=1;
    }
  }
}


class Population{

  splitGender(popNum){
    var percent = popNum/100;
    return [ Math.round(percent*53), Math.round(percent*47)]
  }
  
  makeGender(num, genderType){
    
    var children = [];
    var adults = [];
    
    //0-18
    //18-25
    //44-64
    //64-infinity
    var ageGroups = [30, 6, 22, 30, 12];
    var maxAge = [18, 25, 44, 64, 98 ];
    
    
    var ageGroupPeople = [];
    
    
    var minAgeNum = 0;
    
    var groupIndex = 0;
    var ageIndex = 0;
    
    var ageCollection =0;

    var isSneezer = 0;
    
    for(var i=0; i< num; i++){
      
      
      var age = ageIndex++;
      if( ageIndex == maxAge[groupIndex]){
        ageIndex = minAgeNum;
      }
      
      
      //console.log(percent)
      if(age>=18){
        adults.push(new Person(genderType, age, isSneezer));
      }else{
        children.push(new Person(genderType, age, isSneezer));
      }
      
      
      
      ageCollection++;
      
      var percent = Math.floor(ageCollection/(num/100));
      
      if(percent > ageGroups[groupIndex]){
        ageGroupPeople.push(ageCollection);
        minAgeNum = maxAge[groupIndex];
        groupIndex++;
        ageCollection = 0;
        
      }
      
      
      
    } 
    
    return [adults, children];
  }
  
  makeFemales(num){
    
  }

  constructor(popNum){
  
    var genders = this.splitGender(popNum);
    
    var females = this.makeGender(genders[0], 'f');
    
    this.adultF = females[0];
    this.childrenF = females[1];
    
    var males = this.makeGender(genders[1], 'm');
    
    this.adultM = males[0];
    this.childrenM = males[1];
    
  
  }
  
  assignResidence(residences){
    
    this.occupiedResidences = [];
    
    var totalRes = residences.length;    
    var families = 6756;
    
    var singlePeople = totalRes-families;
    
    var singleFamilies = Math.round((families/100)*30);
    var marriedFamilies = Math.round((families/100)*70);
    
    var adultM = this.adultM.slice(0);
    var adultF = this.adultF.slice(0);
    
    for(var i=0; i < marriedFamilies ; i++){
    
      var marriedGroup = [adultM.shift(), adultF.shift() ];
      var residence = residences.shift();
      
      residence.residents = marriedGroup;
      
      this.occupiedResidences.push( residence );
    }
    
    for(var i=marriedFamilies; i < singleFamilies + marriedFamilies ; i++){
      //console.log(i)
      var residence = residences.shift();
      residence.residents = [adultF.shift()]
      
      this.occupiedResidences.push( residence );
    }
    
    
    var resLength = residences.length;
    
    var unmarriedAdults = shuffle(adultM.concat(adultF));
    
    for( var i=0; i < resLength-600 ; i++){
    
      var residence = residences.shift();
      residence.residents = [unmarriedAdults.shift()]
      this.occupiedResidences.push( residence );
      
    }
    
    
    resLength = residences.length;   
    
    for( var i=0; i < resLength ; i++){
      var group= unmarriedAdults.splice(0, 8);
      //console.log(group)
      
      if(group.length){
        var residence = residences.shift();
        residence.residents = group;
        this.occupiedResidences.push( residence )
      }
    }
    
    
    //assign the children
    
    var allFamiliesNum = singleFamilies + marriedFamilies;
    
    var childrenM = this.childrenM.slice(0);
    var childrenF = this.childrenF.slice(0);
    
    var allChildren = childrenM.concat(childrenF);
    
    
   // console.log( allChildren.length );
   // console.log(allFamiliesNum)
    
    var childrenGroups =  Math.round( allChildren.length / allFamiliesNum );
    var childRemainder = allChildren.length % allFamiliesNum;
    
    console.log(allChildren.length)
    
    for(var i=0; i < allFamiliesNum ; i++){
    
      var group= allChildren.splice(0, childrenGroups);
      
      
      if(group.length){
        this.occupiedResidences[i].residents = this.occupiedResidences[i].residents.concat(group)
        
      }
      
    }
    
    for(var i=0; i < childRemainder ; i++){
    
      this.occupiedResidences[i].residents =this.occupiedResidences[i].residents.concat(allChildren.shift())
      
    }
    
    
    //give the residents a reference to where they live
    for(var i = 0 ; i < this.occupiedResidences.length; i++){
      
      var thisResidence = this.occupiedResidences[i];
      for (var j = 0; j < thisResidence.residents.length; j++ ){
        thisResidence.residents[j].residence = thisResidence ;
        thisResidence.residents[j].residenceIndex = i ;
      }
    
    }
    
    
    this.population = this.adultM.concat(this.adultF).concat(this.childrenM).concat(this.childrenF) ;
    
  }
  
}
