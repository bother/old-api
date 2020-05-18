const { GOOGLE_MAPS_API_KEY } = process.env

import {
  Client,
  GeocodeResult,
  Language,
  Status
} from '@googlemaps/google-maps-services-js'

import { Location } from '../types/graphql'

class Google {
  client = new Client()

  async geocode([longitude, latitude]: number[]): Promise<Location> {
    const {
      data: { results, status }
    } = await this.client.reverseGeocode({
      params: {
        key: GOOGLE_MAPS_API_KEY,
        language: Language.en,
        latlng: {
          latitude,
          longitude
        }
      }
    })

    if (status === Status.OK) {
      return this.findLocation(results)
    }

    return {
      city: 'Unknown',
      country: 'Unknown',
      state: 'Unknown'
    }
  }

  private findLocation(results: GeocodeResult[]): Location {
    let _city
    let _state
    let _country

    for (const result of results) {
      const city = result.address_components.find((component) =>
        component.types.every((type) =>
          ['locality', 'political'].includes(type)
        )
      )

      if (city) {
        _city = city.long_name
      }

      const state = result.address_components.find((component) =>
        component.types.every((type) =>
          ['administrative_area_level_1', 'political'].includes(type)
        )
      )

      if (state) {
        _state = state.long_name
      }

      const country = result.address_components.find((component) =>
        component.types.every((type) => ['country', 'political'].includes(type))
      )

      if (country) {
        _country = country.long_name
      }

      if (city && state && country) {
        return {
          city: city.long_name,
          country: country.long_name,
          state: state.long_name
        }
      }
    }

    return {
      city: _city ?? 'Unknown',
      country: _country ?? 'Unknown',
      state: _state ?? 'Unknown'
    }
  }
}

export const google = new Google()
// {
//     "plus_code": {
//       "compound_code": "347G+HJ Dubai - United Arab Emirates",
//       "global_code": "7HQQ347G+HJ"
//     },
//     "results": [
//       {
//         "access_points": [],
//         "address_components": [
//           {
//             "long_name": "دبي",
//             "short_name": "دبي",
//             "types": [
//               "locality",
//               "political"
//             ]
//           },
//           {
//             "long_name": "جبل علي 2",
//             "short_name": "جبل علي 2",
//             "types": [
//               "neighborhood",
//               "political"
//             ]
//           },
//           {
//             "long_name": "دبي",
//             "short_name": "دبي",
//             "types": [
//               "administrative_area_level_1",
//               "political"
//             ]
//           },
//           {
//             "long_name": "United Arab Emirates",
//             "short_name": "AE",
//             "types": [
//               "country",
//               "political"
//             ]
//           }
//         ],
