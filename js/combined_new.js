var width = window.outerWidth *0.5,
    height = 500;

query_str="data/imp_exp2111.json";

d3.select(".tooltip").remove();

var var_name,
	num_data,
  var_name_imp,
  var_name_exp,
  num_data_imp,
  num_data_exp,
	json_data,
	jsonArr1=[],
	jsonArr2=[],
  jsonArr_imp=[],
  jsonArr_exp=[],
	colors,
	stateData;

var div = d3.select("#container").append("div")   
  .attr("class", "tooltip")               
  .style("opacity", 0);

var svg = d3.select("#map-container").attr("height",height).attr("id","map-container").attr("class","col-7");

var projection = d3.geo.albersUsa().translate([width/2+50, height/2]);

var path = d3.geo.path().projection(projection);

queue()
  .defer(d3.json, 'data/us-states-new.topojson')
  .defer(d3.json, query_str)
  .defer(d3.csv, 'data/country_code.csv')
  .await(ready);

function ready(error, map, data, country){

	  var rateById = {};
    var nameById = {};

  var green_range = [0, 0.1, 1, 10, 100, 1000,10000,100000];
	var color_green = ['#f7fcf5','#e5f5e0','#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#005a32'];
	var blue_range = [0, 0.1, 1, 10, 100, 1000,10000,100000];
	var color_blue = ['#f7fbff','#deebf7','#c6dbef','#9ecae1','#6baed6','#4292c6','#2171b5','#084594'];

	var data0=data.imports;
  map_range = blue_range;
	map_color = color_blue;


	d3.selectAll("button").on("click", function(d){
		  variable = d3.select(this).attr("id");
		  if (variable=="exportbutton"){

          var_name_imp = data.imports[0];
          num_data_imp = data.imports.splice(1,data.imports.length-1);

          for (i=0; i < num_data_imp.length;i++){
            jsonArr_imp.push({
                GEN_VAL_YR: Number(num_data_imp[i][0]),
                STATE: num_data_imp[i][1],
                YEAR: num_data_imp[i][2],
                NAICS: num_data_imp[i][3],
                CTY_CODE: num_data_imp[i][4]
              });
          };


          var_name_exp = data.exports[0];
          num_data_exp = data.exports.splice(1,data.exports.length-1);

          for (i=0; i < num_data_exp.length;i++){
             jsonArr_exp.push({
                  GEN_VAL_YR: Number(num_data_exp[i][0]),
                 STATE: num_data_exp[i][1],
                  YEAR: num_data_exp[i][2],
                 NAICS: num_data_exp[i][3],
                  CTY_CODE: num_data_exp[i][4]
              });
         };

			 data0 = data.exports;
			 map_range = green_range;
			 map_color = color_green;

			 ready_ready(data0,jsonArr_imp,data,jsonArr_imp,jsonArr_exp);

		}else if (variable=="importbutton"){

        var_name_imp = data.imports[0];
        num_data_imp = data.imports.splice(1,data.imports.length-1);

        for (i=0; i < num_data_imp.length;i++){
            jsonArr_imp.push({
                GEN_VAL_YR: Number(num_data_imp[i][0]),
                STATE: num_data_imp[i][1],
                YEAR: num_data_imp[i][2],
                NAICS: num_data_imp[i][3],
                CTY_CODE: num_data_imp[i][4]
            });
        };

        var_name_exp = data.exports[0];
        num_data_exp = data.exports.splice(1,data.exports.length-1);

        for (i=0; i < num_data_exp.length;i++){
           jsonArr_exp.push({
                GEN_VAL_YR: Number(num_data_exp[i][0]),
                STATE: num_data_exp[i][1],
                YEAR: num_data_exp[i][2],
                NAICS: num_data_exp[i][3],
                CTY_CODE: num_data_exp[i][4]
            });
        };

			   data0 = data.imports;
			   map_range = blue_range;
			   map_color = color_blue;
         
			   ready_ready(data0,jsonArr_exp,data,jsonArr_imp,jsonArr_exp);	
		};
	});


function ready_ready(data1,jsonArr,data_all,jsonArrImp,jsonArrExp){

  var_name = data1[0];
  num_data = data1.splice(1,data1.length-1);

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

    console.log(data1.splice(1,data1.length-1));

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
var color = d3.scale.linear().domain(map_range).range(map_color);

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
                d3.select(this)
                  .transition().duration(300).style("opacity", 1).attr("fill","#fee391");

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
          }).on("mouseout", function() {
                 d3.select(this)
                   .transition()
                   .duration(300)
                   .style("opacity", 1)
                   .attr("fill",function(d) {return color(rateById[d.properties.NAME]);});

                div.transition()
                   .duration(300)
                   .style("opacity", 0);
          });

 // Drawing Choropleth Ends
 // Combine country code in data with country name in country

state_svg.on("click", function(){

    d3.selectAll("#canvas > svg").remove();

    var margin = {top: 80, right: window.outerWidth *0.25, bottom: 0, left: 100},
        width = window.outerWidth - margin.right-margin.left,
        height = window.outherHeight - margin.top - margin.bottom;

    var barchartWidth = window.outerWidth*0.27;
    var barchartHeight = 260;

  
    var unitsTag = d3.select("#unitsTag")
                   .text(this.id)
                   .attr("float","left")
                   .style("margin-left","100px");
                   
    var units = d3.select("#unitsTag")
                .append("aside")
                .attr("id","units")
                .text("Units: US dollars")
                .attr("float","right")
                .style("margin-right","100px");

    var state_Country_imp = filterJSON(jsonArrImp,'STATE',this.id);
    var sorted_Country_imp = state_Country_imp.map(val).sort(d3.descending);

    var plot_Country_imp = state_Country_imp.sort(function(a,b){
        return d3.descending(val(a),val(b));
    }).splice(0,15);

    var state_Country_exp = filterJSON(jsonArrExp,'STATE',this.id);
    var sorted_Country_exp = state_Country_exp.map(val).sort(d3.descending);

    var plot_Country_exp = state_Country_exp.sort(function(a,b){
        return d3.descending(val(a),val(b));
    }).splice(0,15);

    var allsortedState_imp = jsonArrImp.map(val).sort(d3.ascending); 
    var allsortedState_exp = jsonArrExp.map(val).sort(d3.ascending); 
  
    var x_imp = d3.scale.ordinal()
            .domain(plot_Country_imp.map(function(d){return countryName(d);}))
            .range(plot_Country_imp.map(function(d,i){return 25*i+10;}));

    var x_exp = d3.scale.ordinal()
            .domain(plot_Country_exp.map(function(d){return countryName(d);}))
            .range(plot_Country_exp.map(function(d,i){return 25*i+10;}));

    var xAxis_imp = d3.svg.axis().scale(x_imp).orient("bottom");

    var xAxis_exp = d3.svg.axis().scale(x_exp).orient("bottom");

    var xLength = 25;

    var yHeight_imp =  d3.scale
                   .linear()
                   .domain([Number(allsortedState_imp[allsortedState_imp.length-1]),Number(allsortedState_imp[0])])
                   .range([barchartHeight,1]);

    var yHeight_exp = d3.scale
                   .linear()
                   .domain([Number(allsortedState_exp[allsortedState_exp.length-1]),Number(allsortedState_exp[0])])
                   .range([barchartHeight,1]);

    var y_imp = d3.scale.linear()
            .range([0,barchartHeight-1])
            .domain([Number(allsortedState_imp[allsortedState_imp.length-1])/(1000000),Number(allsortedState_imp[0])/(1000000)]);

    var y_exp = d3.scale.linear()
            .range([0,barchartHeight-1])
            .domain([Number(allsortedState_exp[allsortedState_exp.length-1])/(1000000),Number(allsortedState_exp[0])/(1000000)]);


    var yAxis_imp = d3.svg.axis().scale(y_imp).orient("left");
    var yAxis_exp = d3.svg.axis().scale(y_exp).orient("left");


    var canvas = d3.select("#canvas");
 
    var barchart_imp = canvas.append("svg")
                       .attr("id","barchart_imp")
                       .attr("width",barchartWidth +"px")
                       .attr("height",barchartHeight+100+"px");

    var bar_imp = barchart_imp.selectAll(".bar")
                              .data(plot_Country_imp).enter()
                              .append("rect").attr("class","bar_imp")
                              .attr("x", function(d,i){return 25*i;})
                              .attr("y", function(d){return y_imp(d.GEN_VAL_YR/(1000000));})
                              .attr("width", xLength + "px")
                              .attr("height",function(d) {return barchartHeight-y_imp(d.GEN_VAL_YR/(1000000));})
                              .attr("transform","translate("+margin.left+","+0+")");

    barchart_imp.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + margin.left+","+barchartHeight + ")")
            .call(xAxis_imp)
            .selectAll("text").style("text-anchor","end")
            .attr("dx","-.8em")
            .attr("dy",".15em")
            .attr("transform","rotate(-65)");

    barchart_imp.append("g")
            .attr("class", "y axis")
            .call(yAxis_imp)
            .attr("transform","translate("+margin.left+","+0+")")
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Million US dollar");

    var imp_text = barchart_imp.append("text")
                               .text("Imports")
                               .attr("x",barchartWidth-100)
                               .attr("y",20);

    var barchart_exp = canvas.append("svg")
                             .attr("id","barchart_exp")
                             .attr("width",barchartWidth+"px")
                             .attr("height",barchartHeight+100+"px");

    var bar_exp = barchart_exp.selectAll(".bar")
                              .data(plot_Country_exp).enter()
                              .append("rect").attr("class","bar_exp")
                              .attr("x", function(d,i){return 25*i;})
                              .attr("y", function(d){return y_exp(d.GEN_VAL_YR/(1000000));})
                              .attr("width", xLength + "px")
                              .attr("height",function(d) {return barchartHeight-y_exp(d.GEN_VAL_YR/(1000000));})
                              .attr("transform","translate("+margin.left+","+0+")");

    barchart_exp.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + margin.left+","+barchartHeight + ")")
            .call(xAxis_exp)
            .selectAll("text").style("text-anchor","end")
            .attr("dx","-.8em")
            .attr("dy",".15em")
            .attr("transform","rotate(-65)");

    barchart_exp.append("g")
            .attr("class", "y axis")
            .call(yAxis_exp)
            .attr("transform","translate("+margin.left+","+0+")")
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Million US dollar");

     var imp_text = barchart_exp.append("text")
                               .text("Exports")
                               .attr("x",barchartWidth-100)
                               .attr("y",20);


   });



addColorbar(map_range,map_color);

	function countryName(data2) { 
        for (var indicator in country){
            if (country[indicator].Code==data2.CTY_CODE){
              return country[indicator].Name;
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

var svg_bar = d3.select("#map-container").append("svg").attr("id","svg-color-quant");

var label_Ordinal = d3.scale.ordinal()
    .domain(range1)
    .range(color_range);

svg_bar.append("g")
   .attr("class", "legendOrdinal")
   .attr("transform", "translate(850,350)").attr("id","colorbar_unit");

var colorLegend = d3.legend.color()
                    .orient("vertical")
                    .scale(label_Ordinal);

svg_bar.select(".legendOrdinal")
   .call(colorLegend);

};