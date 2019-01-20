import React from 'react';

import createReactClass from 'create-react-class';

import PropTypes from 'prop-types';

import ObserveModelMixin from '../ObserveModelMixin';
import Styles from './data-preview.scss';
/**
 * URL section of the preview.
 */
const DataPreviewUrl = createReactClass({
    displayName: 'DataPreviewUrl',
    mixins: [ObserveModelMixin],

    propTypes: {
        metadataItem: PropTypes.object.isRequired
    },

    selectUrl(e) {
        e.target.select();
    },

    render() {
        return (
            <div>
                <h4 className={Styles.h4}>{this.props.metadataItem.typeName} URL</h4>
                <If condition={this.props.metadataItem.type === 'wms'}>
                    <p>
                        这是一个<a href="https://en.wikipedia.org/wiki/Web_Map_Service" target="_blank" rel="noopener noreferrer">WMS
                        服务</a>, 可以根据请求生成地图影像. 可在GIS软件中使用此链接:
                    </p>
                </If>
                <If condition={this.props.metadataItem.type === 'wfs'}>
                    <p>
                        这是一个<a href="https://en.wikipedia.org/wiki/Web_Feature_Service" target="_blank" rel="noopener noreferrer">WFS
                        服务</a>, 可以根据请求传输原始空间数据. 可在GIS软件中使用此链接:
                    </p>
                </If>
                <input readOnly className={Styles.field} type="text" value={this.props.metadataItem.url}
                       onClick={this.selectUrl}/>
                <If condition={(this.props.metadataItem.type === 'wms' || (this.props.metadataItem.type === 'esri-mapServer' && this.props.metadataItem.layers))}>
                    <p>图层
                        名称{this.props.metadataItem.layers.split(',').length > 1 ? 's' : ''}: {this.props.metadataItem.layers}</p>
                </If>
                <If condition={this.props.metadataItem.type === 'wfs'}>
                    <p>类型
                        名称{this.props.metadataItem.typeNames.split(',').length > 1 ? 's' : ''}: {this.props.metadataItem.typeNames}</p>
                </If>
            </div>
        );
    },
});

export default DataPreviewUrl;
