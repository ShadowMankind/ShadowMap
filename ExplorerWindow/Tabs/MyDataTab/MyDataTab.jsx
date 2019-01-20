import React from 'react';

import createReactClass from 'create-react-class';

import PropTypes from 'prop-types';

import DataCatalogGroup from '../../../DataCatalog/DataCatalogGroup.jsx';
import DataPreview from '../../../Preview/DataPreview.jsx';
import AddData from './AddData.jsx';
import ObserveModelMixin from '../../../ObserveModelMixin';

import Styles from './my-data-tab.scss';

// My data tab include Add data section and preview section
const MyDataTab = createReactClass({
    displayName: 'MyDataTab',
    mixins: [ObserveModelMixin],

    propTypes: {
        terria: PropTypes.object,
        viewState: PropTypes.object
    },

    onBackButtonClicked() {
        this.props.viewState.myDataIsUploadView = false;
    },

    onAddMoreDataButtonClicked() {
        this.props.viewState.myDataIsUploadView = true;
    },

    hasUserAddedData() {
        return this.props.terria.catalog.userAddedDataGroup.items.length > 0;
    },

    render() {
        return (
            <div className={Styles.root}>
                <div className={Styles.leftCol}>
                    <If condition={this.props.viewState.myDataIsUploadView}>
                        <div className={Styles.addedData}>
                            <If condition={this.hasUserAddedData()}>
                                <button type='button'
                                        onClick={this.onBackButtonClicked}
                                        className={Styles.btnBackToMyData}>
                                    返回
                                </button>
                            </If>
                            <h3 className={Styles.h3}>添加你的数据</h3>
                            <AddData terria={this.props.terria}
                                     viewState={this.props.viewState}/>
                        </div>
                    </If>
                    <If condition={this.hasUserAddedData()}>
                        <div className={Styles.addedData}>
                            <p className={Styles.explanation}>
                                除非你明确地通过分享面板分享它，否则该数据将不能保存和对其他人可见.
                            </p>
                            <ul className={Styles.dataCatalog}>
                                <DataCatalogGroup group={this.props.terria.catalog.userAddedDataGroup}
                                                  viewState={this.props.viewState}/>
                            </ul>
                            <button type='button'
                                    onClick={this.onAddMoreDataButtonClicked}
                                    className={Styles.btnAddMoreData}>
                                添加更多数据
                            </button>
                        </div>
                    </If>
                </div>
                <DataPreview terria={this.props.terria}
                             viewState={this.props.viewState}
                             previewed={this.props.viewState.userDataPreviewedItem}
                />
            </div>
        );
    },
});

module.exports = MyDataTab;
