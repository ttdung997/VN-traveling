//VARIABLES
var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var labelIndex = 0;

var map;
var markers = [];
var flightPath;

//FUNCTIONS
function initMap() {
    map = new google.maps.Map(document.getElementById('map'),
        {
            center: { lat: 21.03, lng: 105.76 },
            zoom: 10
        });

    map.addListener('click', function (e) {
        createMarker("", e.latLng.lat(), e.latLng.lng());
    });
}

function createMarker(name, lat, lng) {
    removeFlightPath();

    var id = getNextMarkerId();

    var marker = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        label: id,
        map: map
    });
    //map.panTo(latLng);

    markers.push(marker);

    var html = "";
    html += '<tr>';
    html += '   <th id="row' + markers.length + '" scope="row">' + markers.length + '</th>';
    html += '   <td>' + id + '</td>';
    html += '   <td><input type="text" class="form-control" maxlen="20" value="' + name + '" /></td>';
    html += '   <td>' + lat + '</td>';
    html += '   <td>' + lng + '</td>';
    html += '   <td><button class="btn btn-danger remove" tabindex="-1">Remove</button></td>';
    html += '</tr>';
    $("tbody").append(html);
}

function getNextMarkerId() {
    return labels[labelIndex++ % labels.length];
}

function importLocations() {
    var file = document.getElementById('fileChooser').files[0];

    if (file != null) {
        var reader = new FileReader();

        reader.onload = function (e) {
            var data = reader.result;

            processData(data);
        }

        reader.readAsText(file, "UTF-8");
    }
}

function processData(data) {
    removeAllMarkers();

    var allTextLines = data.split(/\r\n|\n/);

    for (var i = 1; i < allTextLines.length; i++) {
        var data = allTextLines[i].split(',');

        createMarker(data[1], parseFloat(data[2]), parseFloat(data[3]));
    }

    map.setCenter({ lat: 47.545763, lng: 7.594920 })
    map.setZoom(2);
}

function renumberRows() {
    var number = 1;

    $('tbody').children('tr').each(function () {
        var th = $(this).children('th');
        $(th).attr('id', 'row' + number);
        $(th).html(number);

        number++;
    });
}

function removeMarker(rowId) {
    removeFlightPath();

    var id = rowId.substring(3);
    var marker = markers[id - 1];
    marker.setMap(null);
    markers.splice(id - 1, 1);
}

function removeAllMarkers() {
    removeFlightPath();

    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
    labelIndex = 0;

    $('tbody').empty();
}

function removeFlightPath() {
    $('#solution').html(' ');

    if (this.flightPath != null) {
        this.flightPath.setMap(null);
    }
}

function calculate() {
    $('#solution').html(' ');
    var startIndex = 0;

    var alg = new TSPAlgorithm(this.markers, startIndex);
    alg.calculate();


    if (alg.solutions.length > 0) {
        var solution = alg.solutions[alg.solutions.length - 1];

        var totalCosts = solution.totalCosts / 1000; //from m to km
        totalCosts = $.number(totalCosts, 2, '.', '\'');

        $('#solution').html(' Cung đường gợi ý: ');

        var i;
        var flightPlanCoordinates = new Array(solution.path.length + 1);
        var markerLabels = new Array(solution.path.length + 1);

        for (i = 0; i < solution.path.length; i++) {
            var index = solution.path[i];

            flightPlanCoordinates[index] = this.markers[i].getPosition();
            markerLabels[index] = this.markers[i].getLabel();
        }

        flightPlanCoordinates[flightPlanCoordinates.length - 1] = flightPlanCoordinates[0];
        markerLabels[markerLabels.length - 1] = markerLabels[0];

        var solutionText = '';
        for (i = 0; i < markerLabels.length; i++) {
            solutionText += markerLabels[i];

            if (i < (markerLabels.length - 1)) {
                solutionText += ', ';
            }
        }
        $('#solution').append(solutionText);

        //GOOGLE MAPS LINE
        flightPath = new google.maps.Polyline({
            path: flightPlanCoordinates,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2,
            icons: [{
                icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
                offset: '100%',
                repeat: '150px'
            }]
        });
        flightPath.setMap(this.map);
$('#solution').append('; Tổng khoảng cách: ' + totalCosts + ' km');
    } else {
        $('#solution').html('Không tìm thấy giải pháp!');
    }
}