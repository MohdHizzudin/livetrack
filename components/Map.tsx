'use client';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useState } from 'react';

const containerStyle = { width: '100%', height: '100vh' };

export default function LiveMap({ locations, currentUser }: { locations: any[]; currentUser?: any }) {
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const center = currentUser 
    ? { lat: currentUser.lat, lng: currentUser.lng } 
    : { lat: 3.1390, lng: 101.6869 };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={14}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
      }}
    >
      {/* Marker semua user lain */}
      {locations.map((user) => (
        user.uid !== currentUser?.uid && (
          <Marker
            key={user.uid}
            position={{ lat: user.lat, lng: user.lng }}
            icon={{
              url: user.photo || 'https://via.placeholder.com/40',
              scaledSize: new google.maps.Size(40, 40),
            }}
            onClick={() => setSelectedUser(user)}
          />
        )
      ))}

      {/* Marker user sendiri (warna biru lebih besar) */}
      {currentUser && (
        <Marker
          position={{ lat: currentUser.lat, lng: currentUser.lng }}
          icon={{
            url: currentUser.photo || 'https://via.placeholder.com/40',
            scaledSize: new google.maps.Size(50, 50),
          }}
          onClick={() => setSelectedUser(currentUser)}
        />
      )}

      {/* Info Window */}
      {selectedUser && (
        <InfoWindow
          position={{ lat: selectedUser.lat, lng: selectedUser.lng }}
          onCloseClick={() => setSelectedUser(null)}
        >
          <div className="text-center min-w-[200px]">
            <img 
              src={selectedUser.photo} 
              className="w-16 h-16 rounded-2xl mx-auto border-2 border-white shadow" 
              alt={selectedUser.name} 
            />
            <p className="font-bold mt-3 text-lg">{selectedUser.name}</p>
            <p className="text-sm text-gray-500">
              Terakhir update: {new Date(selectedUser.timestamp).toLocaleTimeString('ms-MY')}
            </p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
