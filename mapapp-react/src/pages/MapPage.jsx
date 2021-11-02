import React, { useEffect, useContext } from 'react';
import useMapbox from '../hooks/useMapbox';
import { SocketContext } from '../context/SocketContext';

const center = {
  lng: 5,
  lat: 34,
  zoom: 2,
};

const MapPage = () => {
  const { socket } = useContext(SocketContext);
  const { setRef, coords, newMarker$, moveMarker$, addMarker, updateMarker } =
    useMapbox(center);

  useEffect(() => {
    socket.on('active-markers', (markers) => {
      for (const key of Object.keys(markers)) {
        addMarker(markers[key], key);
      }
    });
  }, [socket, addMarker]);

  useEffect(() => {
    newMarker$.subscribe((marker) => {
      socket.emit('new-marker', marker);
    });

    return () => {
      newMarker$.unsubscribe();
    };
  }, [newMarker$, socket]);

  useEffect(() => {
    moveMarker$.subscribe((marker) => {
      socket.emit('move-marker', marker);
    });

    return () => {
      moveMarker$.unsubscribe();
    };
  }, [moveMarker$, socket]);

  useEffect(() => {
    socket.on('move-marker', (marker) => {
      updateMarker(marker);
    });
  }, [socket, updateMarker]);

  useEffect(() => {
    socket.on('new-marker', (marker) => {
      addMarker(marker, marker.id);
    });

    return () => {
      socket.off('new-marker');
    };
  }, [socket, addMarker]);

  return (
    <>
      <div className='info'>
        Lng: {coords.lng} | Lat: {coords.lat} | Zoom: {coords.zoom}
      </div>
      <div ref={setRef} className='mapContainer' />
    </>
  );
};

export default MapPage;
