import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';

import Cartesian2 from 'terriajs-cesium/Source/Core/Cartesian2';
import Styles from './terria-viewer-wrapper.scss';

import Splitter from './Splitter';
import ObserveModelMixin from '../ObserveModelMixin';
import TerriaViewer from '../../ViewModels/TerriaViewer';

const TerriaViewerWrapper = createReactClass({
    displayName: 'TerriaViewerWrapper',
    mixins: [ObserveModelMixin],

    lastMouseX: -1,
    lastMouseY: -1,

    propTypes: {
        terria: PropTypes.object.isRequired,
        viewState: PropTypes.object.isRequired
    },

    componentDidMount() {
        // Create the map/globe.
        this.terriaViewer = TerriaViewer.create(this.props.terria, {
            terrain: this.props.terria.configParameters.cesiumTerrainUrl,
            developerAttribution: {
                text: '影子数据地理小组',
                link: '#'
            }
        });
    },

    componentWillUnmount() {
        this.terriaViewer && this.terriaViewer.destroy();
        this.mapElement.innerHTML = '';
    },

    onMouseMove(event) {
        // Avoid duplicate mousemove events.  Why would we get duplicate mousemove events?  I'm glad you asked:
        // http://stackoverflow.com/questions/17818493/mousemove-event-repeating-every-second/17819113
        // I (Kevin Ring) see this consistently on my laptop when Windows Media Player is running.
        if (event.clientX === this.lastMouseX && event.clientY === this.lastMouseY) {
            return;
        }

        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;

        if (this.props.terria.cesium) {
            const rect = this.mapElement.getBoundingClientRect();
            const position = new Cartesian2(event.clientX - rect.left, event.clientY - rect.top);
            this.props.viewState.mouseCoords.updateCoordinatesFromCesium(this.props.terria, position);
        } else if (this.props.terria.leaflet) {
            this.props.viewState.mouseCoords.updateCoordinatesFromLeaflet(this.props.terria, event.nativeEvent);
        }
    },

    render() {
        return (
            <aside className={Styles.container}>
                <div className={Styles.mapPlaceholder}>正在加载地图，请稍候...</div>
                <Splitter terria={this.props.terria} />
                <div
                    id="cesiumContainer"
                    className={Styles.cesiumContainer}
                    ref={element => {this.mapElement = element;}}
                    onMouseMove={this.onMouseMove}>
                </div>
            </aside>
        );
    },
});
module.exports = TerriaViewerWrapper;