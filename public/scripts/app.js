new Vue({
    el: '#app',
    data() {
        return {
            api_url: "http://cisc-dean.stthomas.edu:8008",
            map: null,
            tileLayer: null,
            layers: [],
            textBox: "",
            neighborhoods: [{
                    id:1,
                    name: "Conway/Battlecreek/Highwood",
                    lat: 44.957561,
                    longi: -93.014738,
                    selected: true
                },
                {
                    id:2,
                    name: "Greater East Side",
                    lat: 44.978684,
                    longi: -93.025585,
                    selected: true
                },
                {
                    id:3,
                    name: "West Side",
                    lat: 44.932248,
                    longi: -93.078480,
                    selected: true

                },
                {
                    id:4,
                    name: "Dayton's Bluff",
                    lat: 44.953880,
                    longi: -93.059761,
                    selected: true
                },
                {
                    id:5,
                    name: "Payne/Phalen",
                    lat: 44.978519,
                    longi: -93.067820,
                    selected: true
                },
                {
                    id:6,
                    name: "North End",
                    lat: 44.976247,
                    longi: -93.110111,
                    selected: true
                },
                {
                    id:7,
                    name: "Thomas/Dale(Frogtown)",
                    lat: 44.960728,
                    longi: -93.122988,
                    selected: true
                },
                {
                    id:8,
                    name: "Summit/University",
                    lat: 44.947270,
                    longi: -93.129536,
                    selected: true
                },
                {
                    id:9,
                    name: "West Seventh",
                    lat: 44.929166,
                    longi: -93.122487,
                    selected: true
                },
                {
                    id:10,
                    name: "Como",
                    lat: 44.982733,
                    longi: -93.149042,
                    selected: true
                },
                {
                    id:11,
                    name: "Hamline/Midway",
                    lat: 44.962563,
                    longi: -93.168578,
                    selected: true
                },
                {
                    id:12,
                    name: "St. Anthony",
                    lat: 44.973906,
                    longi: -93.197021,
                    selected: true
                },
                {
                    id:13,
                    name: "Union Park",
                    lat: 44.948719,
                    longi: -93.176632,
                    selected: true
                },
                {
                    id:14,
                    name: "Macalester-Groveland",
                    lat: 44.934662,
                    longi: -93.175191,
                    selected: true
                },
                {
                    id:15,
                    name: "Highland",
                    lat: 44.909560,
                    longi: -93.170952,
                    selected: true
                },
                {
                    id:16,
                    name: "Summit Hill",
                    lat: 44.936880,
                    longi: -93.138714,
                    selected: true
                },
                {
                    id:17,
                    name: "Capitol River",
                    lat: 44.958002,
                    longi: -93.103668,
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
                start_date: {d:1,m:1,y:2019},
                end_date: {d:31,m:12,y:2019},
                start_time: "00:00:00",
                end_time: "23:59:59",
            }
        }
    },
    mounted() {
        this.initMap();
        this.initLayers();

        axios.get("https://nominatim.openstreetmap.org/search?q=stpaul&format=json").then(response => {
        })

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
                    selected: true
                });
            }

            this.getIncidents();

        });


    },

    computed: {
        codeSearch() {
            let output = [];
            for(code of this.codes) {
                if(code.name.toLowerCase().includes(this.codeQuery.toLowerCase())) {
                    output.push(code);
                }
            }
            return output;
        },

        codePage() {
            let output = [];
            for (let index = this.codeOffset; index < Math.min(this.codeOffset+10, this.codeSearch.length); index++) {
                output.push(this.codeSearch[index]);
            }
            return output;
        },

        incidentPage() {
            let output = [];
            for (let index = this.incidentOffset; index < Math.min(this.incidentOffset+15, this.incidents.length); index++) {
                output.push(this.incidents[index]);
            }
            return output;
        },

        neighborhoodSearch() {
            let output = [];
            for(neighborhood of this.neighborhoods) {
                if(neighborhood.name.toLowerCase().includes(this.neighborhoodQuery.toLowerCase())) {
                    output.push(neighborhood);
                }
            }
            return output;
        },

        neighborhoodPage() {
            let output = [];
            for (let index = this.neighborhoodOffset; index < Math.min(this.neighborhoodOffset+10, this.neighborhoodSearch.length); index++) {
                output.push(this.neighborhoodSearch[index]);
            }
            return output;
        }
    },

    methods: {

        getIncidents() {
            this.incidentOffset = 0;
            this.incidents = [];
            let code_array = [];
            for (code of this.codes) {
                if (code.selected) {
                    code_array.push(code.id);
                }
            }

            let neighborhood_array = [];
            for (neighborhood of this.neighborhoods) {
                if (neighborhood.selected) {
                    neighborhood_array.push(neighborhood.selected);
                }
            }

            axios.get(`${this.api_url}/incidents?code=${code_array.join(",")}&neighborhood=${neighborhood_array.join(",")}&start_date=${this.getDateString(this.filters.start_date)}&end_date=${this.getDateString(this.filters.end_date)}`).then(response => {
                for (incident_code in response.data) {
                    let this_incident = response.data[incident_code];
                    this_incident.case_number = incident_code.substring(1);

                    // Find the neighborhood and code
                    this_incident.neighborhood = {name:"None"}
                    for(neighborhood of this.neighborhoods) {
                        if(neighborhood.id == this_incident.neighborhood_number) {
                            this_incident.neighborhood = neighborhood;
                        }
                    }

                    this_incident.incident = {name:"None"}
                    for(code of this.codes) {
                        if(code.id == this_incident.code) {
                            this_incident.incident = code;
                        }
                    }

                    this.incidents.push(this_incident);
                }

            })

        },

        isVisible(neighborhoodNumber) {
            return true;
        },

        getDateString(date) {
            output = "";
            output += date.y;
            output += "-"
            if(date.m<10) output += "0";
            output += date.m;
            output += "-"
            if(date.d<10) output += "0";
            output += date.d;
            return output;
        },

        initMap() {
            this.map = L.map('map', {
                center: [44.943073, -93.189740],
                zoom: 13,
                maxZoom: 18,
                minZoom: 11,
                maxBounds: [
                    [44.890591, -93.207777],
                    [44.991925, -93.004938]
                ]
            });

            this.map.on("moveend", () => {
                this.textBox = this.map.getCenter().lat + ", " + this.map.getCenter().lng;
            });

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