module.exports = function (){
  return {
    remoteDataType: [
            {
                value: 'auto',
                name: '自动检测(推荐)'
            },
            {
                value: 'wms-getCapabilities',
                name: 'Web Map Service (WMS) Server'
            },
            {
                value: 'wmts-getCapabilities',
                name: 'Web Map Tile Service (WMTS) Server'
            },
            {
                value: 'wfs-getCapabilities',
                name: 'Web Feature Service (WFS) Server'
            },
            {
                value: 'esri-group',
                name: 'Esri ArcGIS Server'
            },
            // esri-group is registered with ArcGisCatalogGroup, which can read REST, MapServer and FeatureServer groups.
            // So we do not need to explicitly include esri-mapServer-group or esri-featureServer-group here.
            {
                value: 'esri-mapServer',
                name: 'Esri ArcGIS MapServer (单图层)'
            },
            {
                value: 'esri-featureServer',
                name: 'Esri ArcGIS FeatureServer (单图层)'
            },
            {
                value: 'open-street-map',
                name: 'Open Street Map Server'
            },
            {
                value: 'geojson',
                name: 'GeoJSON'
            },
            {
                value: 'kml',
                name: 'KML or KMZ'
            },
            {
                value: 'csv',
                name: 'CSV'
            },
            {
                value: 'czml',
                name: 'CZML'
            },
            {
                value: 'gpx',
                name: 'GPX'
            },
            {
                value: 'other',
                name: 'Other (使用转换服务)'
            },
        ],
    localDataType: [
          {
              value: 'auto',
              name: '自动检测(推荐)'
          },
          {
              value: 'geojson',
              name: 'GeoJSON',
              extensions: ['geojson']
          },
          {
              value: 'kml',
              name: 'KML or KMZ',
              extensions: ['kml', 'kmz']
          },
          {
              value: 'csv',
              name: 'CSV',
              extensions: ['csv']
          },
          {
              value: 'czml',
              name: 'CZML',
              extensions: ['czml']
          },
          {
              value: 'gpx',
              name: 'GPX',
              extensions: ['gpx']
          },
          {
              value: 'json',
              name: 'JSON',
              extensions: ['json', 'json5']
          },
          {
              value: 'other',
              name: 'Other (使用转换服务)'
          },
      ]
    };
};


