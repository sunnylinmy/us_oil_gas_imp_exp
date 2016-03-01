   sumByState_json.forEach(function(d) {
      rateById[d.STATE] = +d.STATE_VAL;
      nameById[d.STATE] = d.STATE;
  });

var svg = d3.select("#map-container").attr("height",height);

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
                                                      var state_Country_imp = filterJSON(jsonArr_Imp,'STATE',this.id);
                                                      var plot_State_imp = state_Country_imp.sort(function(a,b){
                                                                      return d3.descending(val(a),val(b));
                                                          }).splice(0,15);
                                                      console.log(plot_State_imp);
                                                      var state_Country_exp = filterJSON(jsonArr_Exp,'STATE',this.id);
                                                      var plot_State_exp = state_Country_exp.sort(function(a,b){
                                                                      return d3.descending(val(a),val(b));
                                                          }).splice(0,15);
                                                      var allsortedState_imp = jsonArr_Imp.map(val).sort(d3.ascending); 
                                                      var allsortedState_exp = jsonArr_Exp.map(val).sort(d3.ascending);   
                                                      var x_imp = d3.scale.ordinal()
                                                                    .domain(plot_State_imp.map(function(d){return getCountryName(d);}))
                                                                    .range(plot_State_imp.map(function(d,i){return 25*i+10;}));
                                                      var x_exp = d3.scale.ordinal()
                                                                    .domain(plot_State_exp.map(function(d){return getCountryName(d);}))
                                                                    .range(plot_State_exp.map(function(d,i){return 25*i+10;}));
                                                      var xAxis_imp = d3.svg.axis().scale(x_imp).orient("bottom");
                                                      var xAxis_exp = d3.svg.axis().scale(x_exp).orient("bottom");
                                                      var xLength = 25;
                                                      var yHeight_imp =  d3.scale.linear()
                                                                           .domain([Number(allsortedState_imp[allsortedState_imp.length-1]),Number(allsortedState_imp[0])])
                                                                           .range([barchartHeight,2]);
                                                      var yHeight_exp = d3.scale.linear()
                                                                           .domain([Number(allsortedState_exp[allsortedState_exp.length-1]),Number(allsortedState_exp[0])])
                                                                           .range([barchartHeight,2]);
                                                      var y_imp = d3.scale.linear()
                                                                          .range([1,barchartHeight-1])
                                                                          .domain([Number(allsortedState_imp[allsortedState_imp.length-1])/(1000000),Number(allsortedState_imp[0])/(1000000)]);
                                                      var y_exp = d3.scale.linear().range([1,barchartHeight-1])
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

                                                            function getCountryName(data2) {
                                                                      for (var indicator in country){
                                                                                if (country[indicator].Code==data2.COUNTRY){
                                                                                        return country[indicator].Name;
                                                                                         }
                                                                                      }
                                                                        };