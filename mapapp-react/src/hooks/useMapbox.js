import { useRef, useEffect, useState, useCallback } from 'react';

import { v4 as uuidv4 } from 'uuid';

import mapboxgl from 'mapbox-gl';
import { Subject } from 'rxjs';

mapboxgl.accessToken = '';

const useMapbox = (initialPoint) => {
  // Mapdiv
  const mapDiv = useRef();
  const setRef = useCallback((node) => {
    mapDiv.current = node;
  }, []);

  // Observable rxjs
  const moveMarker = useRef(new Subject());
  const newMarker = useRef(new Subject());

  // Map and coords
  const map = useRef();
  const [coords, setCoords] = useState(initialPoint);

  // All markers
  const allMarkers = useRef({});

  const addMarker = useCallback((e, id) => {
    const { lng, lat } = e.lngLat || e;
    // New marker
    const marker = new mapboxgl.Marker();
    // Add marker id
    marker.id = id ?? uuidv4();
    // Add marker to map with lat and lng
    marker.setLngLat([lng, lat]).addTo(map.current).setDraggable(true);

    // Add marker to all markers
    allMarkers.current[marker.id] = marker;

    if (!id) {
      newMarker.current.next({
        id: marker.id,
        lng,
        lat,
      });
    }

    // Add marker event
    marker.on('drag', (e) => {
      const { id } = e.target;
      const { lng, lat } = e.target.getLngLat();

      newMarker.current.next({
        id,
        lng,
        lat,
      });
    });
  }, []);

  const updateMarker = useCallback((marker) => {
    allMarkers.current[marker.id].setLngLat([marker.lng, marker.lat]);
  }, []);

  useEffect(() => {
    const mapbox = new mapboxgl.Map({
      container: mapDiv.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [initialPoint.lng, initialPoint.lat],
      zoom: initialPoint.zoom,
    });
    map.current = mapbox;
  }, [initialPoint]);

  useEffect(() => {
    map.current?.on('move', () => {
      setCoords({
        lng: map.current?.getCenter().lng.toFixed(4),
        lat: map.current?.getCenter().lat.toFixed(4),
        zoom: map.current?.getZoom().toFixed(2),
      });
    });

    return () => map.current?.off('move');
  }, []);

  useEffect(() => {
    map.current?.on('click', (e) => {
      addMarker(e);
    });
  }, [addMarker]);

  return {
    coords,
    setRef,
    allMarkers,
    addMarker,
    newMarker$: newMarker.current,
    moveMarker$: moveMarker.current,
    updateMarker,
  };
};

export default useMapbox;
