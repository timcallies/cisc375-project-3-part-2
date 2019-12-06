new Vue({
    el: '#app',
    data() {
        return {
            map: null,
            tileLayer: null,
            layers: [],
            textBox: "",
            neighborhoods: [],
            incident: [],
            crimes: []
        };
    },
    mounted() {
        this.initMap();
        this.initLayers();

        fetch("http://localhost:8000/neighborhoods?format=json").then (response => {
            return response.json();
        }).then(json => {
            console.log(json);
        })
    },

    methods: {

        loadCrimes(crimes) {
            for (crime of crimes) {

            }
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

            this.map.on("move", () => {
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