const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const common = require('./webpack.common.js');
const ZipFilesPlugin = require('webpack-zip-files-plugin');
const path = require('path')

module.exports = merge(common, {
    mode: 'production',
    optimization: {
        minimizer: [
            new UglifyJSPlugin()
        ]
    }
});