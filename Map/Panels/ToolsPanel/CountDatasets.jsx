'use strict';

import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import ObserverModelMixin from '../../../ObserveModelMixin';
import defined from 'terriajs-cesium/Source/Core/defined';
import when from 'terriajs-cesium/Source/ThirdParty/when';
import Loader from "../../../Loader.jsx";

import Styles from './tools-panel.scss';

let countValue = 1;

const CountDatasets = createReactClass({
    displayName: 'CountDatasets',
    mixins: [ObserverModelMixin],

    propTypes: {
        terria: PropTypes.object,
        viewState: PropTypes.object.isRequired,
    },

    getInitialState() {
      return {
        btnText: '开始'
      };
    },

    countDatasets() {
        const totals = {
            name: undefined,
            groups: 0,
            items: 0,
            messages: [],
            subTotals: [],
            showResults: false
        };

        function counter(group, stats, path) {
            stats.name = group.name;

            const promises = [];

            for (let i = 0; i < group.items.length; ++i) {
                const item = group.items[i];
                if (item.countValue === countValue) {
                    continue;
                }
                item.countValue = countValue;
                if (typeof item.items !== 'undefined') {
                    const childStats = {
                        name: undefined,
                        groups: 0,
                        items: 0,
                        messages: [],
                        subTotals: []
                    };

                    path.push(item.name);

                    const loadPromise = item.load();
                    if (defined(loadPromise) && item.isLoading) {
                        promises.push(loadPromise.then(recurseAndUpdateTotals.bind(undefined, item, stats, childStats, path.slice())).otherwise(reportLoadError.bind(undefined, item, stats, path.slice())));
                    } else {
                        promises.push(recurseAndUpdateTotals(item, stats, childStats, path));
                    }

                    path.pop();
                } else {
                    ++stats.items;
                }
            }

            return when.all(promises);
        }

        function recurseAndUpdateTotals(item, stats, childStats, path) {
            const promise = counter(item, childStats, path).then(function() {
                stats.groups += childStats.groups + 1;
                stats.items += childStats.items;
                stats.messages.push.apply(stats.messages, childStats.messages);
                stats.subTotals.push(childStats);
            });
            return promise;
        }

        function reportLoadError(item, stats, path) {
            stats.messages.push(path.join(' -> ') + ' 加载失败.');
        }

        this.setState({
          btnText: <Loader message='计算中, 请稍等...'/>
        });

        ++countValue;

        const root = this.props.terria.catalog.group;
        const that = this;

        counter(root, totals, []).then(function() {
            let info = '<div>此目录包含 ' + totals.items + ' 项目在 ' + totals.groups + ' 组.</div>';
            that.props.updateResults(info);
            let i;
            const subTotals = totals.subTotals;
            for (i = 0; i < subTotals.length; ++i) {
                info += '<div>' + subTotals[i].name + ': ' + subTotals[i].items + ' items / ' + subTotals[i].groups + ' groups</div>';
            }

            info += '<div>&nbsp;</div>';

            const messages = totals.messages;
            for (i = 0; i < messages.length; ++i) {
                info += '<div>' + messages[i] + '</div>';
            }
            that.setState({
              btnText: '重新计算'
            });

            that.props.updateResults(info);
        });
    },

    render() {
        return (
            <form>
                计算数据集
                <button className={Styles.submit} onClick={this.countDatasets} type="button" value="Count datasets">{this.state.btnText}</button>
            </form>
        );
    },
});

export default CountDatasets;
