'use strict';

import React from 'react';

import createReactClass from 'create-react-class';

import PropTypes from 'prop-types';

import defined from 'terriajs-cesium/Source/Core/defined';

import ObserveModelMixin from '../ObserveModelMixin';
import Styles from './parameter-editors.scss';

import CesiumMath from 'terriajs-cesium/Source/Core/Math';
import Ellipsoid from 'terriajs-cesium/Source/Core/Ellipsoid';
import UserDrawing from '../../Models/UserDrawing';

const PolygonParameterEditor = createReactClass({
    displayName: 'PolygonParameterEditor',
    mixins: [ObserveModelMixin],

    propTypes: {
        previewed: PropTypes.object,
        parameter: PropTypes.object,
        viewState: PropTypes.object
    },

    setValueFromText(e) {
        PolygonParameterEditor.setValueFromText(e, this.props.parameter);
    },

    selectPolygonOnMap() {
        PolygonParameterEditor.selectOnMap(this.props.previewed.terria, this.props.viewState, this.props.parameter);
    },

    render() {
        return (
            <div>
                <input className={Styles.field}
                       type="text"
                       onChange={this.setValueFromText}
                       value={PolygonParameterEditor.getDisplayValue(this.props.parameter.value)}/>
                <button type="button"
                        onClick={this.selectPolygonOnMap}
                        className={Styles.btnSelector}>
                    点击绘制面
                </button>
            </div>
        );
    },
});

/**
 * Triggered when user types value directly into field.
 * @param {String} e Text that user has entered manually.
 * @param {FunctionParameter} parameter Parameter to set value on.
 */
PolygonParameterEditor.setValueFromText = function(e, parameter) {
    parameter.value = [JSON.parse(e.target.value)];
};

/**
 * Given a value, return it in human readable form for display.
 * @param {Object} value Native format of parameter value.
 * @return {String} String for display
 */
PolygonParameterEditor.getDisplayValue = function(value) {
    if (!defined(value) || value.length < 1) {
        return '';
    }
    const pointsLongLats = value[0];

    let polygon = '';
    for (let i = 0; i < pointsLongLats.length; i++) {
        polygon += '[' + pointsLongLats[i][0].toFixed(3) + ', ' + pointsLongLats[i][1].toFixed(3) + ']';
        if (i !== pointsLongLats.length - 1) {
            polygon += ', ';
        }
    }
    if (polygon.length > 0) {
        return '[' + polygon + ']';
    } else {
        return '';
    }
};

/**
 * Helper function for processing clicked/moved points.
 */
function getPointsLongLats(pointEntities, terria) {
    const pointEnts = pointEntities.entities.values;
    const pointsLongLats = [];
    for (let i=0; i < pointEnts.length; i++) {
        const currentPoint = pointEnts[i];
        const currentPointPos = currentPoint.position.getValue(terria.clock.currentTime);
        const cartographic = Ellipsoid.WGS84.cartesianToCartographic(currentPointPos);
        const points = [];
        points.push(CesiumMath.toDegrees(cartographic.longitude));
        points.push(CesiumMath.toDegrees(cartographic.latitude));
        pointsLongLats.push(points);
    }

    // Close the polygon.
    if (pointsLongLats.length > 0) {
        pointsLongLats.push(pointsLongLats[0]);
    }

    return pointsLongLats;
}

/**
 * Prompt user to select/draw on map in order to define parameter.
 * @param {Terria} terria Terria instance.
 * @param {Object} viewState ViewState.
 * @param {FunctionParameter} parameter Parameter.
 */
PolygonParameterEditor.selectOnMap = function(terria, viewState, parameter) {
    const userDrawing = new UserDrawing({
        terria: terria,
        onPointClicked: function(pointEntities) {
            parameter.value = [getPointsLongLats(pointEntities, terria)];
        },
        onCleanUp: function() {
            viewState.openAddData();
        },
        onPointMoved: function(customDataSource) {
            parameter.value = [getPointsLongLats(customDataSource, terria)];
        }
    });
    viewState.explorerPanelIsVisible = false;
    userDrawing.enterDrawMode();
};

module.exports = PolygonParameterEditor;
