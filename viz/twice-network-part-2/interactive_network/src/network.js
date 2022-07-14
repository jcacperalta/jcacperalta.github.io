
function network(songFile) {

    var nodeSize = 9;
    var width = 800,
        height = 600;

    var members = ['Nayeon','Jeongyeon','Momo','Sana','Jihyo','Mina',
                    'Dahyun', 'Chaeyoung','Tzuyu']
    // colors for nodes
    var colorScheme = d3.scale.ordinal().domain(members)
                      .range(["#00ccff", "#84cc00", "#ffb1b8", "#996de7",
                        "#ffb74d","#1af0af","#eef1ef","#ff1744","#396ad8"])
    
    //Song Name
    var songFiles = ["ALL_SONGS.csv","LikeOohAhh.csv","CheerUp.csv","TT.csv",
        "HeartShaker.csv","KnockKnock.csv","Likey.csv",
        "DanceTheNightAway.csv","WhatIsLove.csv","YesOrYes.csv",
        "Fancy.csv","FeelSpecial.csv","More&More.csv",
        "ICantStopMe.csv","CryForMe.csv","AlcoholFree.csv"]


    var songNames = ["ALL SONGS (2015-2020)","Like Ooh Ahh (2015)","Cheer Up (2016)",
        "TT (2016)", "Heart Shaker (2017)","Knock Knock (2017)",
        "Likey (2017)","Dance The Night Away (2018)","What Is Love (2018) ",
        "Yes or Yes (2018)","Fancy (2019) ","Feel Special (2019)",
        "More&More (2020) ","I Can't Stop Me (2020) ","Cry For Me (2020) ","Alcohol Free (2021) "]

    var findSongName = d3.scale.ordinal().domain(songFiles)
                      .range(songNames)
    songName = findSongName(songFile)



    function createNetwork(links) {
        var nodes = {};
        var linkedByIndex = {};

        var numLinksFromCommon = 0;
        var numLinks = links.length;

        var selected;

        // Compute the distinct nodes from the links.
        links.forEach(function(link) {
            link.source = nodes[link.source] || 
                (nodes[link.source] = {id: link.source,
                 btwn_c: link.source_btwn_c,
                 btwn_c_rank: link.source_btwn_c_rank,
                 eigen_c: link.source_eigen_c,
                 eigen_c_rank: link.source_eigen_c_rank,
                 duration: link.source_duration,
                 duration_rank: link.source_duration_rank
                 });
            link.target = nodes[link.target] || 
                (nodes[link.target] = {id: link.target,
                 btwn_c: link.target_btwn_c,
                 btwn_c_rank: link.target_btwn_c_rank,
                 eigen_c: link.target_eigen_c,
                 eigen_c_rank: link.target_eigen_c_rank,
                 duration: link.target_duration,
                 duration_rank: link.target_duration_rank
                 });
            link.id = link.source.id + '_' + link.target.id;
            if (link.is_common == 1) {
                console.log(link.id +' is common')
                link.type = 'iscommon';
            } else {
                console.log(link.id +' is not common')
                link.type = '';
            }
            numLinksFromCommon = numLinksFromCommon + +link.is_common
            //link.value = +link.value;

            // linkedByIndex is used for link sorting
            linkedByIndex[link.id] = 1;
        });
        console.log(numLinks)
        console.log(numLinksFromCommon)
        console.log(nodes)
        var force = d3.layout.force()
            .nodes(d3.values(nodes))
            .links(links)
            .size([width, height])
            .linkDistance(135)
            .charge(-2500)
            .on("tick", tick)
            .gravity(0.1)
            .start(); 

        // Description of song
        // how many common and noncommon links are there
        var song_desc_div = d3.select("#vis").append("div")   
            .attr("class", "song_description") 

        song_desc_div.transition()        
                .duration(200)      
                .style("opacity", .9);

        

        song_desc_div.html(function (d) {
            return (songName == "ALL SONGS (2015-2020)")?
                "<br/>The ALL SONGS network represents the top 30% most-frequently occurring line succession pairs\
                 in TWICE's Korean title tracks from 2015-2020. This is the network that serves as the most basic \"recipe\" that defines a TWICE song."
                  :
                "<br/><b>" + numLinksFromCommon+ "</b> out of " + numLinks + " unique succession pairs for the song "+ songName + " are from the ALL SONGS network." 
        });
        
        var svg = d3.select("#vis").append("svg")
            .attr("width", width)
            .attr("height", height);

        

        // build the arrow.
        // var container = ;
        var defs = svg.append("g").append("svg:defs");
        var arrows = defs.selectAll("marker")
            .data(["end","end-active","end-iscommon","end-iscommon-active","end-dim"])      // Different link/path types can be defined here
          .enter().append("svg:marker")    // This section adds in the arrows
            .attr("id", String)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 26)
            .attr("refY", -1.5)
            .attr("markerWidth", 8)
            .attr("markerHeight", 8)
            .attr("orient", "auto")
          .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5")

        //defs.select("#end")
        //   .style('fill','#bbb')
        //defs.select("#end-active")
        //    .style('fill','#555')
        //    .style('fill-opacity',1);

        defs.select("#end").attr("class", "arrow")
        defs.select("#end-active").attr("class", "arrow active")
        defs.select("#end-iscommon").attr("class", "arrow iscommon")
        defs.select("#end-iscommon-active").attr("class", "arrow iscommon active")
        defs.select("#end-dim").attr("class", "arrow dim")

        // add the links and the arrows
        var path = svg.append("g")
            .selectAll("path")
            .data(force.links())
            .enter().append("svg:path")
            .attr("class", function(d) { 
                //console.log(d.type);
                return "link " + d.type; })
            .attr("marker-end", function(d) { 
                return (d.type=='iscommon') ?
                "url(#end-iscommon)": "url(#end)"; });
            
        //path.attr("class", "link");

        // define the nodes
        var nodes = svg.selectAll(".node")
            .data(force.nodes())
          .enter().append("g")
            .attr("class", "node")
            .attr("cx", function(d) {
                return d.x;
              })
              .attr("cy", function(d) {
                return d.y;
              })
            .on('mouseover', highlightNode)
            .on('mouseout', unhighlightNode)
            .call(force.drag);

        // add the nodes
        nodes.append("circle")
            .attr("r", 15)
            .style("fill", function (d) { return colorScheme(d.id); })
            .style('stroke-width', 1)
            .style('stroke','#444')
            .style('stroke-opacity',0.9)
            
        // add the text 
        // shadow
        nodes.append("text")
        //    .attr("class", "shadow")    
            .attr("x", 20)
            .attr("dy", ".35em")
            .style('stroke', '#fff')
            .style('opacity', 0.9)
            .style('stroke-width', 3)
            .text(function(d) { return d.id; });
            
        // text on top of shadow
        nodes.append("text")
            .attr("x", 18)
            .attr("dy", ".35em")
            //.style('fill', '#000')
            .text(function(d) { return d.id; });

        // Define the div for the tooltip
        //var div = d3.select("#vis").append("div")   
        //    .attr("class", "tooltip")               
        //    .style("opacity", 0);
        // add the curvy lines

        function tick() {
            path.attr("d", function(d) {
                var dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    dr = Math.sqrt(dx * dx + dy * dy);
                return "M" + 
                    d.source.x + "," + 
                    d.source.y + "A" + 
                    dr + "," + dr + " 0 0,1 " + 
                    d.target.x + "," + 
                    d.target.y;
            });

            nodes
                .attr("transform", function(d) { 
                return "translate(" + d.x + "," + d.y + ")"; });
        }

      /*
      * Callback for mouseover event.
      * Highlights a node and connected edges.
      */
       var trunc_1 = d3.format(".1f");
       var trunc_2 = d3.format(".2f");
       var trunc_3 = d3.format(".3f");

        function tooltipText(d){
            return "<p style='font-size: 11px; text-align: left;'>" + 
                           "<span style='font-weight:900'>" + d.id + "</span></br>" +
                           "Total line duration: " + trunc_1(d.duration) + " secs ("+ d.duration_rank+")</br>"+
                           "Betweenness centrality: " + trunc_3(d.btwn_c) + " ("+ d.btwn_c_rank+")</br>"+
                           "Eigenvector centrality: " + trunc_3(d.eigen_c) + " ("+ d.eigen_c_rank+")</span>";
        }

        function highlightNode(d) {
            // var content = '<p class="main">' + d.id + '</span></p>';
            // content += '<hr class="tooltip-hr">';
            // content += '<p class="main">' + 'Centrality value: ' + truncate_decimal(d.eigen_c) + '</span></p>';
            // tooltip.showTooltip(content, d3.event);

          d3.select(this).select("circle").style('stroke-width', 4.5);
            // tooltip-hr

            let pos = d3.select(this).node().getBoundingClientRect()
            //console.log(pos['x'])
            //Define and show the tooltip over the mouse location
            $(this).popover({
                placement: function(d) { //$this is implicit
                    //console.log((pos['x'],width/2))
                    return (pos['x']<= width/2)?
                     "left":"right"
                    },
                container: 'body',
                mouseOffset: 10,
                followMouse: false,
                trigger: 'click',
                html : true,
                content: tooltipText(d),
                })
            $(this).popover('show');
             
          path
            .attr('class', function (l) {
                if (l.is_common == 1) {
                    return (l.source.id === d.id || l.target.id === d.id) ?
                         "link iscommon active" : "link dim";
                 } else {
                    return (l.source.id === d.id || l.target.id === d.id) ?
                        "link active" : "link dim";
                }
            })

            .attr("marker-end", function (l) {
                if (l.is_common == 1) {
                    return (l.source.id === d.id || l.target.id === d.id) ?
                         "url(#end-iscommon-active)": "url(#end-dim)";
                 } else {
                    return (l.source.id === d.id || l.target.id === d.id) ?
                        "url(#end-active)": "url(#end-dim)";
                }
            });
        }

        function neighboring(a, b) {
            return linkedByIndex[a.id + '_' + b.id] ||
              linkedByIndex[b.id + '_' + a.id];
        }

          /*
          * Callback for mouseout event.
          * Unhighlights node.
          */
        function unhighlightNode() {
            // tooltip.hideTooltip();
            $('.popover').each(function() {
                    $(this).remove();
                }); 

            d3.select(this).select("circle").style('stroke-width', 1)
           
            // reset edges
            path.attr("class", function(d) { 
                    //console.log(d.type);
                     return "link " + d.type; })
                .attr("marker-end", function(d) { 
                    return (d.type=='iscommon') ?
                    "url(#end-iscommon)": "url(#end)"; });
            // reset nodes
            //nodes
            //  .style('stroke', 'white')
            //  .style('stroke-width', 1.0);
        }
    }

    var chart = function (rawData) {
         createNetwork(rawData)
    };

    chart.updateData = function (newData) {
        createNetwork(newData)

    };

    return chart;
}

function updateChart(songFile) {
    // get the data
    // create new network
    d3.select("#vis").selectAll("svg").remove();
    d3.select("#vis").selectAll("div").remove();
    var myNetwork = network(songFile);
    function display(error, data) {
      if (error) {
        console.log(error);
      }
      myNetwork(data);
    }
    d3.csv('data/' + songFile, display);

}

updateChart('ALL_SONGS.csv')
//   // select song drop down
d3.select('#song_select').on('change', function () {
 var songFile = d3.select(this).property('value');
 updateChart(songFile)
});

