'use strict';

import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import ObserveModelMixin from '../../ObserveModelMixin';
import Styles from './augmented_virtuality_tool.scss';
import Icon from '../../Icon';
import ViewerMode from '../../../Models/ViewerMode';
import defined from 'terriajs-cesium/Source/Core/defined';

import AugmentedVirtuality from '../../../Models/AugmentedVirtuality';

const AugmentedVirtualityTool = createReactClass({
    displayName: 'AugmentedVirtualityTool',
    mixins: [ObserveModelMixin],

    propTypes: {
        terria: PropTypes.object.isRequired,
        viewState: PropTypes.object.isRequired,
        experimentalWarning: PropTypes.bool
    },

    getInitialState() {
        return {
            augmentedVirtuality: new AugmentedVirtuality(this.props.terria),
            experimentalWarningShown: false,
            realignHelpShown: false,
            resetRealignHelpShown: false
        };
    },

    handleClickAVTool() {
        // Make the AugmentedVirtuality module avaliable elsewhere.
        this.props.terria.augmentedVirtuality = this.state.augmentedVirtuality;

        if (defined(this.props.experimentalWarning) &&
            (this.props.experimentalWarning !== false) &&
            !this.state.experimentalWarningShown) {

            this.setState({experimentalWarningShown: true});

            this.props.viewState.notifications.push({
                title: '试验功能: 增强现实AR',
                message: '增强现实模式目前处于测试阶段. '
                         + '此模式仅适用于最新的高端移动设备. '
                         + '<br /><br />警告: 此模式可能占用大量数据，请注意网络提供商的数据使用费用. '
                         + '<br /><br />此模式的准确性取决于移动设备内部指南针的准确性.',
                confirmText: '开始'
            });
        }

        this.state.augmentedVirtuality.toggleEnabled();
    },

    handleClickRealign() {
        if (!this.state.realignHelpShown) {
            this.setState({realignHelpShown: true});

            this.props.viewState.notifications.push({
                title: '手动对齐',
                message: '对齐你的移动设备，使其与地图当前对齐方式相符,然后点击闪烁的指南针.'
                         + ' 如果在当前地图上未显示要对齐的地标, 你可以使用移动地图'
                         + ' 在将设备和地图对齐之前，拖动和捏合直至可识别的地标可见.'
                         + '<br /><div><img width="100%" src="./build/TerriaJS/images/ar-realign-guide.gif" /></div>'
                         + '<br />提示: 如果你在一个不熟悉的地方，太阳或月亮通常是很好的标志（小心不要看太阳 - 它会伤害你的眼睛）.',
                confirmText: '开始'
            });
        }

        this.state.augmentedVirtuality.toggleManualAlignment();
    },

    handleClickResetRealign() {
        if (!this.state.resetRealignHelpShown) {
            this.setState({resetRealignHelpShown: true});

            this.props.viewState.notifications.push({
                title: '重置对齐',
                message: '重置罗盘对齐，如果对齐与现实世界不符，请尝试挥动.'
                         + ' 可以通过图8中的动作重新校正设备. 这可以在任何时候完成.'
                         + '<br /> <br />避免在磁场或者金属物体附近，因为这些可能会使设备指南针失灵.',
                confirmText: '开始'
            });
        }

        this.state.augmentedVirtuality.resetAlignment();
    },

    handleClickHover() {
        this.state.augmentedVirtuality.toggleHoverHeight();
    },

    render() {
        const enabled = this.state.augmentedVirtuality.enabled;
        let toggleImage = Icon.GLYPHS.arOff;
        let toggleStyle = Styles.btn;
        if (enabled) {
            toggleImage = Icon.GLYPHS.arOn;
            toggleStyle = Styles.btnPrimary;
        }

        const realignment = this.state.augmentedVirtuality.manualAlignment;
        let realignmentStyle = Styles.btn;
        if (realignment) {
            realignmentStyle = Styles.btnBlink;
        }

        const hoverLevel = this.state.augmentedVirtuality.hoverLevel;
        let hoverImage = Icon.GLYPHS.arHover0;
        // Note: We use the image of the next level that we will be changing to, not the level the we are currently at.
        switch (hoverLevel) {
            case 0:
                hoverImage = Icon.GLYPHS.arHover0;
                break;
            case 1:
                hoverImage = Icon.GLYPHS.arHover1;
                break;
            case 2:
                hoverImage = Icon.GLYPHS.arHover2;
                break;
        }

        return (
            <If condition={this.props.terria.viewerMode !== ViewerMode.Leaflet}>
                <div className={Styles.augmentedVirtualityTool}>
                    <button type='button' className={toggleStyle}
                            title='augmented reality tool'
                            onClick={this.handleClickAVTool}>
                            <Icon glyph={toggleImage}/>
                    </button>

                    <If condition={enabled}>
                        <button type='button' className={Styles.btn}
                                title='toggle hover height'
                                onClick={this.handleClickHover}>
                                <Icon glyph={hoverImage}/>
                        </button>

                        <If condition={!this.state.augmentedVirtuality.manualAlignmentSet}>
                            <button type='button' className={realignmentStyle}
                                    title='toggle manual alignment'
                                    onClick={this.handleClickRealign}>
                                    <Icon glyph={Icon.GLYPHS.arRealign}/>
                            </button>
                        </If>

                        <If condition={(this.state.augmentedVirtuality.manualAlignmentSet) && !realignment}>
                            <button type='button' className={Styles.btn}
                                    title='reset compass alignment'
                                    onClick={this.handleClickResetRealign}>
                                    <Icon glyph={Icon.GLYPHS.arResetAlignment}/>
                            </button>
                        </If>
                    </If>
                </div>
            </If>
        );
    }
});

module.exports = AugmentedVirtualityTool;
