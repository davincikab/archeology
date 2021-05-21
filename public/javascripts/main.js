var layerChildrens, activeChildren = [], artefactsContainer = document.getElementById("artefacts-item");
var layerItems = document.querySelectorAll(".layer-item .layer-overlay");

console.log(layerItems);
var map = L.map('map').setView([44.5131, -64.2928], 16);

L.tileLayer('http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
    maxZoom:18
}).addTo(map);

// divIcon
var divMarker = L.divIcon({
    className:"div-marker"
});

var artefacts = L.geoJSON(null, {
    onEachFeature:function(feature, layer) {
        let popupString = "<div class='popup-content'>"+
        "<h6 class='title'>"+ feature.properties.name + "</h6>"+
        "<table>"+
            "<tr><td class='itemKey'>Origin</td> <td>"+ feature.properties.origin +"</td></tr>"+
            "<tr><td class='itemKey'>Discovery</td> <td>"+ feature.properties.discovery +"</td></tr>"+
            "<tr><td class='itemKey'>Age</td> <td>"+ feature.properties.age +"</td></tr>"+
        "</table>"+
        "</div>";

        layer.bindPopup(popupString);
    },
    pointToLayer:function(feature, latLng) {
        return L.marker(latLng, { icon:divMarker });
    }
}).addTo(map);

fetch("/artefacts/")
.then(res => res.json())
.then(data => {
    console.log(data);
    let { artefact: { json_build_object }} = data;
    artefacts.addData(json_build_object);

    // update artefacts origin
    let origin = json_build_object.features.map(feature => feature.properties.origin);
    origin = [...new Set(origin)];
    activeChildren = origin;

    // update the child elements
    let childItems = origin.map(entry => {
        let nameId = entry.split(" ").join("-");
        return `<div class="layer-child">
            <input type="checkbox" name="${nameId}" data-id="${entry}" data-layer="artefacts" class="item-child" checked>
            <label for="research">${entry}</label>
        </div>`;
    });

    artefactsContainer.innerHTML += childItems.join("");
   
    // update the 
    toggleChildren();

    // artefactCheckbox.onchange = (e) => toggleLayer(e);
    console.log(origin);
})
.catch(err => console.error);

var researchAreas = L.geoJSON(null, {
    filter:function(feature) {
        return feature.properties.name != "Oak Island" ? true : false;
    },
    style:function(feature) {
        return {
            fillColor:'#d3d3d3',
            fillOpacity:0.9,
            color:'red',
            weight:2,
            dashArray:[2,5],
            className:'research-areas'
        }
    },
    onEachFeature:function(feature, layer) {
        // popups
        let popupString = "<div class='popup-content'>"+
        "<h6 class='title'>"+ feature.properties.name + "</h6>"+
        "<table>"+
            "<tr><td class='itemKey'>Time Start</td> <td>"+ feature.properties.time_start +"</td></tr>"+
            "<tr><td class='itemKey'>Time Stop</td> <td>"+ feature.properties.time_stop +"</td></tr>"+
            "<tr><td class='itemKey'>Type</td> <td>"+ feature.properties.type +"</td></tr>"+
        "</table>"+
        "</div>";

        layer.bindPopup(popupString).openPopup();
    }
}).addTo(map);

var oakIsland = L.geoJSON(null, {
    filter:function(feature) {
        return feature.properties.name == "Oak Island" ? true : false;
    },
    style:function(feature) {
        return {
            fillColor:'transparent',
            color:'green',
            weight:2
        }
    }
}).addTo(map);


fetch("/research-areas/")
.then(res => res.json())
.then(data => {
    console.log(data);
    let { research: { json_build_object }} = data;

    researchAreas.addData(json_build_object);
    oakIsland.addData(json_build_object);

    oakIsland.bringToBack();
})
.catch(err => console.error);

// time slider
L.control.timelineSlider({
    timelineItems: [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
    activeColor:'#2ca82a',
    extraChangeMapParams: {greeting: "Hello World!"}, 
    changeMap: changeMapFunction })
.addTo(map);

function changeMapFunction({label, value, map, exclamation} ) {
    let year = label;

    // filter the respective data
    artefacts.eachLayer(layer => {
        // update opacity
        let discoveryDate = new Date(layer.feature.properties.discovery);
        if(discoveryDate.getFullYear() <= year) {
            layer.setOpacity(1);
        } else {
            layer.setOpacity(0);
        }
    });

    researchAreas.eachLayer(layer => {
        // update opacity
        let timeStop = new Date(layer.feature.properties.TIME_STOP);

        if(timeStop.getFullYear() <= year) {
            layer.setStyle({
                opacity:1,
                fillOpacity:1
            });
        } else {
            layer.setStyle({
                opacity:0,
                fillOpacity:0
            });
        }
    });
}

var overlays = {
    'research':researchAreas,
    'artefacts':artefacts
};

// custom layer control
layerItems[0].onchange = (e) => toggleLayer(e);
layerItems[1].onchange = (e) => {
    // check or uncheck
    let { checked } = e.target;
    console.log(layerChildrens);

    layerChildrens.forEach(layerChild => {
        layerChild.checked = checked;
    });

    toggleLayer(e);
};

function toggleLayer(e) {
     // get thec checkbox value
     let target = e.target;
     let { checked, id } = target;

     // toggle the layer respectively
     let layer = overlays[id];

     if(checked) {
         layer.addTo(map);
     } else {
         map.removeLayer(layer);
     }
}

// toggle children layer
function toggleChildren() {
    layerChildrens = document.querySelectorAll(".item-child");
    layerChildrens.forEach(layerChild => {
        layerChild.onchange = function(e) {
            // get thec checkbox value
            let target = e.target;
            let { checked, dataset} = target;

            let { id } = dataset;

            console.log(id);
            if(checked) {
                activeChildren.push(id);
            } else {
                activeChildren = activeChildren.filter(childLayer => childLayer != id);
            }

            fillterArtefactsByOrigin(activeChildren);
        }
    });
}

function fillterArtefactsByOrigin(activeChildren) {
    artefacts.eachLayer(layer => {

        if(activeChildren.indexOf(layer.feature.properties.origin) == -1) {
            // 
            // console.log(layer);
            layer.setOpacity(0);
        } else {
            layer.setOpacity(1);    
        }
    })
}