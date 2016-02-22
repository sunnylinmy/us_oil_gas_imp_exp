var width = window.outerWidth *0.5,
    height = 500;

var button_container = d3.select("#button-container").style("width",window.outerWidth*0.14+"px").style("margin", "10px auto");

query_str="data/imp_exp2111.json";

d3.select(".tooltip").remove();
d3.select("#map-container").remove();
d3.select(".canvas").remove();
d3.select("#unitsTag").remove();

var var_name,
	num_data,
	json_data,
	jsonArr1=[],
	jsonArr2=[],
	colors,
	stateData;

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

queue()
  .defer(d3.json, 'data/us-states-new.topojson')
  .defer(d3.json, query_str)
  .defer(d3.csv, 'data/country_code.csv')
  .await(ready);

function ready(error, map, data, country){
	var rateById = {};
    var nameById = {};

    var green_range = [0.1, 1, 10, 100, 1000,10000,100000];
	var color_green = ['rgb(229,245,224)','rgb(199,233,192)','rgb(161,217,155)','rgb(116,196,118)','rgb(65,171,93)','rgb(35,139,69)','rgb(0,90,50)'];
	var blue_range = [ 0.1, 1, 10, 100, 1000,10000];
	var color_blue = ['rgb(247,252,245)','#deebf7','#c6dbef','#9ecae1','#6baed6','#4292c6','#2171b5'];

	var data0=data.imports;
	map_range = blue_range;
	map_color = color_blue;

	d3.selectAll("button").on("click", function(d){
		variable = d3.select(this).attr("id");
		if (variable=="exportbutton"){
			data0 = data.exports;
			map_range = green_range;
			map_color = color_green;
			ready_ready(data0,jsonArr1);
		}else if (variable=="importbutton"){
			data0 = data.imports;
			map_range = blue_range;
			map_color = color_blue;	
			ready_ready(data0,jsonArr2);	
		}
	});

function ready_ready(data,jsonArr){

  var_name = data[0];
  num_data = data.splice(1,data.length-1);

    for (i=0; i < num_data.length;i++){
      jsonArr.push({
        GEN_VAL_YR: Number(num_data[i][0]),
        STATE: num_data[i][1],
        YEAR: num_data[i][2],
        NAICS: num_data[i][3],
        CTY_CODE: num_data[i][4]
      });
    }
    sortedState = jsonArr.map(state).sort(d3.ascending);   // get state name

    var stateName;
    stateName=unique(sortedState);

    allsortedState = jsonArr.map(val).sort(d3.ascending);   // get ranking of all the value

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
var color = d3.scale.linear().domain(map_range)
    .range(map_color);

  state_svg = svg.append("g")
            .attr("class", "region")
            .selectAll("path")
            .data(topojson.feature(map, map.objects.collection).features)
            .enter().append("path")
            .attr("d", path)
            .attr("fill",function(d) {return color(rateById[d.properties.NAME])?color(rateById[d.properties.NAME]):'rgb(255,255,255)';})
            .attr("id",function(d) {
                  return d.properties.NAME;})
            .style("opacity", 1);

  state_svg.on("mouseover", function(d) {
    d3.select(this).transition().duration(300).style("opacity", 1).attr("fill","#fee391");

    div.transition().duration(300)
    .style("opacity", 1);

    var million_num = function(x){
        if (rateById[x]==null){
          return "0"
        }else{
          return rateById[x].toFixed(2)
        }
    }

    div.text(nameById[d.properties.NAME] + " : " + million_num(d.properties.NAME)+"Million")
    .style("left", (d3.event.pageX) + "px")
    .style("top", (d3.event.pageY-30) + "px");
  })
  .on("mouseout", function() {
    d3.select(this)
    .transition().duration(300)
    .style("opacity", 1).attr("fill",function(d) {return color(rateById[d.properties.NAME]);});

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
        height = window.outherHeight - margin.top - margin.bottom;

    var state_Country = filterJSON(jsonArr,'STATE',this.id);
    var sorted_Country = state_Country.map(val).sort(d3.descending);

    var plot_Country = state_Country.sort(function(a,b){
        return d3.descending(val(a),val(b));
    }).splice(0,15);

  var xLength = 25;

  var yHeight =  d3.scale.linear().domain([Number(allsortedState[allsortedState.length-1]),Number(allsortedState[0])])
              .range([width*0.5-210,1]);

  var unitsTag = d3.select("#container").append("div")
                   .attr("id","unitsTag").text(this.id)
                   .style("width",width+"px")
                   .style("margin", "2px auto");
                   
  var units = d3.select("#unitsTag").append("aside").attr("id","units")
                .text("Units: US dollars").style("width",width+"px")
                .style("margin", "1px auto");

  var canvas = d3.select("#container").append("div").attr("class","canvas").style("width",width+"px").style("margin", "2px auto");
 
  var barchart = canvas.append("div").attr("id","barchart").style("width",width-100 +"px").style("height",height+"px");

  var ytextchart = canvas.append("div").attr("id","ytextchart").style("width",width-100 +"px");

  var ytext = ytextchart.selectAll(".ytext").data(plot_Country).enter().append("div").attr("class","ytext_label").style("width","25px").style("height","27px").append("text").text(function(d) {return countryName(d);});

  var bar = barchart.selectAll(".bar")
            .data(plot_Country).enter().append("div").attr("class","bar")
            .style("width", xLength + "px")
            .style("height",function(d) {return yHeight(d.GEN_VAL_YR) +"px";})
            .append("text")
            .text(function(d){
               if (Number(val(d)/1000000000 >1)){
                 return Number(val(d)/1000000000).toFixed(2) + " billion";
               }
               //else if ((Number(val(d)/1000000000) <1) && (Number(val(d)/1000000)>1)){
               //   return Number(val(d)/1000000).toFixed(0) +" million";
               //}
            }).attr("word-break","keep-all");
   });


addColorbar(map_range,map_color);

	function countryName(data) { 
        for (var indicator in country){
            if (country[indicator].Code==data.CTY_CODE){
              return country[indicator].ISO_Code;
            }
         }
    };
  };  // ready_ready ends
};    // ready ends

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

d3.select("#svg-color-quant").remove();

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