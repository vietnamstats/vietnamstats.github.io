function initialise() {
    //Team Search filter
    if (document.URL.indexOf('teamsearch') > -1) {
        var teamname = findGetParameter('teamsearch');
        if (teamname != '') {
            teamname = teamname.replace(/[+]/g, ' ');
            myData = myData.filter(function(el) {
                return el.team == teamname;
            });
            document.getElementById('searchterm').value = teamname;
        }
    }

    //V.League 1 only switch filter
    if (document.URL.indexOf('vleague1') > -1) {
        var bigleague = findGetParameter('vleague1');
        if (bigleague == 'Yes') {
            myData = myData.filter(function(el) {
                return el.league == 'V.League 1';
            });
        }
    }

    //National Teams only switch filter
    if (document.URL.indexOf('nationalteams') > -1) {
        var bigleague = findGetParameter('nationalteams');
        if (bigleague == 'Yes') {
            myData = myData.filter(function(el) {
                return el.league == 'National';
            });
        }
    }

    //Capacity filter
    if (document.URL.indexOf('lowerbounds') > -1) {
        var lowerbounds = findGetParameter('lowerbounds');
        var upperbounds = findGetParameter('upperbounds');
        myData = myData.filter(function(el) {
            return el.capacity >= lowerbounds && el.capacity <= upperbounds;
        });
        document.getElementById('lowerbounds').value = lowerbounds;
        document.getElementById('upperbounds').value = upperbounds;
    }

    function findGetParameter(parameterName) {
        var result = null,
            tmp = [];
        location.search.substr(1).split('&').forEach(function(item) {
            tmp = item.split('=');
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
        return result;
    }

    // create the Leaflet map object and enable fractional zoom to adjust map size granularly.
    var myMap = new L.Map('mapid', {
        zoomSnap: 0.1
    });

    // create the labeled tile layer with correct attribution
    var gsUrl = 'http://mt0.google.com/vt/lyrs=s&hl=vi&x={x}&y={y}&z={z}';
    var gsAttrib = 'Map data &copy;2023 Google';
    var gs = new L.TileLayer(gsUrl, {
        minZoom: 0.5,
        maxZoom: 20,
        attribution: gsAttrib
    });

    var grUrl =
        'http://mt0.google.com/vt/lyrs=r&hl=vi&x={x}&y={y}&z={z}';
    var grAttrib = 'Map data &copy;2023 Google';
    var gr = new L.TileLayer(grUrl, {
        minZoom: 0.5,
        maxZoom: 20,
        attribution: grAttrib
    });


    // set the starting location and zoom of the map
	myMap.setView(new L.LatLng(14.2, 107.0), 6.25);  //Vietnam Maps

    //add different tilelayers to map.
    var baseMaps = {
		Default: gr,
        Satellite: gs
    };

    //add tilelayers selection box to map
    myMap.addLayer(gr);

    //information box overlaid on map to show number of stadiums
    var info = L.control();

    info.onAdd = function(myMmap) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    info.update = function() {
        if (myData.length > 0) {
            this._div.innerHTML = '<h4>Number of Teams</h4>' + '<b>' + myData.length + '</b>';
        } else {
            this._div.innerHTML = '<h4>Number of Stadiums</h4>' + '<b>No Stadiums Found</b>';
        }
    };

    info.addTo(myMap);
    L.control.layers(baseMaps).addTo(myMap);

    //custom icon
    var stadiumIcon = L.icon({
        iconUrl: 'Images/stadium.png'
    });

    // the myData array has been imported in a separate <script> include.
    if (myData) {
        //set up counters for different leagues (used for Chart visualization)
        var vleague1count = 0;
        var vleague2count = 0;
        var seconddivisioncount = 0;
        var thirddivisioncount = 0;
        var nationalteamcount = 0;
        var othercount = 0;

        //here we iterate through the array
        for (var item in myData) {
            var lat = myData[item].latitude; //marker latitude
            var lon = myData[item].longitude; //marker longitude
            var team = myData[item].team; //stadium team affilication
            var logo = myData[item].logo; //team logo
            var league = myData[item].league; //team's league
            var fb = myData[item].fb;
            var web = myData[item].web;

            //switch statement to add to league counters based on value of item's team.
            switch (league) {
                case 'V.League 1':
                    vleague1count++;
                    break;
                case 'V.League 2':
                    vleague2count++;
                    break;
                case 'Second Division':
                    seconddivisioncount++;
                    break;
                case 'Third Division':
                    thirddivisioncount++;
                    break;
                case 'National':
                    nationalteamcount++;
                    break;
                default:
                    othercount++;
            }

            //marker pop-up content with team logo included.
            var popup_content =
                " <div class='w3-container w3-cell'><img src='" +
                logo +
                "' alt='Team Logo' align='bottom' style='width:80px;height:80px;'></div><div class='w3-container w3-cell'><b>Stadium Name:</b> " +
                myData[item].stadium_name +
                '<br><b>Team Name:</b><br> ' +
                team +
                '<br><b>Capacity:</b> ' +
                myData[item].capacity +
                '<br><b>Link:</b> ' +
                '<a target="_blank" rel="noopener noreferrer" href=' + fb + '><img src="./Images/facebook.png" alt="fb" style="width:15px;height:15px;"></a>' + "  " +
                '<a target="_blank" rel="noopener noreferrer" href=' + web + '><img src="./Images/world-wide-web.png" alt="fb" style="width:15px;height:15px;"></a>'
                '</div>';

            //create and add markers and popups to map.
            var marker = L.marker([lat, lon], {
                icon: stadiumIcon
            }).addTo(myMap);
            marker.bindPopup(popup_content);
        }

        //Code for Chart.JS League Breakdown doughnut chart
        var ctx = document.getElementById('myChart').getContext('2d');
        ctx.canvas.width = 400;
        ctx.canvas.height = 200;
        var myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [
                    'V.League 1',
                    'V.League 2',
                    'Second Division',
                    'Third Division',
                    'National Team',
                    'Other'
                ],
                datasets: [
                    {
                        backgroundColor: ['#2ecc71', '#3498db', '#95a5a6', '#9b59b6', '#f1c40f', '#e74c3c', '#34495e'],
                        data: [
                            vleague1count,
                            vleague2count,
                            seconddivisioncount,
                            thirddivisioncount,
                            nationalteamcount,
                            othercount
                        ]
                    }
                ]
            },
            options: {
                responsive: false,
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        boxWidth: 20
                    }
                }
            }
        });
    }

    //Code for Modal (used to display sources)
    var modal = document.getElementById('myModal');

    // Get the button that opens the modal
    var btn = document.getElementById('myBtn');

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName('close')[0];

    // When the user clicks the button, open the modal
    btn.onclick = function() {
        modal.style.display = 'block';
    };

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = 'none';
    };

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    //Autocomplete functionality through jQuery for Team Search
    $(document).ready(function() {
        var availableTags = [];

        //iterate through allData array which has ALL values from the stadiums table - so search box will always have all stadiums available in autocomplete.
        for (var item in allData) {
            var team_name = allData[item].team;
            availableTags.push(team_name);
        }

        $('#searchterm').autocomplete({
            source: availableTags
        });
    });

    //jQuery slider for stadium capacity
    $(function() {
        $('#flat-slider').slider({
            range: true,
            min: 0,
            max: 50000,

            //lowerbounds and upperbounds are set to the value they are given or to default minimum and maximum values.
            values: [$('#lowerbounds').val() || 2000, $('#upperbounds').val() || 50000],
            slide: function(event, ui) {
                $('#amount').val(ui.values[0] + ' - ' + ui.values[1]);
                // when the slider values change, update the hidden fields
                $('#lowerbounds').val(ui.values[0]);
                $('#upperbounds').val(ui.values[1]);
            }
        });
        $('#amount').val($('#flat-slider').slider('values', 0) + ' - ' + $('#flat-slider').slider('values', 1));
    });

    //Back to original maps functionality
    var stateChangingButton = L.easyButton({
        states: [
            {
                stateName: 'zoom-to-original',
                icon: 'fa-undo',
                title: 'zoom to original state',
                onClick: function(btn, map) {
                    map.flyTo([14.2, 107.0], 6.25);
                }
            }
        ]
    });

    //add button to map(shown below zoom in and out buttons)
    stateChangingButton.addTo(myMap);
}