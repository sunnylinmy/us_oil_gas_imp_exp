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
//	jsonArr1=[],
//	jsonArr2=[],
  jsonArr_imp=[],
  jsonArr_exp=[],
	colors,
	stateData;

var div = d3.select("#container").append("div")   
  .attr("class", "tooltip")               
  .style("opacity", 0);

var svg = d3.select("#map-container").attr("height",height);
//.attr("id","map-container").attr("class","col-7");

var projection = d3.geo.albersUsa().translate([width/2+50, height/2]);

var path = d3.geo.path().projection(projection);

queue()
  .defer(d3.json, 'data/us-states-new.topojson')
  .defer(d3.json, query_str)
  .defer(d3.csv, 'data/country_code.csv')
  .await(ready);

var dataC;

function ready(error, map, data, country){

	  var rateById = {};
    var nameById = {};

// Begin: Draw National Map and Bar Chart
  var green_range = [0, 0.1, 1, 10, 100, 1000,10000,100000];
	var color_green = ['#f7fcf5','#e5f5e0','#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#005a32'];
	var blue_range = [0, 0.1, 1, 10, 100, 1000,10000,100000];
	var color_blue = ['#f7fbff','#deebf7','#c6dbef','#9ecae1','#6baed6','#4292c6','#2171b5','#084594'];

//	var data0=data.imports;
  var dataImp = data.imports;
  var dataExp = data.exports;

  map_range = blue_range;
	map_color = color_blue;

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
      ready_ready(dataImp,jsonArr_imp,data,jsonArr_imp,jsonArr_exp);  

	d3.selectAll("button").on("click", function(d){
		  variable = d3.select(this).attr("id");
		  if (variable=="exportbutton"){
			   map_range = green_range;
			   map_color = color_green;
         d3.select("#map-container").selectAll("g").remove();
			   ready_ready(dataExp,jsonArr_exp,data,jsonArr_imp,jsonArr_exp);
		  }else if (variable=="importbutton"){
			   map_range = blue_range;
			   map_color = color_blue;
         d3.select("#map-container").selectAll("g").remove();
			   ready_ready(dataImp,jsonArr_imp,data,jsonArr_imp,jsonArr_exp);	
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
      };

      sumByState_json.push({
        STATE_VAL: Number(sumByState)/(1000000),
        STATE: stateName[i],
        YEAR: jsonArr[1].YEAR,
        NAICS: jsonArr[1].NAICS,
    });
  };
  
   sumByState_json.forEach(function(d) {
      rateById[d.STATE] = +d.STATE_VAL;
      nameById[d.STATE] = d.STATE;
  });

  //Drawing Choropleth
var color = d3.scale.linear().domain(map_range).range(map_color);
//console.log(rateById);

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
                        if (rateById[x]>100){
                            return rateById[x].toFixed(0);
                         }else{
                            return rateById[x].toFixed(2);
                        }  
                     }
                };

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

    var margin = {top: 80, right:0, bottom: 0, left: 50},

        height = window.outherHeight - margin.top - margin.bottom;

    var barchartWidth = window.outerWidth*0.23;
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
                .style("margin-right","20px");

    var state_Country_imp = filterJSON(jsonArrImp,'STATE',this.id);

    var plot_State_imp = state_Country_imp.sort(function(a,b){
        return d3.descending(val(a),val(b));
    }).splice(0,15);

    var state_Country_exp = filterJSON(jsonArrExp,'STATE',this.id);

    var plot_State_exp = state_Country_exp.sort(function(a,b){
        return d3.descending(val(a),val(b));
    }).splice(0,15);

    var allsortedState_imp = jsonArrImp.map(val).sort(d3.ascending); 
    var allsortedState_exp = jsonArrExp.map(val).sort(d3.ascending); 
  
    var x_imp = d3.scale.ordinal()
            .domain(plot_State_imp.map(function(d){return getCountryName(d);}))
            .range(plot_State_imp.map(function(d,i){return 25*i+10;}));

    var x_exp = d3.scale.ordinal()
            .domain(plot_State_exp.map(function(d){return getCountryName(d);}))
            .range(plot_State_exp.map(function(d,i){return 25*i+10;}));

    var xAxis_imp = d3.svg.axis().scale(x_imp).orient("bottom");

    var xAxis_exp = d3.svg.axis().scale(x_exp).orient("bottom");

    var xLength = 25;

    var yHeight_imp =  d3.scale
                   .linear()
                   .domain([Number(allsortedState_imp[allsortedState_imp.length-1]),Number(allsortedState_imp[0])])
                   .range([barchartHeight,2]);

    var yHeight_exp = d3.scale
                   .linear()
                   .domain([Number(allsortedState_exp[allsortedState_exp.length-1]),Number(allsortedState_exp[0])])
                   .range([barchartHeight,2]);

    var y_imp = d3.scale.linear()
            .range([1,barchartHeight-1])
            .domain([Number(allsortedState_imp[allsortedState_imp.length-1])/(1000000),Number(allsortedState_imp[0])/(1000000)]);

    var y_exp = d3.scale.linear()
            .range([1,barchartHeight-1])
            .domain([Number(allsortedState_exp[allsortedState_exp.length-1])/(1000000),Number(allsortedState_exp[0])/(1000000)]);


    var yAxis_imp = d3.svg.axis().scale(y_imp).orient("left");
    var yAxis_exp = d3.svg.axis().scale(y_exp).orient("left");


    var canvas = d3.select("#canvas");

    var imp_margin_left = margin.left+40;
 
    var barchart_imp = canvas.append("svg")
                       .attr("id","barchart_imp")
                       .attr("width",barchartWidth+imp_margin_left-margin.left+"px")
                       .attr("height",barchartHeight+100+"px")
                       .attr("display","inline-block");

    var bar_imp = barchart_imp.selectAll(".bar")
                              .data(plot_State_imp).enter()
                              .append("rect").attr("class","bar_imp")
                              .attr("x", function(d,i){return 25*i;})
                              .attr("y", function(d){return y_imp(d.GEN_VAL_YR/(1000000));})
                              .attr("width", xLength + "px")
                              .attr("height",function(d) {return barchartHeight-y_imp(d.GEN_VAL_YR/(1000000));})
                              .attr("transform","translate("+imp_margin_left+","+ 0+")");

    barchart_imp.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + imp_margin_left+","+barchartHeight + ")")
            .call(xAxis_imp)
            .selectAll("text").style("text-anchor","end")
            .attr("dx","-.8em")
            .attr("dy",".15em")
            .attr("transform","rotate(-65)");

    barchart_imp.append("g")
            .attr("class", "y axis")
            .call(yAxis_imp)
            .attr("transform","translate("+imp_margin_left+","+0+")")
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Million US dollar");
 
    var imp_text = barchart_imp.append("text")
                               .text("Imports")
                               .attr("x",barchartWidth-50)
                               .attr("y",20);

    var barchart_exp = canvas.append("svg")
                             .attr("id","barchart_exp")
                             .attr("width",barchartWidth+"px")
                             .attr("height",barchartHeight+100+"px")
                             .attr("display","inline-block");

    var bar_exp = barchart_exp.selectAll(".bar")
                              .data(plot_State_exp).enter()
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

	function getCountryName(data2) { 
        for (var indicator in country){
            if (country[indicator].Code==data2.CTY_CODE){
              return country[indicator].Name;
            }
         }
    };
  };  // ready_ready ends
};    // ready ends

//Begin: Draw Country Bar
queue()
  .defer(d3.json, 'data/us-states-new.topojson')
  .defer(d3.json, query_str)
  .defer(d3.csv, 'data/country_code.csv')
  .await(ready2);

  var variable2;
    var jsonArrCImp = [];
  var jsonArrCExp = [];

function ready2(error,map,data,country){

  var dataImp = data.imports;
  var dataExp = data.exports;

    var ssortedCImp15,
      ssortedCExp15,
      ssCExp15,
      ssCImp15;

  var var_name_C_imp = dataImp[0];
  var num_data_C_imp = dataImp.splice(1,dataImp.length-1);

    for (i=0; i < num_data_C_imp.length;i++){
      jsonArrCImp.push({
        GEN_VAL_YR: Number(num_data_C_imp[i][0]),
        STATE: num_data_C_imp[i][1],
        YEAR: num_data_C_imp[i][2],
        NAICS: num_data_C_imp[i][3],
        CTY_CODE: num_data_C_imp[i][4]
       });
      };

  var var_name_C_exp = dataExp[0];
  var num_data_C_exp = dataExp.splice(1,dataExp.length-1);

    for (i=0; i < num_data_C_exp.length;i++){
      jsonArrCExp.push({
        GEN_VAL_YR: Number(num_data_C_exp[i][0]),
        STATE: num_data_C_exp[i][1],
        YEAR: num_data_C_exp[i][2],
        NAICS: num_data_C_exp[i][3],
        CTY_CODE: num_data_C_exp[i][4]
       });
      };

  ssortedCImp15 = getCountryImpData(jsonArrCImp);
  ssCExp15 = getCountryExpData(ssortedCImp15,jsonArrCExp);

  ssortedCExp15 = getCountryImpData(jsonArrCExp);
  ssCImp15 = getCountryExpData(ssortedCExp15,jsonArrCImp);

  allsortedState_CImp = ssortedCImp15.map(country_val).sort(d3.descending);

        drawBar(ssortedCImp15,ssCExp15,jsonArrCImp,jsonArrCExp);

var toggle = 1;

d3.select("#importSort").on("click",function(d){
    if (toggle==0){
        sssortedCImp15 = ssortedCImp15
        sssCExp15 = ssCExp15;
        d3.select("#importSort").html("Top 15 Countries by Imports");
        document.getElementById("exportSort").innerHTML = "Exports from Country";
        drawBar(sssortedCImp15,sssCExp15,jsonArrCImp,jsonArrCExp);
        toggle =1;
    }else if (toggle==1){
        sssortedCExp15 = ssortedCExp15;
        sssCImp15 = ssCImp15;
        document.getElementById("importSort").innerHTML = "Top 15 Countries by Exports";
        document.getElementById("exportSort").innerHTML = "Imports from Country";
        drawBar(sssortedCExp15,sssCImp15,jsonArrCExp,jsonArrCImp);
        toggle = 0;
    };
});


function drawBar(sortedCImp15,sCExp15,jsonArr_Imp,jsonArr_Exp){

  d3.select("#country-imp-barchart").remove();
  d3.select("#country-exp-barchart").remove();
  d3.selectAll("#country-name > div").remove();

  // design begin
      var margin = {top: 80, right:0, bottom: 0, left: 50},
        height = window.outherHeight - margin.top - margin.bottom;

    var barchartHeight = document.getElementById("country-import").offsetWidth;
    var barchartWidth = barchartHeight;

    var imp_margin_left = margin.left+10;
    var y_imp = d3.scale.ordinal()
            .domain(sortedCImp15.map(function(d){return getCountryName(d);}))
            .range(sortedCImp15.map(function(d,i){return 25*i+10;}));

      var yAxis_imp = d3.svg.axis().scale(y_imp).orient("right");

      var yLength = 25;

      var xHeight_imp = d3.scale
                   .linear()
                   .domain([0,Number(allsortedState_CImp[0])])
                   .range([barchartHeight-1,1]);

      var x_imp = d3.scale.linear()
            .range([barchartHeight-1,1])
            .domain([0,Number(allsortedState_CImp[0])]);

      var xAxis_imp = d3.svg.axis().scale(x_imp).orient("top");

      var color_red = ['#fee5d9','#a50f15'];
      var red_range = [0,30000000000];
      var colorRed = d3.scale.linear().domain(red_range).range(color_red);


  // design end

      var country_imp_barchart = d3.select("#country-import")
                               .append("svg")
                               .attr("id","country-imp-barchart")
                               .attr("width",barchartWidth+"px")
                               .attr("height",barchartHeight+160+"px");

      var country_imp_bar = d3.select("#country-imp-barchart").selectAll(".bar")
                                            .data(sortedCImp15).enter()
                                            .append("rect").attr("class","bar_country_imp")
                                            .attr("id",function(d){return d.COUNTRY;})
                                            .attr("y", function(d,i){return 25*i;})
                                            .attr("x", function(d){return x_imp(d.COUNTRY_VAL);})
                                            .attr("height", yLength + "px")
                                            .attr("width",function(d) {return barchartHeight-x_imp(d.COUNTRY_VAL);})
                                            .attr("transform","translate("+ 0+","+ 40+")")
                                            .on("click",function(d){
                                              var rateByIdCImp_temp = {};
                                              var jsontemp = filterJSON(jsonArr_Imp,"CTY_CODE",this.id);
                                              jsontemp.forEach(function(d){
                                                    rateByIdCImp_temp[d.STATE] = +d.GEN_VAL_YR;
                                                  }
                                                );
                                    
                                        d3.select("#map-container").selectAll(".region").remove();
                                        d3.select("#svg-color-quant").remove();
                                        barSelect = d3.select("html").select("body").select("#row2").select("#map-container").append("g").attr("class","region")
                                                                .selectAll("path")
                                                                .data(topojson.feature(map, map.objects.collection).features)
                                                                .enter().append("path")
                                                                .attr("d", path)
                                                                .attr("fill",function(d) {return rateByIdCImp_temp[d.properties.NAME]==null? '#d3d3d3' : colorRed(rateByIdCImp_temp[d.properties.NAME]);})
                                                                .attr("id",function(d) {
                                                                            return d.properties.NAME;})
                                                                .style("opacity", 1);
                                            });

    country_imp_barchart.append("g")
            .attr("class", "y axis")
            .call(xAxis_imp)
            .attr("transform","translate("+ 0 +","+ 40+")")
            .selectAll("text").style("text-anchor","start")
            .attr("dx",".4em")
            .attr("dy",".15em")
            .attr("transform","rotate(-65)");

d3.select("#country-name").selectAll("div").data(sortedCImp15).enter().append("div").text(function(d){return getCountryName(d);});

  var x_exp = d3.scale.linear()
                .range([1,barchartHeight-1])
                .domain([0,Number(allsortedState_CImp[0])]);

  var xAxis_exp = d3.svg.axis().scale(x_exp).orient("top");

  var country_exp_barchart = d3.select("#country-export")
                               .append("svg")
                               .attr("id","country-exp-barchart")
                               .attr("width",barchartWidth+"px")
                               .attr("height",barchartHeight+160+"px");

  var country_exp_bar = d3.select("#country-exp-barchart").selectAll(".bar")
                          .data(sCExp15).enter()
                          .append("rect").attr("class","bar_country_exp")
                          .attr("id",function(d){return d.COUNTRY;})
                          .attr("y",function(d,i){return 25*i;})
                          .attr("x",function(d){return 0;})
                          .attr("height",yLength+"px")
                          .attr("width",function(d){return x_exp(d.COUNTRY_VAL);})
                          .attr("transform","translate("+ 0+","+ 40+")")
                          .on("click",function(d){
                            var rateByIdCImp_temp = {};
                            var jsontemp = filterJSON(jsonArr_Exp,"CTY_CODE",this.id);
                            jsontemp.forEach(function(d){
                                    rateByIdCImp_temp[d.STATE] = +d.GEN_VAL_YR;
                                  });
                                     d3.select("#map-container").selectAll(".region").remove();
                                     d3.select("#svg-color-quant").remove();
                                    barSelect = d3.select("html").select("body").select("#row2")
                                                  .select("#map-container").append("g").attr("class","region")
                                                  .selectAll("path")
                                                  .data(topojson.feature(map, map.objects.collection).features)
                                                  .enter().append("path")
                                                  .attr("d", path)
                                                  .attr("fill",function(d) {return rateByIdCImp_temp[d.properties.NAME]==null? '#d3d3d3' : colorRed(rateByIdCImp_temp[d.properties.NAME]);})
                                                  .attr("id",function(d) {return d.properties.NAME;})
                                                  .style("opacity", 1);
                                            });

    country_exp_barchart.append("g")
            .attr("class", "y axis")
            .call(xAxis_exp)
            .attr("transform","translate("+ 0 +","+ 40+")")
            .selectAll("text").style("text-anchor","start")
            .attr("dx",".4em")
            .attr("dy",".15em")
            .attr("transform","rotate(-65)");


};

function getCountryImpData(jsonArrCImp0){
  var rateByIdCImp = {};
  var nameByIdCImp = {};

    var sortedCountryCImp = jsonArrCImp0.map(cty).sort(d3.ascending);   // get country code
    var countryName=unique(sortedCountryCImp);

    var sumByCountry_json = [];
    
    for (i=0;i<countryName.length;i++){
        var sumByCountry = 0;
        var countries_json = [];
      countries_json = filterJSON(jsonArrCImp0,'CTY_CODE',countryName[i]);

      for (j=0;j<countries_json.length;j++){
          sumByCountry = sumByCountry*1+Number(countries_json[j].GEN_VAL_YR);
      };

      sumByCountry_json.push({
        COUNTRY_VAL: Number(sumByCountry)/(1000000),
        COUNTRY: countryName[i],
        YEAR: jsonArrCImp0[1].YEAR,
        NAICS: jsonArrCImp0[1].NAICS,
      });
    };

   var plot_Country_imp = sumByCountry_json;

   var plot_Country_imp2 = plot_Country_imp.sort(function(a,b){
        return -parseFloat(a.COUNTRY_VAL) + parseFloat(b.COUNTRY_VAL);
   }).splice(0,15);

   return plot_Country_imp2;
};   //getCountryImpData Ends

function getCountryExpData(sortedImp,jsonArrCExp){

    var sortedCountryCExp = jsonArrCExp.map(cty).sort(d3.ascending);   // get country code

    var countryName=unique(sortedCountryCExp);      //all possible country code

    var sumByCountry_json = [];
    
    for (i=0;i<countryName.length;i++){
        var sumByCountry = 0;
        var countries_json = [];

        countries_json = filterJSON(jsonArrCExp,'CTY_CODE',countryName[i]);

      for (j=0;j<countries_json.length;j++){
          sumByCountry = sumByCountry+Number(countries_json[j].GEN_VAL_YR);
      };

      sumByCountry_json.push({
        COUNTRY_VAL: Number(sumByCountry)/(1000000),
        COUNTRY: countryName[i],
        YEAR: jsonArrCExp[1].YEAR,
        NAICS: jsonArrCExp[1].NAICS,
      });
    };

   var plot_Country_exp = sumByCountry_json;
  

   var CExp15 = [];
    for (var i=0;i<sortedImp.length;i++){
       arrAdded = filterJSON(plot_Country_exp ,"COUNTRY",sortedImp[i].COUNTRY);

       for (j=0;j<arrAdded.length;j++){
    CExp15.push({
        COUNTRY_VAL: arrAdded[j].COUNTRY_VAL,
        COUNTRY: arrAdded[j].COUNTRY,
        YEAR: arrAdded[0].YEAR,
        NAICS: arrAdded[0].NAICS,
      });
    };
  };
         
  return CExp15;
};



  function getCountryName(data2) {

        for (var indicator in country){
            if (country[indicator].Code==data2.COUNTRY){
              return country[indicator].Name;
            }
         }
    };
//End: Draw Country Bar

};// End: Ready2




function val(d) {return d.GEN_VAL_YR;};
function state(d) {return d.STATE;};
function year(d) {return d.year;};
function naics(d) {return d.NAICS;};
function cty(d) {return d.CTY_CODE;};
function state_val(d) {return d.STATE_VAL;};
function country_val(d) {return d.COUNTRY_VAL;};

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

function filterJSON2(json, key, value) {
    var result = [];
    for (var indicator in json) {
        if (json[indicator][key] === value) {
            result.push(json[indicator] || null);
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
   .attr("transform", "translate(830,320)").attr("id","colorbar_unit");

var colorLegend = d3.legend.color()
                    .orient("vertical")
                    .title("Million dollar")
                    .scale(label_Ordinal);

svg_bar.select(".legendOrdinal")
   .call(colorLegend);

};
