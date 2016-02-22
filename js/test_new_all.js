//query_str_import = "http://api.census.gov/data/2014/intltrade/istnaics?get=GEN_VAL_YR,STATE&YEAR=2014&NAICS=3241&CTY_CODE";
//query_str_export = "http://api.census.gov/data/2014/intltrade/stnaics?get=VALUE_YR,STATE&YEAR=2014&NAICS=3241&CTY_CODE";
var width = window.outerWidth *0.5,
    height = 500;

var button_container = d3.select("#button-container").style("width",window.outerWidth*0.14+"px").style("margin", "10px auto");



function choice_imp(){

query_str_import="data/imports.json";
d3.select(".tooltip").remove();
d3.select("#map-container").remove();
d3.select(".canvas").remove();
d3.select("#unitsTag").remove();


var var_name,
	num_data,
	json_data,
	colors,
	jsonArr=[],
	stateData;

var width = window.outerWidth *0.5,
  	height = 500;


var div = d3.select("#container").append("div")   
  .attr("class", "tooltip")               
  .style("opacity", 0);

var button_container = d3.select("#button-container").style("width",window.outerWidth*0.14+"px").style("margin", "10px auto");

var svg = d3.select("#container").append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("margin-left",width*0.25)
  .style("margin", "10px auto")
  .attr("id","map-container");

var projection = d3.geo.albersUsa().translate([width / 2, height / 2]);

var path = d3.geo.path().projection(projection);

  //Reading map file and data

  queue()
  .defer(d3.json, 'data/us-states-new.topojson')
  .defer(d3.json, query_str_import)
  .defer(d3.csv, 'data/country_code.csv')
  .await(ready);

function ready(error, map, data, country) {
    var rateById = {};
    var nameById = {};

  var_name = data[0];
	num_data = data.splice(1,data.length-1);

		for (i=0; i < num_data.length;i++){
			jsonArr.push({
				GEN_VAL_YR: Number(num_data[i][0]),
				STATE: num_data[i][1],
				YEAR: num_data[i][2],
				NAICS: num_data[i][3],
				CTY_CODE: num_data[i][4]
			})
		}
		sortedState = jsonArr.map(state).sort(d3.ascending);


		var stateName;
		stateName=unique(sortedState);

		var sumByState_json = [];
		
		for (i=0;i<stateName.length;i++){
			var sumByState = 0;
			var states_json = [];
			states_json = filterJSON(jsonArr,'STATE',stateName[i]);

			for (j=0;j<states_json.length;j++){
				sumByState = sumByState*1+Number(states_json[j].GEN_VAL_YR);
			}
			sumByState_json.push({
				STATE_VAL: Number(sumByState)/(1000000),
				STATE: stateName[i],
				YEAR: jsonArr[1].YEAR,
				NAICS: jsonArr[1].NAICS,
		});
	};

	sortedSum  = sumByState_json.map(state_val).sort(d3.ascending);
	lo = sortedSum[0];
	hi = sortedSum[sortedSum.length-1];

	
   sumByState_json.forEach(function(d) {
    	rateById[d.STATE] = +d.STATE_VAL;
    	nameById[d.STATE] = d.STATE;
  });

  //Drawing Choropleth
var blue_range = [0.1, 1, 10, 100, 1000,10000];
var color_blue = ['#deebf7','#c6dbef','#9ecae1','#6baed6','#4292c6','#2171b5'];
var color = d3.scale.linear().domain([0.1, 1, 10, 100, 1000,10000])
    .range(color_blue);

  state_svg = svg.append("g")
  .attr("class", "region")
  .selectAll("path")
  .data(topojson.feature(map, map.objects.collection).features)
  .enter().append("path")
  .attr("d", path)
  .attr("fill",function(d) {return color(rateById[d.properties.NAME]);})
  .attr("id",function(d) {
              return d.properties.NAME;})
  .style("opacity", 1);

  state_svg.on("mouseover", function(d) {
   	d3.select(this).transition().duration(300).style("opacity", 1).attr("fill","#fee391");

    div.transition().duration(300)
    .style("opacity", 1);

    div.text(nameById[d.properties.NAME] + " : " + rateById[d.properties.NAME].toFixed(2)+"Million")
    .style("left", (d3.event.pageX) + "px")
    .style("top", (d3.event.pageY-30) + "px");
  })
  .on("mouseout", function() {
    d3.select(this)
    .transition().duration(300)
    .style("opacity", 0.8).attr("fill",function(d) {return color(rateById[d.properties.NAME]);});

    div.transition().duration(300)
    .style("opacity", 0);
  });

 // Drawing Choropleth Ends
 // Combine country code in data with country name in country

state_svg.on("click", function(){

    d3.select(".canvas").remove();
    d3.select("#unitsTag").remove();
    var margin = {top: 80, right: window.outerWidth *0.25, bottom: 0, left: window.outerWidth *0.25},
        width = window.outerWidth - margin.right-margin.left,
        height = 800 - margin.top - margin.bottom;

    var state_Country = filterJSON(jsonArr,'STATE',this.id);
    var sorted_Country = state_Country.map(val).sort(d3.descending);

    var plot_Country = state_Country.sort(function(a,b){
        return d3.descending(val(a),val(b));
    });

  var xLength =  d3.scale.linear().domain([Number(sorted_Country[0]),Number(sorted_Country[sorted_Country.length-1])])
              .range([width-210,1]);

  var yHeight = 25;  //bar height

  var unitsTag = d3.select("#container").append("div").attr("id","unitsTag").text(this.id).style("width",width+"px").style("margin", "2px auto");
  var units = d3.select("#unitsTag").append("aside").attr("id","units").text("Units: US dollars").style("width",width+"px").style("margin", "1px auto");

  var canvas = d3.select("#container").append("div").attr("class","canvas").style("width",width+"px").style("margin", "2px auto");
 
  var ytextchart = canvas.append("div").attr("id","ytextchart").style("width","200px");

  var barchart = canvas.append("div").attr("id","barchart").style("width",width-210 +"px");

  var ytext = ytextchart.selectAll(".ytext").data(plot_Country).enter().append("div").style("height","27px").append("text").text(function(d) {return countryName(d);});

  var bar = barchart.selectAll(".bar")
            .data(plot_Country).enter().append("div").attr("class","bar")
            .style("width", function(d) {return xLength(d.GEN_VAL_YR) + "px";})
            .style("height", 25+"px")
            .append("text")
            .text(function(d){
               if (Number(val(d)/1000000000 >1)){
                 return Number(val(d)/1000000000).toFixed(2) + " billion";
               }else if ((Number(val(d)/1000000000) <1) && (Number(val(d)/1000000)>1)){
                  return Number(val(d)/1000000).toFixed(0) +" million";
               }else if ((Number(val(d)/1000000) <1) && (Number(val(d)/1000) >1)){
                  return Number(val(d)).toFixed(0);
               }else if (Number(val(d)/1000 <1)){
                  return Number(val(d));
               }
            }).attr("word-break","keep-all");


   });

function countryName(data) { 
      
         for (var indicator in country){
            if (country[indicator].Code==data.CTY_CODE){
              return country[indicator].Name;
            }
         }
       };

addColorbar(blue_range,color_blue);

};    // End of Ready Function


}


function choice_exp(){

query_str_import="data/exports.json";
d3.select(".tooltip").remove();
d3.select("#map-container").remove();
d3.select(".canvas").remove();
d3.select("#unitsTag").remove();


var var_name,
  num_data,
  json_data,
  colors,
  jsonArr=[],
  stateData;

var width = window.outerWidth *0.5,
    height = 500;

  d3.select("#container");

  var div = d3.select("#container").append("div")   
  .attr("class", "tooltip")               
  .style("opacity", 0);

  var button_container = d3.select("#button-container").style("width",window.outerWidth*0.14+"px").style("margin", "10px auto");

  var svg = d3.select("#container").append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("margin-left",width*0.25)
  .style("margin", "10px auto")
  .attr("id","map-container");

  var projection = d3.geo.albers()
  .rotate([-105, 0])
  .center([-10, 65])
  .parallels([52, 64])
  .scale(700)
  .translate([width / 2, height / 2]);

  var projection = d3.geo.albersUsa().translate([width / 2, height / 2]);

  var path = d3.geo.path().projection(projection);

  //Reading map file and data

  queue()
  .defer(d3.json, 'data/us-states-new.topojson')
  .defer(d3.json, query_str_import)
  .defer(d3.csv, 'data/country_code.csv')
  .await(ready);

function ready(error, map, data, country) {
    var rateById = {};
    var nameById = {};

  var_name = data[0];
  num_data = data.splice(1,data.length-1);

    for (i=0; i < num_data.length;i++){
      jsonArr.push({
        GEN_VAL_YR: Number(num_data[i][0]),
        STATE: num_data[i][1],
        YEAR: num_data[i][2],
        NAICS: num_data[i][3],
        CTY_CODE: num_data[i][4]
      })
    }
    sortedState = jsonArr.map(state).sort(d3.ascending);

    allsortedState = jsonArr.map(val).sort(d3.ascending);
    console.log(allsortedState);
    var stateName;
    stateName=unique(sortedState);

    var sumByState_json = [];
    
    for (i=0;i<stateName.length;i++){
      var sumByState = 0;
      var states_json = [];
      states_json = filterJSON(jsonArr,'STATE',stateName[i]);

      for (j=0;j<states_json.length;j++){
        sumByState = sumByState*1+Number(states_json[j].GEN_VAL_YR);
      }
      sumByState_json.push({
        STATE_VAL: Number(sumByState)/(1000000),
        STATE: stateName[i],
        YEAR: jsonArr[1].YEAR,
        NAICS: jsonArr[1].NAICS,
    });
  };

  sortedSum  = sumByState_json.map(state_val).sort(d3.ascending);
  lo = sortedSum[0];
  hi = sortedSum[sortedSum.length-1];

  
   sumByState_json.forEach(function(d) {
      rateById[d.STATE] = +d.STATE_VAL;
      nameById[d.STATE] = d.STATE;
  });

  //Drawing Choropleth
var green_range = [0.1, 1, 10, 100, 1000,10000,100000];
var color_green = ['rgb(229,245,224)','rgb(199,233,192)','rgb(161,217,155)','rgb(116,196,118)','rgb(65,171,93)','rgb(35,139,69)','rgb(0,90,50)'];
var color = d3.scale.linear().domain([0.1, 1, 10, 100, 1000,10000,100000])
    .range(color_green);

  state_svg = svg.append("g")
  .attr("class", "region")
  .selectAll("path")
  .data(topojson.feature(map, map.objects.collection).features)
  .enter().append("path")
  .attr("d", path)
  .attr("fill",function(d) {return color(rateById[d.properties.NAME]);})
  .attr("id",function(d) {
              return d.properties.NAME;})
  .style("opacity", 1);

  state_svg.on("mouseover", function(d) {
    d3.select(this).transition().duration(300).style("opacity", 1).attr("fill","#fee391");

    div.transition().duration(300)
    .style("opacity", 1);

    div.text(nameById[d.properties.NAME] + " : " + rateById[d.properties.NAME].toFixed(2)+"Million")
    .style("left", (d3.event.pageX) + "px")
    .style("top", (d3.event.pageY-30) + "px");
  })
  .on("mouseout", function() {
    d3.select(this)
    .transition().duration(300)
    .style("opacity", 0.8).attr("fill",function(d) {return color(rateById[d.properties.NAME]);});

    div.transition().duration(300)
    .style("opacity", 0);
  });

 // Drawing Choropleth Ends
 // Combine country code in data with country name in country

state_svg.on("click", function(){

    d3.select(".canvas").remove();
    d3.select("#unitsTag").remove();
    var margin = {top: 80, right: window.outerWidth *0.25, bottom: 0, left: window.outerWidth *0.25},
        width = window.outerWidth - margin.right-margin.left,
        height = 800 - margin.top - margin.bottom;

    var state_Country = filterJSON(jsonArr,'STATE',this.id);
    var sorted_Country = state_Country.map(val).sort(d3.descending);

    var plot_Country = state_Country.sort(function(a,b){
        return d3.descending(val(a),val(b));
    });

  var xLength =  d3.scale.linear().domain([Number(allsortedState[allsortedState.length-1]),Number(allsortedState[0])])
              .range([width-210,1]);

  var yHeight = 25;  //bar height

  var unitsTag = d3.select("#container").append("div")
                   .attr("id","unitsTag").text(this.id)
                   .style("width",width+"px")
                   .style("margin", "2px auto");
                   
  var units = d3.select("#unitsTag").append("aside").attr("id","units")
                .text("Units: US dollars").style("width",width+"px")
                .style("margin", "1px auto");

  var canvas = d3.select("#container").append("div").attr("class","canvas").style("width",width+"px").style("margin", "2px auto");
 
  var ytextchart = canvas.append("div").attr("id","ytextchart").style("width","200px");

  var barchart = canvas.append("div").attr("id","barchart").style("width",width-210 +"px");

  var ytext = ytextchart.selectAll(".ytext").data(plot_Country).enter().append("div").style("height","27px").append("text").text(function(d) {return countryName(d);});

  var bar = barchart.selectAll(".bar")
            .data(plot_Country).enter().append("div").attr("class","bar")
            .style("width", function(d) {return xLength(d.GEN_VAL_YR) + "px";})
            .style("height", 25+"px")
            .append("text")
            .text(function(d){
               if (Number(val(d)/1000000000 >1)){
                 return Number(val(d)/1000000000).toFixed(2) + " billion";
               }else if ((Number(val(d)/1000000000) <1) && (Number(val(d)/1000000)>1)){
                  return Number(val(d)/1000000).toFixed(0) +" million";
               }else if ((Number(val(d)/1000000) <1) && (Number(val(d)/1000) >1)){
                  return Number(val(d)).toFixed(0);
               }else if (Number(val(d)/1000 <1)){
                  return Number(val(d));
               }
            }).attr("word-break","keep-all");
   });


addColorbar(green_range,color_green);

function countryName(data) { 
      
         for (var indicator in country){
            if (country[indicator].Code==data.CTY_CODE){
              return country[indicator].Name;
            }
         }
       };




};    // End of Ready Function


};


function val(d) {return d.GEN_VAL_YR;};
function state(d) {return d.STATE;};
function year(d) {return d.year;};
function naics(d) {return d.NAICS;};
function cty(d) {return d.CTY_CODE;};
function state_val(d) {return d.STATE_VAL;};

var unique = function(xs) {
  var seen = {}
  return xs.filter(function(x) {
    if (seen[x])
      return
    seen[x] = true
    return x
  })
};

function filterJSON(json, key, value) {
    var result = [];
    for (var indicator in json) {
        if (json[indicator][key] === value) {
            result.push(json[indicator]);
        }
    }
    return result;
};


function addColorbar(range1,color_range){


var svg = d3.select("#map-container").append("svg").attr("id","svg-color-quant");

var label_Ordinal = d3.scale.ordinal()
    .domain(range1)
    .range(color_range);

svg.append("g")
  .attr("class", "legendOrdinal")
  .attr("transform", "translate(800,350)").attr("id","colorbar_unit");

var colorLegend = d3.legend.color()
    .orient("vertical")
    .scale(label_Ordinal);

svg.select(".legendOrdinal")
  .call(colorLegend);


};
