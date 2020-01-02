
export const displayMap = locations => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibW9oYW1lZDExIiwiYSI6ImNrNGIxc3FvNzA5ZWYzZW14azRxeHQyMG4ifQ.7ClmOv8TDx6oONCeoINpvQ';
    let map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mohamed11/ck4b29j3f1vlt1dnt55vs0o56',
        scrollZoom: false
    });
    
    const bounds = new mapboxgl.LngLatBounds()
    
    locations.forEach(location => {
        const el = document.createElement('div')
        el.className = ('marker')
    
        // add marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
        .setLngLat(location.coordinates)
        .addTo(map)
    
        // add popup
        new mapboxgl.Popup({
            offset: 30
        })
        .setLngLat(location.coordinates)
        .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
        .addTo(map)
    
        //extend map bounds to include current location
        bounds.extend(location.coordinates)
    });
    
    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    })
}
