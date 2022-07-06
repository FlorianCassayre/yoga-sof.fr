import { Inject, LayerDirective, LayersDirective, MapsComponent, Marker, MarkerDirective, MarkersDirective, Zoom } from '@syncfusion/ej2-react-maps';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { BsFillGeoAltFill } from 'react-icons/bs';
import { LOCATION_COMETE, LOCATION_HOME, urlForLocation } from '../lib/common';

function CustomMarkerDirective({ location, fill }) {
  return (
    <MarkerDirective
      visible
      height={40}
      width={40}
      shape="Balloon"
      fill={fill}
      border={{ width: 3, color: '#000' }}
      dataSource={[location].map(({ name, coordinates }) => ({
        name,
        ...coordinates,
      }))}
    />
  );
}

export function MapWidget() {
  const [isMapToggled, setMapToggled] = useState(false);

  const locations = [LOCATION_HOME, LOCATION_COMETE];
  const meanLocationCoordinates = (() => {
    let meanLatitude = 0, meanLongitude = 0;
    locations.forEach(({ coordinates: { latitude, longitude } }) => {
      meanLatitude += latitude;
      meanLongitude += longitude;
    });
    return {
      latitude: meanLatitude / locations.length,
      longitude: meanLongitude / locations.length,
    };
  })();

  const handleMapClick = ({ target }) => {
    const location = locations.find((ignored, i) => target === `maps_LayerIndex_0_MarkerIndex_0_dataIndex_${i}`);
    if (location) {
      window.open(urlForLocation(location), '_blank').focus();
    }
  };

  const fillHome = '#5959ff', fillComete = '#ff3434';

  return isMapToggled ? (
    <>
      <MapsComponent
        id="maps"
        zoomSettings={{ zoomFactor: 14 }}
        centerPosition={meanLocationCoordinates}
        height="250px"
        click={handleMapClick}
        style={{ cursor: 'pointer' }}
      >
        <Inject services={[Marker, Zoom]} />
        <LayersDirective>
          <LayerDirective layerType="OSM">
            <MarkersDirective>
              {CustomMarkerDirective({ location: LOCATION_HOME, fill: fillHome })}
              {CustomMarkerDirective({ location: LOCATION_COMETE, fill: fillComete })}
            </MarkersDirective>
          </LayerDirective>
        </LayersDirective>
      </MapsComponent>
      <p className="mt-2 mb-0 text-center">
        Les séances Yoga adulte se déroulent
        {' '}
        <a style={{ color: fillHome }} href={urlForLocation(LOCATION_HOME)} target="_blank" rel="noreferrer">rue des moissonneurs</a>
        {' '}
        ; les autres séances sont à
        {' '}
        <a style={{ color: fillComete }} href={urlForLocation(LOCATION_COMETE)} target="_blank" rel="noreferrer">la Comète</a>
        .
      </p>
    </>
  ) : (
    <div className="text-center">
      <Button variant="secondary" onClick={() => setMapToggled(true)}>
        <BsFillGeoAltFill className="icon me-2" />
        Afficher la carte
      </Button>
    </div>
  );
}
