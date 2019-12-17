app = new Vue({
    el: '#app',
    data() {
        return {
            api_url: "http://cisc-dean.stthomas.edu:8008",
            map: null,
            tileLayer: null,
            layers: [],
            latitude: 0,
            longitude: 0,
            markers: {},
            address: "",
            maxBounds: L.latLngBounds([44.840591, -93.257777],
                [45.041925, -92.954938]),
            mapBounds: null,
            neighborhoods: [{
                    id: 1,
                    name: "Conway/Battlecreek/Highwood",
                    lat: 44.957561,
                    lon: -93.014738,
                    selected: true
                },
                {
                    id: 2,
                    name: "Greater East Side",
                    lat: 44.978684,
                    lon: -93.025585,
                    selected: true
                },
                {
                    id: 3,
                    name: "West Side",
                    lat: 44.932248,
                    lon: -93.078480,
                    selected: true

                },
                {
                    id: 4,
                    name: "Dayton's Bluff",
                    lat: 44.953880,
                    lon: -93.059761,
                    selected: true
                },
                {
                    id: 5,
                    name: "Payne/Phalen",
                    lat: 44.978519,
                    lon: -93.067820,
                    selected: true
                },
                {
                    id: 6,
                    name: "North End",
                    lat: 44.976247,
                    lon: -93.110111,
                    selected: true
                },
                {
                    id: 7,
                    name: "Thomas/Dale(Frogtown)",
                    lat: 44.960728,
                    lon: -93.122988,
                    selected: true
                },
                {
                    id: 8,
                    name: "Summit/University",
                    lat: 44.947270,
                    lon: -93.129536,
                    selected: true
                },
                {
                    id: 9,
                    name: "West Seventh",
                    lat: 44.929166,
                    lon: -93.122487,
                    selected: true
                },
                {
                    id: 10,
                    name: "Como",
                    lat: 44.982733,
                    lon: -93.149042,
                    selected: true
                },
                {
                    id: 11,
                    name: "Hamline/Midway",
                    lat: 44.962563,
                    lon: -93.168578,
                    selected: true
                },
                {
                    id: 12,
                    name: "St. Anthony",
                    lat: 44.973906,
                    lon: -93.197021,
                    selected: true
                },
                {
                    id: 13,
                    name: "Union Park",
                    lat: 44.948719,
                    lon: -93.176632,
                    selected: true
                },
                {
                    id: 14,
                    name: "Macalester-Groveland",
                    lat: 44.934662,
                    lon: -93.175191,
                    selected: true
                },
                {
                    id: 15,
                    name: "Highland",
                    lat: 44.909560,
                    lon: -93.170952,
                    selected: true
                },
                {
                    id: 16,
                    name: "Summit Hill",
                    lat: 44.936880,
                    lon: -93.138714,
                    selected: true
                },
                {
                    id: 17,
                    name: "Capitol River",
                    lat: 44.958002,
                    lon: -93.103668,
                    selected: true
                }

            ],
            codes: [],
            codeOffset: 0,
            codeQuery: "",
            neighborhoodOffset: 0,
            neighborhoodQuery: "",
            incidentOffset: 0,
            incidents: [],
            filters: {
                start_date: {
                    d: 1,
                    m: 1,
                    y: 2019
                },
                end_date: {
                    d: 31,
                    m: 12,
                    y: 2019
                },
                start_time: {
                    h:0,
                    m:0,
                    s:0
                },
                end_time: {
                    h:23,
                    m:59,
                    s:59
                },
                start_time_string: "00:00:00",
                end_time_string: "23:59:59"
            }
        }
    },
    mounted() {
        this.api_url = window.prompt("Enter the St Paul Crime URL");

        this.initMap();
        this.initLayers();



        let promises = [
            axios.get(`${this.api_url}/codes?format=json`),
        ]

        axios.all(promises).then(responses => {
            let code_response = responses[0];

            for (code_id in code_response.data) {
                let this_code = code_response.data[code_id];
                this.codes.push({
                    id: parseInt(code_id.substring(1)),
                    name: this_code,
                    color: this.getCrimeClass(this_code),
                    selected: true
                });
            }

            this.getIncidents();

        });


    },

    computed: {
        filteredIncidents() {
            this.incidentOffset = 0;

            let output = [];
            if (this.mapBounds != null) {
                for (let incident of this.incidents) {
                    if (this.mapBounds.contains([incident.neighborhood.lat, incident.neighborhood.lon]) &&
                        incident.time.localeCompare(this.filters.start_time_string) > 0 &&
                        incident.time.localeCompare(this.filters.end_time_string) < 0
                    ) {
                        output.push(incident);
                    }
                }
            }

            return output;
        },

        codeSearch() {
            let output = [];
            for (code of this.codes) {
                if (code.name.toLowerCase().includes(this.codeQuery.toLowerCase())) {
                    output.push(code);
                }
            }
            return output;
        },

        codePage() {
            let output = [];
            for (let index = this.codeOffset; index < Math.min(this.codeOffset + 10, this.codeSearch.length); index++) {
                output.push(this.codeSearch[index]);
            }
            return output;
        },

        incidentPage() {
            let output = [];
            for (let index = this.incidentOffset; index < Math.min(this.incidentOffset + 30, this.filteredIncidents.length); index++) {
                output.push(this.filteredIncidents[index]);
            }
            return output;
        },

        neighborhoodSearch() {
            let output = [];
            for (neighborhood of this.neighborhoods) {
                if (neighborhood.name.toLowerCase().includes(this.neighborhoodQuery.toLowerCase())) {
                    output.push(neighborhood);
                }
            }
            return output;
        },

        neighborhoodPage() {
            let output = [];
            for (let index = this.neighborhoodOffset; index < Math.min(this.neighborhoodOffset + 10, this.neighborhoodSearch.length); index++) {
                output.push(this.neighborhoodSearch[index]);
            }
            return output;
        }
    },

    methods: {
        getIncidentCount(neighborhood) {
            console.log(this.map.getBounds());
            let output = 0;

            for (incident of this.incidents) {

                if (incident.neighborhood_number == neighborhood.id) {
                    output = output + 1;
                }
            }

            return output;
        },

        searchByCoordinates() {
            if (this.maxBounds.contains([this.latitude, this.longitude])) {
                this.map.setView([this.latitude, this.longitude], 14);
            }

        },

        addToMap(incident) {
            axios.get("https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(incident.block.replace(/^[1-9]+X/g, '')+", st paul, mn") + "&format=json").then(response => {
                if(response.data.length > 0) {
                    let address = response.data[0];
                    console.log(address);

                    this.latitude = parseFloat(address.lat);
                    this.longitude = parseFloat(address.lon);

                    
                    let marker = L.marker([this.latitude,this.longitude]);

                    this.markers[incident.case_number] = marker;

                    marker.addTo(this.map)
                        .bindPopup(
                            `<h6>${incident.case_number}</h6>
                            <h6>${incident.incident.name}</h6>
                            ${address.display_name}
                            <button onclick="deleteMarker(${incident.case_number})">Delete</button>`)
                        .openPopup();

                    if (this.maxBounds.contains([this.latitude, this.longitude])) {
                        this.map.setView([this.latitude, this.longitude], 14);
                    } else {
                        this.address = "";
                    }
                } else {
                    alert("Address could not be located.");
                }
            });

        },

        searchByAddress() {
            axios.get("https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(this.address) + "&format=json").then(response => {
                if (response.data.length > 0) {
                    let address = response.data[0];

                    this.latitude = parseFloat(address.lat);
                    this.longitude = parseFloat(address.lon);

                    if (this.maxBounds.contains([this.latitude, this.longitude])) {
                        this.map.setView([this.latitude, this.longitude], 14);
                    } else {
                        this.address = "";
                    }

                } else {
                    this.address = "";
                }
            });
        },

        getIncidents() {
            this.incidentOffset = 0;
            this.incidents = [];

            this.filters.start_time_string = this.getTimeString(this.filters.start_time);
            this.filters.end_time_string = this.getTimeString(this.filters.end_time);

            let code_array = [];
            for (code of this.codes) {
                if (code.selected) {
                    code_array.push(code.id);
                }
            }

            let neighborhood_array = [];
            for (neighborhood of this.neighborhoods) {
                if (neighborhood.selected) {
                    neighborhood_array.push(neighborhood.id);
                }
            }

            axios.get(`${this.api_url}/incidents?code=${code_array.join(",")}&neighborhood=${neighborhood_array.join(",")}&start_date=${this.getDateString(this.filters.start_date)}&end_date=${this.getDateString(this.filters.end_date)}`).then(response => {
                for (incident_code in response.data) {
                    let this_incident = response.data[incident_code];
                    this_incident.case_number = incident_code.substring(1);

                    // Find the neighborhood and code
                    this_incident.neighborhood = {
                        name: "None"
                    }
                    for (neighborhood of this.neighborhoods) {
                        if (neighborhood.id == this_incident.neighborhood_number) {
                            this_incident.neighborhood = neighborhood;
                        }
                    }

                    this_incident.incident = {
                        name: "None"
                    }
                    for (code of this.codes) {
                        if (code.id == this_incident.code) {
                            this_incident.incident = code;
                        }
                    }

                    this.incidents.push(this_incident);
                }

            })

        },

        getCrimeClass(name) {
            let str = name.toLowerCase();

            //Personal crimes
            if (str.includes("rape") ||
                str.includes("assault")
            ) {
                return "warning";
            } else if (str.includes("narcotics")) {
                return "info";
            }

            //Violent crimes
            else if (
                str.includes("murder") ||
                str.includes("weapon") ||
                str.includes("arson")
            ) {
                return "danger";
            }

            //Property crimes
            else if (
                str.includes("theft") ||
                str.includes("robbery") ||
                str.includes("property") ||
                str.includes("graffiti") ||
                str.includes("burglary")
            ) {
                return "primary";

            } else {
                return "success"
            }
        },

        isVisible(neighborhoodNumber) {
            return true;
        },

        getDateString(date) {
            output = "";
            output += date.y;
            output += "-"
            if (date.m < 10) output += "0";
            output += date.m;
            output += "-"
            if (date.d < 10) output += "0";
            output += date.d;
            return output;
        },

        getTimeString(time) {
            output = "";
            if(time.h<10)output+="0";
            output+=time.h;
            output+=":";
            if(time.m<10)output+="0";
            output+=time.m;
            output+=":";
            if(time.s<10)output+="0";
            output+=time.s;
            return output;
        },

        initMap() {
            this.map = L.map('map', {
                center: [44.943073, -93.189740],
                zoom: 13,
                maxZoom: 18,
                minZoom: 11,
                maxBounds: this.maxBounds
            });

            this.latitude = this.map.getCenter().lat;
            this.longitude = this.map.getCenter().lng;
            this.mapBounds = this.map.getBounds();
            axios.get("https://nominatim.openstreetmap.org/reverse?format=json&lat=" + this.latitude + "&lon=" + this.longitude).then(response => {
                this.address = response.data.display_name;
            });

            this.map.on("moveend", () => {
                this.latitude = this.map.getCenter().lat;
                this.longitude = this.map.getCenter().lng;
                this.mapBounds = this.map.getBounds();

                axios.get("https://nominatim.openstreetmap.org/reverse?format=json&lat=" + this.latitude + "&lon=" + this.longitude).then(response => {
                    this.address = response.data.display_name;
                });
            });

            for (let neighborhood of this.neighborhoods) {
                let this_marker = L.marker([neighborhood.lat, neighborhood.lon], {
                    title: neighborhood.name,
                    icon: L.icon({iconUrl: "images/neighborhood.png", iconSize: [50,50]})
                });

                let this_popup = L.popup();

                this_marker.bindPopup(this_popup).openPopup();

                this_marker.on('popupopen', (event) => {
                    event.popup.setContent(`<h6>${neighborhood.name}</h6> ${this.getIncidentCount(neighborhood)} crimes.`);
                })

                this_marker.addTo(this.map);
            }

            this.tileLayer = L.tileLayer(
                'https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png', {
                    maxZoom: 18,
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
                }
            );
            this.tileLayer.addTo(this.map);
        },
        initLayers() {},
    },


});

function deleteMarker(id) {
    console.log(app);
    app.markers[id].remove()
}