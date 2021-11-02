import React from 'react';
import MapPage from './pages/MapPage';

import { SocketProvider } from './context/SocketContext';

const MapApp = () => {
  return (
    <SocketProvider>
      <MapPage />
    </SocketProvider>
  );
};

export default MapApp;
