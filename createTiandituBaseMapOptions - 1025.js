'use strict';

/*global require*/
var WebMapTileServiceCatalogItem = require('../Models/WebMapTileServiceCatalogItem');
var BaseMapViewModel = require('./BaseMapViewModel');

var createTiandituBaseMapOptions = function(terria) {
    var result = [];

    var tiandituImage = new WebMapTileServiceCatalogItem(terria);
    tiandituImage.name = '天地图影像';
	tiandituImage.url = 'http://t0.tianditu.com/img_w/wmts';
    tiandituImage.layer = 'img';
	tiandituImage.style = 'default';
	tiandituImage.format = 'tiles';
	tiandituImage.opacity = 1.0;
	tiandituImage.tileMatrixSetID= 'w';
	tiandituImage.ignoreUnknownTileErrors = true;

    result.push(new BaseMapViewModel({
        image: require('../../wwwroot/images/tianditu-img.png'),
        catalogItem: tiandituImage,
        contrastColor: '#000000'
    }));
	
	var tiandituCia = new WebMapTileServiceCatalogItem(terria);
    tiandituCia.name = '天地图注记';
	tiandituCia.url = 'http://t0.tianditu.com/cia_w/wmts';
    tiandituCia.layer = 'cia';
	tiandituCia.style = 'default';
	tiandituCia.format = 'tiles';
	tiandituCia.opacity = 1.0;
	tiandituCia.tileMatrixSetID= 'w';
	tiandituCia.ignoreUnknownTileErrors = true;

    result.push(new BaseMapViewModel({
        image: require('../../wwwroot/images/tianditu-cia.png'),
        catalogItem: tiandituCia,
        contrastColor: '#000000'
    }));

    return result;
};

module.exports = createTiandituBaseMapOptions;
