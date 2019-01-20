'use strict';

import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import ObserveModelMixin from '../../ObserveModelMixin';
import defined from 'terriajs-cesium/Source/Core/defined';
import Styles from './colorscalerange-section.scss';

const ColorScaleRangeSection = createReactClass({
    displayName: 'ColorScaleRangeSection',
    mixins: [ObserveModelMixin],

    propTypes: {
        item: PropTypes.object.isRequired
    },

    minRange: -50,
    maxRange: 50,

    updateRange(e) {
        e.preventDefault();

        const min = parseFloat(this.minRange);
        if (min !== min) { // is NaN?
            this.props.item.terria.error.raiseEvent({
                sender: this.props.item,
                title: '无效的颜色比例范围',
                message: '最小值必须是一个数字.'
            });
            return;
        }

        const max = parseFloat(this.maxRange);
        if (max !== max) { // is NaN?
            this.props.item.terria.error.raiseEvent({
                sender: this.props.item,
                title: '无效的颜色比例范围',
                message: '最大值必须是一个数字.'
            });
            return;
        }

        if (max <= min) {
            this.props.item.terria.error.raiseEvent({
                sender: this.props.item,
                title: '无效的颜色比例范围',
                message: '最小值必须小于最大值.'
            });
            return;
        }

        this.props.item.colorScaleMinimum = min;
        this.props.item.colorScaleMaximum = max;
        this.props.item.refresh();
    },

    changeRangeMin(event) {
        this.minRange = event.target.value;
    },

    changeRangeMax(event) {
        this.maxRange = event.target.value;
    },

    render() {
        const item = this.props.item;
        if (!defined(item.colorScaleMinimum) || !defined(item.colorScaleMaximum)) {
            return null;
        }

        this.minRange = item.colorScaleMinimum;
        this.maxRange = item.colorScaleMaximum;

        return (
            <form className={Styles.colorscalerange} onSubmit={this.updateRange}>
                <div className={Styles.title}>Color Scale Range </div>
                <label htmlFor="rangeMax">Maximum: </label>
                <input className={Styles.field} type='text' name='rangeMax' defaultValue={this.maxRange} onChange={this.changeRangeMax} />
                <label htmlFor="rangeMin">Minimum: </label>
                <input className={Styles.field} type='text' name='rangeMin' defaultValue={this.minRange} onChange={this.changeRangeMin} />
                <button type='submit' title="更新范围" className={Styles.btn}>Update Range</button>
            </form>
        );
    },
});
module.exports = ColorScaleRangeSection;
