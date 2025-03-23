import React, { useEffect, useRef, useState } from 'react';
import { CCard, CCardBody, CContainer, CSpinner, CAlert, CButton } from '@coreui/react';

const VehicleTracker = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markers = useRef({});
  const directionsServices = useRef({});
  const animationFrameRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());

  // Predefined Nairobi road routes
  const nairobiRoutes = {
    route1: [
      { lat: -1.286389, lng: 36.817223 }, // KICC
      { lat: -1.2921, lng: 36.8219 },     // City Hall
      { lat: -1.3045, lng: 36.8137 }      // National Museum
    ],
    route2: [
      { lat: -1.3005, lng: 36.7803 },     // Mombasa Road
      { lat: -1.3186, lng: 36.8237 },     // Langata Road
      { lat: -1.2956, lng: 36.7461 }      // Central Business District
    ]
  };

  const initialVehicles = [
    { 
      id: 1,
      plate: 'KBN 589U',
      speed: 40, // km/h
      status: 'active',
      route: [...nairobiRoutes.route1],
      currentTargetIndex: 0,
      icon: {
        active: 'https://maps.gstatic.com/mapfiles/vehicle.png',
        inactive: 'https://maps.gstatic.com/mapfiles/vehicle_gray.png'
      }
    },
    { 
      id: 2,
      plate: 'KBB-456B',
      speed: 50,
      status: 'active',
      route: [...nairobiRoutes.route2],
      currentTargetIndex: 0,
      icon: {
        active: 'https://maps.gstatic.com/mapfiles/vehicle.png',
        inactive: 'https://maps.gstatic.com/mapfiles/vehicle_gray.png'
      }
    }
  ];

  // Convert km/h to degrees/ms (approximate)
  const speedToDegrees = (kmh) => {
    const kmPerDegree = 111; // Approximate km per degree
    return (kmh / kmPerDegree) / 3600000; // Convert to degrees/ms
  };

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError('Google Maps API key is missing');
      setLoading(false);
      return;
    }

    const initializeMap = () => {
      try {
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: -1.2921, lng: 36.8219 }, // Nairobi City Hall
          zoom: 13,
          mapTypeId: 'roadmap',
          streetViewControl: false,
          fullscreenControl: true,
        });

        directionsServices.current = new window.google.maps.DirectionsService();
        initializeVehicles();
        setLoading(false);

      } catch (err) {
        setError('Error initializing Google Maps');
        setLoading(false);
      }
    };

    if (window.google) {
      initializeMap();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,directions`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => {
        setError('Failed to load Google Maps API');
        setLoading(false);
      };
      document.head.appendChild(script);
    }

    return () => {
      const scripts = document.head.querySelectorAll('script[src*="maps.googleapis.com"]');
      scripts.forEach(script => document.head.removeChild(script));
      if (mapInstance.current) {
        window.google.maps.event.clearInstanceListeners(mapInstance.current);
      }
    };
  }, []);

  const initializeVehicles = () => {
    setVehicles(prev => 
      initialVehicles.map(vehicle => {
        const [start, ...rest] = vehicle.route;
        return {
          ...vehicle,
          lat: start.lat,
          lng: start.lng,
          speed: speedToDegrees(vehicle.speed),
          targetLat: rest[0].lat,
          targetLng: rest[0].lng,
          route: rest
        };
      })
    );
  };

  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      const delta = now - lastUpdateRef.current;
      
      setVehicles(prevVehicles => 
        prevVehicles.map(vehicle => {
          if (vehicle.status !== 'active') return vehicle;
          
          const latDelta = vehicle.targetLat - vehicle.lat;
          const lngDelta = vehicle.targetLng - vehicle.lng;
          const distance = Math.sqrt(latDelta**2 + lngDelta**2);
          const step = vehicle.speed * delta;
          const ratio = distance > 0 ? Math.min(step / distance, 1) : 0;

          const newLat = vehicle.lat + latDelta * ratio;
          const newLng = vehicle.lng + lngDelta * ratio;

          // Update to next target
          if (ratio >= 0.99) {
            const nextIndex = (vehicle.currentTargetIndex + 1) % vehicle.route.length;
            const nextTarget = vehicle.route[nextIndex];
            
            return {
              ...vehicle,
              lat: nextTarget.lat,
              lng: nextTarget.lng,
              currentTargetIndex: nextIndex,
              targetLat: vehicle.route[(nextIndex + 1) % vehicle.route.length].lat,
              targetLng: vehicle.route[(nextIndex + 1) % vehicle.route.length].lng
            };
          }

          return { ...vehicle, lat: newLat, lng: newLng };
        })
      );

      lastUpdateRef.current = now;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (mapInstance.current) {
      updateMarkers();
    }
  }, [vehicles]);

  const updateMarkers = () => {
    vehicles.forEach(vehicle => {
      if (!markers.current[vehicle.id]) {
        markers.current[vehicle.id] = new window.google.maps.Marker({
          position: { lat: vehicle.lat, lng: vehicle.lng },
          map: mapInstance.current,
          icon: {
            url: vehicle.status === 'active' 
              ? vehicle.icon.active 
              : vehicle.icon.inactive,
            scaledSize: new window.google.maps.Size(32, 32)
          },
          title: vehicle.plate
        });

        markers.current[vehicle.id].addListener('click', () => {
          setSelectedVehicle(vehicle);
          mapInstance.current.panTo({ lat: vehicle.lat, lng: vehicle.lng });
        });
      }

      const marker = markers.current[vehicle.id];
      marker.setPosition({ lat: vehicle.lat, lng: vehicle.lng });
      
      // Calculate direction
      const bearing = window.google.maps.geometry.spherical.computeHeading(
        new window.google.maps.LatLng(vehicle.lat, vehicle.lng),
        new window.google.maps.LatLng(vehicle.targetLat, vehicle.targetLng)
      );

      // Update marker rotation
      marker.setIcon({
        ...marker.getIcon(),
        rotation: bearing
      });

      // Update animation
      marker.setAnimation(vehicle.status === 'active' 
        ? window.google.maps.Animation.BOUNCE 
        : null
      );
    });
  };

  const handleCenterMap = () => {
    if (mapInstance.current) {
      mapInstance.current.setCenter({ lat: -1.2921, lng: 36.8219 });
      mapInstance.current.setZoom(13);
    }
  };

  const toggleVehicleStatus = (vehicleId) => {
    setVehicles(prevVehicles =>
      prevVehicles.map(vehicle =>
        vehicle.id === vehicleId
          ? { ...vehicle, status: vehicle.status === 'active' ? 'inactive' : 'active' }
          : vehicle
      )
    );
  };

  return (
    <CContainer lg>
      <CCard className="mb-4">
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="h4 m-0">Vehicle Tracking</h2>
            <CButton color="primary" onClick={handleCenterMap}>
              Reset View
            </CButton>
          </div>

          {error && (
            <CAlert color="danger" className="mb-4">
              {error}
            </CAlert>
          )}

          {loading && (
            <div className="text-center py-5">
              <CSpinner color="primary" />
              <p className="mt-2">Initializing Nairobi traffic system...</p>
            </div>
          )}

          <div 
            ref={mapRef}
            style={{ 
              height: '600px',
              width: '100%',
              borderRadius: '8px',
              overflow: 'hidden',
              visibility: loading ? 'hidden' : 'visible'
            }}
          />

          {selectedVehicle && (
            <div className="mt-4 p-3 bg-light rounded">
              <h5>Vehicle Details</h5>
              <p>License Plate: {selectedVehicle.plate}</p>
              <p>
                Status: 
                <span className={`badge ${selectedVehicle.status === 'active' ? 'bg-success' : 'bg-secondary'} ms-2`}>
                  {selectedVehicle.status.toUpperCase()}
                </span>
              </p>
              <p>Position: {selectedVehicle.lat.toFixed(5)}, {selectedVehicle.lng.toFixed(5)}</p>
              <p>Speed: {Math.round(selectedVehicle.speed * 111 * 3600)} km/h</p>
              <CButton 
                color="warning" 
                size="sm" 
                onClick={() => toggleVehicleStatus(selectedVehicle.id)}
              >
                {selectedVehicle.status === 'active' ? 'Stop Vehicle' : 'Start Vehicle'}
              </CButton>
            </div>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default VehicleTracker;