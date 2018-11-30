import { SET_GEO_LOCATION } from '../actions/setGeoLocation';

type GeoLocation = {
  ip: string,
  country_code: string,
  country_name: string,
  region_code: string,
  region_name: string,
  city: string,
  zip_code: string,
  time_zone: string,
  latitude: number,
  longitude: number,
  metro_code: ?number,
};

export default function geoLocation(
  state: ? GeoLocation = null,
  action
) {
  switch (action.type) {
    case SET_GEO_LOCATION:
      return action.payload;

    default:
      return state;
  }
}
