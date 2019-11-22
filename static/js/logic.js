// Go to earthquake.usgs.gov and click on the first link of the Past 7 Days `Significant Earthquakes`
var earthquackUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
console.log(earthquackUrl);
var tectonicUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
console.log(tectonicUrl);

// Perfomr e Get request to the query URL
d3.json(earthquackUrl, function(data) {
    // Once we get a response, send the data.features object to the createFeatues function
    createFeatures(data.features);
});

function createFeatures(earthquacData) {
    var earthquakes = L.geoJSON(earthquacData, {  
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the information
    onEachFeature: function(feature, layer) {
        layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3>\
            <h3>Magnitude: ${feature.properties.mag}</h3>\
            <hr><p>Time: ${new Date(feature.properties.time)}</p>`);
    },
    pointToLayer: function(feature, latlng){
        return new L.circle(latlng, {
            radius:getRadius(feature.properties.mag),
            fillColor:colors(feature.properties.mag),
            fillOpacity:.9,
            stroke:false,
        })
    } 

    

    // Create a GeoJSON layer containing the features arrayon the earthquakeData object
    // Run the OnEachFeature function once fo each piece of data in the array
    
});
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {
    
    // Define map layers
    var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken:API_KEY
    });

    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken:API_KEY
    });


    var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken:API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Street Map" : streetmap,
        "Dark Map": darkmap,
        "Satellite Map": satellite
    };

    var tectonicplates = new L.LayerGroup();

    var overlyMaps = {
        Earthquakes: earthquakes,
        Boundaries : tectonicplates
    };

    
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 2.5,
        layers:[darkmap, earthquakes, tectonicplates]
    });

    d3.json(tectonicUrl, function(plateData){
        L.geoJSON(plateData,{
            color:"gold",
            weight : 1
        })
        .addTo(tectonicplates);
    });

    // Create a layer control
    // Pass in our baseMaps and overlyMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlyMaps, {
        collapsed: false
    }).addTo(myMap);


    

    // Setup the legend
    var legend = L.control({position: "bottomright"}) ;
    legend.onAdd = function() {
        var div = L.DomUtil.create('div', 'info legend')
        var limits = [0, 1, 2, 3, 4, 5]
        var labels = []

        
        // Add min & max
        var legendInfo = "<h1>Magnitude limit</h1>" +
            "<div class=\"labels\">" +
                "<div class=\"min\">"+limits[0]+"</div>" +
                "<div class=\"max\">"+limits[limits.length - 1]+"</div>" +
            "</div>"

        div.innerHTML = legendInfo;

        limits.forEach(function(limit, index) {
            labels.push("<li style=\"background-color: " + colors(index+1) + "\"></li>");
        });
        
        div.innerHTML += "<ul>"+ labels.join("") + "</ul>"
        return div
        
    }

    // Adding legend to the map
    legend.addTo(myMap);

}


function getRadius(value){
    return value*25000
}


function colors(magnitude) {
    return magnitude > 5 ? "red":
        magnitude > 4 ? "orange":
        magnitude > 3 ? "yellow":
        magnitude > 2 ? "lime":
        magnitude > 1 ? "palegreen" :
        "lightgreen" ; // default
}



