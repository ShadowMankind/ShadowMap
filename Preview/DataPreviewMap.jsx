'use strict';

const CesiumMath = require('terriajs-cesium/Source/Core/Math');
const ConsoleAnalytics = require('../../Core/ConsoleAnalytics');
const defaultValue = require('terriajs-cesium/Source/Core/defaultValue');
const defined = require('terriajs-cesium/Source/Core/defined');
const GeoJsonCatalogItem = require('../../Models/GeoJsonCatalogItem');
const ObserveModelMixin = require('../ObserveModelMixin');
const OpenStreetMapCatalogItem = require('../../Models/OpenStreetMapCatalogItem');
const React = require('react');
const createReactClass = require('create-react-class');
const PropTypes = require('prop-types');
const Terria = require('../../Models/Terria');
const TerriaViewer = require('../../ViewModels/TerriaViewer.js');
const ViewerMode = require('../../Models/ViewerMode');
const when = require('terriajs-cesium/Source/ThirdParty/when');
import classNames from 'classnames';

import Styles from './data-preview-map.scss';

/**
 * Leaflet-based preview map that sits within the preview.
 */
const DataPreviewMap = createReactClass({
    displayName: 'DataPreviewMap',
    mixins: [ObserveModelMixin],

    propTypes: {
        terria: PropTypes.object.isRequired,
        previewedCatalogItem: PropTypes.object,
        showMap: PropTypes.bool
    },

    getInitialState() {
        return {
            previewBadgeText: '正在加载预览...',
        };
    },

    /* eslint-disable-next-line camelcase */
    UNSAFE_componentWillMount() {
        const terria = this.props.terria;

        this.terriaPreview = new Terria({
            appName: terria.appName + ' preview',
            supportEmail: terria.supportEmail,
            baseUrl: terria.baseUrl,
            cesiumBaseUrl: terria.cesiumBaseUrl,
            analytics: new ConsoleAnalytics()
        });

        this.terriaPreview.viewerMode = ViewerMode.Leaflet;
        this.terriaPreview.homeView = terria.homeView;
        this.terriaPreview.initialView = terria.homeView;
        this.terriaPreview.regionMappingDefinitionsUrl = terria.regionMappingDefinitionsUrl;
        this._unsubscribeErrorHandler = this.terriaPreview.error.addEventListener(e => {
            if (e.sender === this.props.previewedCatalogItem ||
                (e.sender && e.sender.nowViewingCatalogItem === this.props.previewedCatalogItem)) {
                this._errorPreviewingCatalogItem = true;
                this.setState({
                    previewBadgeText: '预览不可用'
                });
            }
        });

        // TODO: we shouldn't hard code the base map here. (copied from branch analyticsWithCharts)
        const positron = new OpenStreetMapCatalogItem(this.terriaPreview);
        positron.name = 'Positron (Light)';
        positron.url = '//global.ssl.fastly.net/light_all/';
        positron.attribution = 'ShadowData Map';
        positron.opacity = 1.0;
        positron.subdomains = ['cartodb-basemaps-a', 'cartodb-basemaps-b', 'cartodb-basemaps-c', 'cartodb-basemaps-d'];
        this.terriaPreview.baseMap = positron;

        this.isZoomedToExtent = false;
        this.lastPreviewedCatalogItem = undefined;
        this.removePreviewFromMap = undefined;
    },

    componentWillUnmount() {
        this.destroyPreviewMap();

        if (this._unsubscribeErrorHandler) {
            this._unsubscribeErrorHandler();
            this._unsubscribeErrorHandler = undefined;
        }
    },

    /* eslint-disable-next-line camelcase */
    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.showMap && !this.props.showMap) {
            this.initMap(newProps.previewedCatalogItem);
        } else {
            this.updatePreview(newProps.previewedCatalogItem);
        }
    },

    updatePreview(previewedCatalogItem) {
        if (this.lastPreviewedCatalogItem === previewedCatalogItem) {
            return;
        }

        if (previewedCatalogItem) {
            this.props.terria.analytics.logEvent('dataSource', 'preview', previewedCatalogItem.name);
        }

        this.lastPreviewedCatalogItem = previewedCatalogItem;

        this.setState({
            previewBadgeText: '数据预览正在加载...'
        });

        this.isZoomedToExtent = false;
        this.terriaPreview.currentViewer.zoomTo(this.terriaPreview.homeView);

        if (defined(this.removePreviewFromMap)) {
            this.removePreviewFromMap();
            this.removePreviewFromMap = undefined;
        }

        if (defined(this.rectangleCatalogItem)) {
            this.rectangleCatalogItem.isEnabled = false;
        }

        const previewed = previewedCatalogItem;
        if (previewed && defined(previewed.type) && previewed.isMappable) {
            const that = this;
            return when(previewed.load()).then(() => {
                // If this item has a separate now viewing item, load it before continuing.
                let nowViewingItem;
                let loadNowViewingItemPromise;
                if (defined(previewed.nowViewingCatalogItem)) {
                    nowViewingItem = previewed.nowViewingCatalogItem;
                    loadNowViewingItemPromise = when(nowViewingItem.load());
                } else {
                    nowViewingItem = previewed;
                    loadNowViewingItemPromise = when();
                }

                return loadNowViewingItemPromise.then(() => {
                    // Now that the item is loaded, add it to the map.
                    // Unless we've started previewing something else in the meantime!
                    if (!that._unsubscribeErrorHandler || previewed !== that.lastPreviewedCatalogItem) {
                        return;
                    }

                    if (defined(nowViewingItem.showOnSeparateMap)) {
                        if (defined(nowViewingItem.clock) && defined(nowViewingItem.clock.currentTime)) {
                            that.terriaPreview.clock.currentTime = nowViewingItem.clock.currentTime;
                        }

                        this._errorPreviewingCatalogItem = false;
                        that.removePreviewFromMap = nowViewingItem.showOnSeparateMap(that.terriaPreview.currentViewer);

                        if (this._errorPreviewingCatalogItem) {
                            this.setState({
                                previewBadgeText: '预览不可用'
                            });
                        } else if (that.removePreviewFromMap) {
                            this.setState({
                                previewBadgeText: '数据预览'
                            });
                        } else {
                            this.setState({
                                previewBadgeText: '预览不可用'
                            });
                        }
                    } else {
                        this.setState({
                            previewBadgeText: '预览不可用'
                        });
                    }

                    that.updateBoundingRectangle(previewed);
                });
            }).otherwise((err) => {
                console.error(err);

                this.setState({
                    previewBadgeText: '数据预览出错'
                });
            });
        }
    },

    clickMap() {
        if (!defined(this.props.previewedCatalogItem)) {
            return;
        }

        this.isZoomedToExtent = !this.isZoomedToExtent;

        if (this.isZoomedToExtent) {
            const catalogItem = defaultValue(this.props.previewedCatalogItem.nowViewingCatalogItem, this.props.previewedCatalogItem);
            if (defined(catalogItem.rectangle)) {
                this.terriaPreview.currentViewer.zoomTo(catalogItem.rectangle);
            }
        } else {
            this.terriaPreview.currentViewer.zoomTo(this.terriaPreview.homeView);
        }

        this.updateBoundingRectangle(this.props.previewedCatalogItem);
    },

    updateBoundingRectangle(catalogItem) {
        if (defined(this.rectangleCatalogItem)) {
            this.rectangleCatalogItem.isEnabled = false;
            this.rectangleCatalogItem = undefined;
        }

        catalogItem = defaultValue(catalogItem.nowViewingCatalogItem, catalogItem);

        if (!defined(catalogItem) || !defined(catalogItem.rectangle)) {
            return;
        }

        let west = catalogItem.rectangle.west;
        let south = catalogItem.rectangle.south;
        let east = catalogItem.rectangle.east;
        let north = catalogItem.rectangle.north;

        if (!this.isZoomedToExtent) {
            // When zoomed out, make sure the dataset rectangle is at least 5% of the width and height
            // the home view, so that it is actually visible.
            const minimumFraction = 0.05;
            const homeView = this.terriaPreview.homeView.rectangle;

            const minimumWidth = (homeView.east - homeView.west) * minimumFraction;
            if ((east - west) < minimumWidth) {
                const center = (east + west) * 0.5;
                west = center - minimumWidth * 0.5;
                east = center + minimumWidth * 0.5;
            }

            const minimumHeight = (homeView.north - homeView.south) * minimumFraction;
            if ((north - south) < minimumHeight) {
                const center = (north + south) * 0.5;
                south = center - minimumHeight * 0.5;
                north = center + minimumHeight * 0.5;
            }
        }

        west = CesiumMath.toDegrees(west);
        south = CesiumMath.toDegrees(south);
        east = CesiumMath.toDegrees(east);
        north = CesiumMath.toDegrees(north);

        this.rectangleCatalogItem = new GeoJsonCatalogItem(this.terriaPreview);
        this.rectangleCatalogItem.data = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: {
                        stroke: '#08ABD5',
                        'stroke-width': 2,
                        'stroke-opacity': 1,
                        fill: '#555555',
                        'fill-opacity': 0
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [west, south],
                                [west, north],
                                [east, north],
                                [east, south],
                                [west, south]
                            ]
                        ]
                    }
                }
            ]
        };
        this.rectangleCatalogItem.isEnabled = true;
    },

    mapIsReady(mapContainer) {
        if (mapContainer) {
            this.mapElement = mapContainer;

            if (this.props.showMap) {
                this.initMap(this.props.previewedCatalogItem);
            }
        }
    },

    destroyPreviewMap() {
        this.terriaViewer && this.terriaViewer.destroy();
        if (this.mapElement) {
            this.mapElement.innerHTML = '';
        }
    },

    initMap(previewedCatalogItem) {
        if (this.mapElement) {
            this.terriaViewer = TerriaViewer.create(this.terriaPreview, {
                mapContainer: this.mapElement
            });

            // disable preview map interaction
            const map = this.terriaViewer.terria.leaflet.map;
            map.touchZoom.disable();
            map.doubleClickZoom.disable();
            map.scrollWheelZoom.disable();
            map.boxZoom.disable();
            map.keyboard.disable();
            map.dragging.disable();

            this.updatePreview(previewedCatalogItem);
        }
    },

    render() {
        return (
            <div className={Styles.map} onClick={this.clickMap}>
                <Choose>
                    <When condition={this.props.showMap}>
                        <div className={classNames(Styles.terriaPreview)} ref={this.mapIsReady}/>
                    </When>
                    <Otherwise>
                        <div className={classNames(Styles.terriaPreview, Styles.placeholder)}/>
                    </Otherwise>
                </Choose>

                <label className={Styles.badge}>{this.state.previewBadgeText}</label>
            </div>
        );
    },
});
module.exports = DataPreviewMap;