   //load data
   let dataPath = "data/2019.csv"

   //set up chart for Map
   var svg = d3.select("svg");
   width = +svg.attr("width");
   height = +svg.attr("height");

   // Map and projection
   var path = d3.geoPath();
   var projection = d3.geoNaturalEarth()
       .scale(width / 2 / Math.PI)
       .translate([width / 2, height / 2])
   var path = d3.geoPath()
       .projection(projection);

   // Data and color scale
   //https://github.com/d3/d3-scale-chromatic/blob/master/README.md
   var happiness = d3.map();
   var colorScheme = d3.schemePuBuGn[7]; //schemeRdGy: Low vs. High, //neutral: SchemeBlues //schemePuBuGn : ok
   //colorScheme.unshift("#eee")
   var colorScale = d3.scaleThreshold()
       //.domain([2, 3, 4, 5, 6, 7, 8])
       .domain(d3.range(2, 8))
       .range(colorScheme);

   //Legend Scaling
   var x = d3.scaleLinear()
       .domain([1, 8])
       .rangeRound([80, 860]);

   var g = svg.append("g")
       .attr("class", "key") //legend class name
       .attr("transform", "translate(10, 20)"); //position of legend

   g.selectAll("rect")
       .data(colorScale.range().map(function(d) {
           d = colorScale.invertExtent(d);
           //define end of legend
           if (d[0] == null) d[0] = x.domain()[0];
           if (d[1] == null) d[1] = x.domain()[1];
           return d;
       }))
       .enter().append("rect")
       .attr("height", 8) //legend height
       .attr("x", function(d) {
           return x(d[0]);
       })
       .attr("width", function(d) {
           return x(d[1]) - x(d[0]);
       })
       .attr("fill", function(d) {
           return colorScale(d[0]);
       });

   g.append("text")
       .attr("class", "caption")
       .attr("x", x.range()[0])
       .attr("y", -10) //position of legendname
       .attr("fill", "#000")
       //.attr("text-anchor", "end")
       //.attr("font-weight", "bold")
       .attr("font-size", "small")
       .attr("float", "center")
       .text("Happiness Score");

   //Labelling of legend
   g.call(d3.axisBottom(x)
           .tickSize(9)
           .tickFormat(function(x, i) {
               return i ? x : x;
           })
           .tickValues(colorScale.domain()))
       .select(".domain")
       .remove();

   // Load data and boot
   let promises = [
       d3.json("//enjalot.github.io/wwsd/data/world/world-110m.geojson"),
       d3.csv("data/2019.csv", d => {
           happiness.set(d.Country, +d.Score);
       })
   ]

   Promise.all(promises)
       .then(function(data) {
           console.log(data[0])

           //https://www.d3-graph-gallery.com/graph/choropleth_hover_effect.html
           //http://bl.ocks.org/palewire/d2906de347a160f38bc0b7ca57721328http://bl.ocks.org/palewire/d2906de347a160f38bc0b7ca57721328

           //display map with tooltip
           svg.append("g").attr("class", "countries")
               .selectAll("path")
               .data(data[0].features) //geojson data features
               .enter()
               .append("path").attr("fill", d => {
                   d.score = happiness.get(d.properties.name) || 0;
                   return colorScale(d.score);
               })
               .attr("d", path)
               .on("mouseover", function(d) {
                   if (d.score > 0) {
                       d3.select("#tooltip")
                           .style("visibility", "visible")
                           .style("opacity", 1)
                           .html(`<strong>${d.properties.name} </strong> reports a happiness score of <strong> ${d.score} </strong>`) //<span style = "color: orange"></span>
                           //console.log(d)
                   } else {
                       d3.select("#tooltip")
                           .style("visibility", "visible")
                           .style("opacity", 1)
                           .html(`No score record of  <strong>${d.properties.name} </strong>`)
                   }
                   d3.selectAll(".countries")
                       .transition()
                       .duration(200)
                       .style("opacity", .8)
                   d3.select(this)
                       .transition()
                       .duration(200)
                       .style("opacity", 1)
                       .style("stroke", "white")
               })
               .on("mouseout", function() {
                   d3.select("#tooltip").style("opacity", 0)
                   d3.selectAll(".countries")
                       .transition()
                       .duration(200)
                       .style("opacity", 1)
                   d3.select(this)
                       .transition()
                       .duration(200)
                       .style("stroke", "transparent")
               })
               .on("mousemove", function() {
                   d3.select("#tooltip")
                       .style("top", (d3.event.pageY - 10) + "px")
                       .style("left", (d3.event.pageX + 10) + "px");
               })

           d3.select("body")
               .append("div")
               .attr("id", "tooltip")
               .style("opacity", 0)
               .attr("class", "tooltip")
               .style("position", "absolute")
               .style("z-index", "10")
               .style("visibility", "hidden")
       })

   //http://bl.ocks.org/herrstucki/6199768/23f51b97bd942f6b1b7cf0b9ba76ada4cb6d1cc7

   ////FLOWER CHART//////

   //constants
   var width = 200,
       height = 125,
       petals = 6,
       halfRadius = 18;

   var margin = {
       top: 0,
       right: 30,
       bottom: 0,
       left: 40
   }

   var size = d3.scaleSqrt()
       .domain([0, 2])
       .range([15, halfRadius]);


   //load data
   d3.csv(dataPath)
       .then(data => {
           console.log(data)

           ////PREPARE CHART/////

           //svg for flower chart
           var flower_svg = d3.select("#flower-chart").selectAll("svg")
               .data(data)
               .enter().append("svg")
               .attr("width", width)
               .attr("height", height)
               .attr("id", d => {
                   let name = d.Country.toUpperCase()
                   return name
               })

           //appended circle and text
           var circle = flower_svg.append("text")
               .attr("id", d => {
                   return d.Rank
               })
               .attr("class", "rank")
               //.attr("r", 15)
               .text(d => {
                   return d.Rank
               })
               .attr("transform", "translate(" + 82 + "," + 70 + ")")
               .style("text-align", "center")
               .style("font-weight", "bold")
               .style("fill", "black")
               .style("font-size", "20px")
               .append("g")
           flower_svg.append("text")
               .text(d => {
                   return d.Country
               })
               .style("text-align", "center")
               .attr("x", width / 10)
               .attr("y", height / 6)
               .style("class", "title")
               .style("opacity", 0.5)


           /////PREPARE DATA /////

           // let extent_happiness = d3.extent(data, d => {
           //         return parseFloat(d.Score)
           //     })
           //     // console.log(extent_happiness)

           let radiusExtent = d3.extent(data, function(d) {
               return parseFloat(d.Social_support) //largest values - orientation
           })
           console.log(radiusExtent)

           let minWidth = 5
           let maxWidth = 22

           let scaleR = d3.scaleLinear()
               .range([minWidth, maxWidth])
               .domain(radiusExtent)

           var pie = d3.pie()
               .sort(null)
               .value(function(d) {
                   return scaleR(d.size)
               });

           let petalData = new Object()
           let eachPetal = new Object()

           //prepare all data to retrieve petal length for each attribute of each country

           for (let i = 0; i < data.length; i++) {
               let d = data[i]
               petalData[d.Rank] = {
                   country: d.Country,
                   size1: d.gdp,
                   size2: d.Social_support,
                   size3: d.Healthy_life_expectancy,
                   size4: d.Freedom,
                   size5: d.Generosity,
                   size6: d.Perceptions_of_corruption,
                   size1_name: "GDP",
                   size2_name: "Social Support",
                   size3_name: "Healthy Life Expectancy",
                   size4_name: "Freedom",
                   size5_name: "Generosity",
                   size6_name: "Perceptions of Corruption"
               }
           }
           // console.log(petalData);
           // console.log(petalData[1].size1)

           //data used for each petal
           for (let x = 0; x < data.length; x++) {
               let d = data[x]
               eachPetal[d.Rank] = {
                   id: d.Rank,
                   Score: d.Score,
                   petals: d3.range(petals).map(
                       o => {
                           //console.log(petalData[d.Rank][`size${i}`])
                           return {
                               size: petalData[d.Rank][`size${o+1}`],
                               label: petalData[d.Rank][`size${o+1}_name`],
                               country: d.Country,
                               total: d.Score
                           }

                       })
               }
           }
           console.log(eachPetal);

           var flower = flower_svg
               .append('g')
               .attr("width", width / 2)
               .attr("height", height / 2)
               .attr("class", `flower`)
               // .attr("id", d => {
               //     return d.Country
               // })
               .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")")

           d3.select("body")
               .append("div")
               .attr("id", "flower-tooltip")
               .style("opacity", 0)
               .attr("class", "flower-tooltip")
               .style("position", "absolute")
               .style("visibility", "hidden")


           var petal = flower.selectAll(".petal")
               .data(d => {
                   return pie(eachPetal[d.Rank].petals)
               })
               .enter().append("path")
               .attr("class", "petal")
               .attr("transform", function(d) {
                   return r((d.startAngle + d.endAngle) / 2);
               })
               .attr("d", petalPath)
               .style("stroke", petalStroke)
               .style("fill", petalFill)
               .on("mouseover", function(d) {
                   d3.select("#flower-tooltip")
                       .style("visibility", "visible")
                       .style("opacity", 1)
                       .html(`<strong>${d.data.label} </strong> scored <strong> ${d.data.size} </strong>. <br>Total: ${d.data.total}`) //<span style = "color: orange"></span>
                   d3.selectAll(".flower")
                       .transition()
                       .duration(200)
                       .style("opacity", .8)
                   d3.select(this)
                       .transition()
                       .duration(200)
                       .style("opacity", 1)
                       .style("stroke", "white")
               })
               .on("mouseout", function() {
                   d3.select("#flower-tooltip").style("opacity", 0)
                   d3.selectAll(".flower")
                       .transition()
                       .duration(200)
                       .style("opacity", 1)
                   d3.select(this)
                       .transition()
                       .duration(200)
                       .style("stroke", "black")
               })
               .on("mousemove", function() {
                   d3.select("#flower-tooltip")
                       .style("top", (d3.event.pageY - 10) + "px")
                       .style("left", (d3.event.pageX + 10) + "px");
               })


       })

   function searchCountry() {
       let input = document.getElementById("countrySearch").value
       let filter = input.toUpperCase()
       console.log(input, filter)
       let flowers = document.getElementById("flower-chart")
       let li = flowers.getElementsByTagName("svg")
       console.log(li)

       for (let i = 0; i < li.length; i++) {
           let id = li[i].id
           if (id.indexOf(filter) > -1) {
               li[i].style.display = ""
           } else {
               li[i].style.display = "none"
           }
       }
   }

   function reset() {
       document.getElementById("countrySearch").value = ""
       document.getElementById("gdp").style.display = "none"
       document.getElementById("life").style.display = "none"
       document.getElementById("social").style.display = "none"
       document.getElementById("freedom").style.display = "none"
       document.getElementById("generosity").style.display = "none"
       document.getElementById("corruption").style.display = "none"

       searchCountry()
   }

   function petalPath(d) {
       var angle = (d.endAngle - d.startAngle) / 2,
           s = polarToCartesian(-angle, halfRadius),
           e = polarToCartesian(angle, halfRadius),
           r = size(d.data.size),
           m = {
               x: halfRadius + r,
               y: 0
           },
           c1 = {
               x: halfRadius + r / 2,
               y: s.y
           },
           c2 = {
               x: halfRadius + r / 2,
               y: e.y
           };
       return "M0,0L" + s.x + "," + s.y + "Q" + c1.x + "," + c1.y + " " + m.x + "," + m.y + "L" + m.x + "," + m.y + "Q" + c2.x + "," + c2.y + " " + e.x + "," + e.y + "Z";
   };

   function petalFill(d, i) {
       return d3.hcl(i / petals * 360, 60, 70);

   };

   //https://bl.ocks.org/mbostock/3e115519a1b495e0bd95

   function petalStroke(d, i) {
       return d3.hcl(i / petals * 360, 50, 40);
   };

   function r(angle) {
       return "rotate(" + (angle / Math.PI * 180) + ")";
   }

   function polarToCartesian(angle, radius) {
       return {
           x: Math.cos(angle) * radius,
           y: Math.sin(angle) * radius
       };
   };

   //when the page loads
   window.onload = () => {
       reset()
   }

   function displayLegend(paragraph) {
       console.log("works")
       paragraph.toString()
       console.log(paragraph)
       document.getElementById(paragraph).style.display = ""
   }

   //info 
   let report = "World Happiness Report 2019"
   let reportLink = report.link("https://worldhappiness.report/ed/2019/changing-world-happiness/");
   let data = "Data available on Kaggle"
   let dataLink = data.link("https://www.kaggle.com/unsdsn/world-happiness#2019.csv")

   let info = document.getElementById("source")
   let p = document.createElement("div")
   let d = document.createElement("div")
   p.innerHTML = reportLink
   d.innerHTML = dataLink
   info.appendChild(p)
   info.appendChild(d)