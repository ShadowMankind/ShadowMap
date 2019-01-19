'use strict';

/*global require*/
var WebMapTileServiceCatalogItem = require('../Models/WebMapTileServiceCatalogItem');
var BaseMapViewModel = require('./BaseMapViewModel');
var CompositeCatalogItem = require('../Models/CompositeCatalogItem');
var UrlTemplateCatalogItem = require('../Models/UrlTemplateCatalogItem');

var createTiandituBaseMapOptions = function(terria) {
    var result = [];

    const tiandituImage = new WebMapTileServiceCatalogItem(terria);
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
        catalogItem: tiandituImage
    }));
	
	const tiandituCia = new WebMapTileServiceCatalogItem(terria);
    tiandituCia.name = '影像注记';
	tiandituCia.url = 'http://t0.tianditu.com/cia_w/wmts';
    tiandituCia.layer = 'cia';
	tiandituCia.style = 'default';
	tiandituCia.format = 'tiles';
	tiandituCia.opacity = 1.0;
	tiandituCia.tileMatrixSetID= 'w';
	tiandituCia.ignoreUnknownTileErrors = true;
	var items = [tiandituImage,tiandituCia];
	const composite = new CompositeCatalogItem(terria,items);
	composite.name = '天地图影像(带注记)';
	
    result.push(new BaseMapViewModel({
        image: require('../../wwwroot/images/tianditu-cia.png'),
        catalogItem: composite
    }));
	
	const tiandituVec = new WebMapTileServiceCatalogItem(terria);
    tiandituVec.name = '天地图矢量';
	tiandituVec.url = 'http://t0.tianditu.com/vec_w/wmts';
    tiandituVec.layer = 'vec';
	tiandituVec.style = 'default';
	tiandituVec.format = 'tiles';
	tiandituVec.opacity = 1.0;
	tiandituVec.tileMatrixSetID= 'w';
	tiandituVec.ignoreUnknownTileErrors = true;
	
	const tiandituCva = new WebMapTileServiceCatalogItem(terria);
    tiandituCva.name = '矢量注记';
	tiandituCva.url = 'http://t0.tianditu.com/cva_w/wmts';
    tiandituCva.layer = 'cva';
	tiandituCva.style = 'default';
	tiandituCva.format = 'tiles';
	tiandituCva.opacity = 1.0;
	tiandituCva.tileMatrixSetID= 'w';
	tiandituCva.ignoreUnknownTileErrors = true;
	var items1 = [tiandituVec,tiandituCva];
	const composite1 = new CompositeCatalogItem(terria,items1);
	composite1.name = '天地图矢量(带注记)';

    result.push(new BaseMapViewModel({
        image: require('../../wwwroot/images/tianditu-vec.png'),
        catalogItem: composite1,
        contrastColor: '#000000'
    }));
	
	const googleMap = new UrlTemplateCatalogItem(terria);
	googleMap.name = '谷歌影像';
	googleMap.url = 'http://mt0.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}';
	googleMap.opacity = 1.0;
	
	result.push(new BaseMapViewModel({
        image: require('../../wwwroot/images/googlemap.png'),
        catalogItem: googleMap
    }));
	
    return result;
};

module.exports = createTiandituBaseMapOptions;
