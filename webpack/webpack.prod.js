const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const common = require('./webpack.common.js');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require('path')

module.exports = merge(common, {
    mode: 'production',
    optimization: {
        minimizer: [
            new UglifyJSPlugin()
        ]
    },
    plugins: [
        new CleanWebpackPlugin(path.join(__dirname, '../dist'), {
            allowExternal: true
        })
    ]
});