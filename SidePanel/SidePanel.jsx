import React from 'react';

import createReactClass from 'create-react-class';

import PropTypes from 'prop-types';

import knockout from 'terriajs-cesium/Source/ThirdParty/knockout';

import ObserveModelMixin from '../ObserveModelMixin';
import SearchBox from '../Search/SearchBox.jsx';
import SidebarSearch from '../Search/SidebarSearch.jsx';
import Workbench from '../Workbench/Workbench.jsx';
import Icon from "../Icon.jsx";
import { removeMarker } from '../../Models/LocationMarkerUtils';

import Styles from './side-panel.scss';

const SidePanel = createReactClass({
    displayName: 'SidePanel',
    mixins: [ObserveModelMixin],

    propTypes: {
        terria: PropTypes.object.isRequired,
        viewState: PropTypes.object.isRequired
    },

    componentDidMount() {
        this.subscribeToProps();
    },

    componentDidUpdate() {
        this.subscribeToProps();
    },

    componentWillUnmount() {
        this.unsubscribeFromProps();
    },

    subscribeToProps() {
        this.unsubscribeFromProps();

        // Close the search results when the Now Viewing changes (so that it's visible).
        this._nowViewingChangeSubscription = knockout.getObservable(this.props.terria.nowViewing, 'items').subscribe(() => {
            this.props.viewState.searchState.showLocationSearchResults = false;
        });
    },

    unsubscribeFromProps() {
        if (this._nowViewingChangeSubscription) {
            this._nowViewingChangeSubscription.dispose();
            this._nowViewingChangeSubscription = undefined;
        }
    },

    onAddDataClicked() {
        this.props.viewState.openAddData();
    },

    changeSearchText(newText) {
        this.props.viewState.searchState.locationSearchText = newText;

        if (newText.length === 0) {
            removeMarker(this.props.terria);
        }
    },

    search() {
        this.props.viewState.searchState.searchLocations();
    },

    startLocationSearch() {
        this.props.viewState.searchState.showLocationSearchResults = true;
    },

    render() {
        const searchState = this.props.viewState.searchState;

        return (
            <div className={Styles.workBench}>
                <div className={Styles.header}>
                    <SearchBox onSearchTextChanged={this.changeSearchText}
                               onDoSearch={this.search}
                               onFocus={this.startLocationSearch}
                               searchText={searchState.locationSearchText}
                               placeholder="搜索地点" />
                    <div className={Styles.addData}>
                        <button type='button' onClick={this.onAddDataClicked} className={Styles.button}>
                            <Icon glyph={Icon.GLYPHS.add}/>添加数据
                        </button>
                    </div>
                </div>
                <div className={Styles.body}>
                    <Choose>
                        <When condition={searchState.locationSearchText.length > 0 && searchState.showLocationSearchResults}>
                            <SidebarSearch
                                terria={this.props.terria}
                                viewState={this.props.viewState}
                                isWaitingForSearchToStart={searchState.isWaitingToStartLocationSearch} />
                        </When>
                        <When
                            condition={this.props.terria.nowViewing.items && this.props.terria.nowViewing.items.length > 0}>
                            <Workbench viewState={this.props.viewState} terria={this.props.terria} />
                        </When>
                        <Otherwise>
                            <div className={Styles.workbenchEmpty}>
                                <div>你的工作台为空</div>
                                <p><strong>请点击 &apos;添加数据&apos;:</strong></p>
                                <ul>
                                    <li>浏览数据目录</li>
                                    <li>加载数据至地图</li>
                                </ul>
                                <p><Icon glyph={Icon.GLYPHS.bulb}/><strong>提示:</strong> <em>加载的数据集将呈现在这里</em></p>
                            </div>
                        </Otherwise>
                    </Choose>
                </div>
            </div>
        );
    },
});

module.exports = SidePanel;
