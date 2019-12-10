new Vue({
    el: '#app',
    data() {
        return {
            api_url: "http://cisc-dean.stthomas.edu:8008",
            map: null,
            tileLayer: null,
            layers: [],
            textBox: "",
            neighborhoods: {},
            codes: {},
            incidents: [],
            filters: {
                start_date: "1990-01-01",
                end_date: null,
                start_time: "00:00:00",
                end_time: "23:59:59",
            }
        }
    },
    mounted() {
        this.initMap();
        this.initLayers();

        axios.get("https://nominatim.openstreetmap.org/search?q=stpaul&format=json").then(response => {
            console.log(response.data);
        })

        let promises = [
            axios.get(`${this.api_url}/codes?format=json`),
        ]

        axios.all(promises).then(responses => {
            let code_response = responses[0];

            for(code_id in code_response.data) {
                let this_code = code_response.data[code_id];
                this.codes[code_id.substring(1)] = {
                    name: this_code,
                    selected: true
                }
            }

            this.getIncidents();

        });


        this.filters.end_date = (new Date()).toISOString().split("T")[0];


    },

    methods: {

        getIncidents() {
            let code_array = [];
            for(code in this.codes) {
                if(this.codes[code].selected) {
                    code_array.push(code);
                }
            }

            let neighborhood_array = [];
            for(neighborhood in this.neighborhoods) {
                if(this.neighborhoods[neighborhood].selected) {
                    neighborhood_array.push(neighborhood);
                }
            }

            axios.get(`${this.api_url}/incidents?codes=${code_array.join(",")}&neighborhoods=${neighborhood_array.join(",")}&start_date=${this.filters.start_date}&end_date=${this.filters.end_date}`).then(response => {
                for (incident_code in response.data) {
                    let this_incident = response.data[incident_code];
                    this_incident.case_number = incident_code.substring(1);
                    this.incidents.push(this_incident);
                }
                
            })

            console.log(code_array)
        },

        isVisible(neighborhoodNumber) {
            return true;
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