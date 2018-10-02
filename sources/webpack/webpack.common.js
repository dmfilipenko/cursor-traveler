const webpack = require("webpack");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    entry: {
        // popup: [
        //     path.join(__dirname, '../src/popup/index.ts'),
            
        // ],
        // options: path.join(__dirname, '../src/options/index.ts'),
        background: [
            path.join(__dirname, '../src/background/index.ts'),
            path.join(__dirname, '../src/background/popupInteraction.ts'),
        ],
        content_script: [
            path.join(__dirname, '../src/content/index.ts')
        ]
    },
    output: {
        path: path.join(__dirname, '../dist/js'),
        filename: '[name].js'
    },
    // optimization: {
    //     splitChunks: {
    //         name: 'vendor',
    //         chunks: "initial"
    //     }
    // },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        alias: {
            'react': 'preact-compat',
            'react-dom': 'preact-compat',
            // Not necessary unless you consume a module using `createClass`
            'create-react-class': 'preact-compat/lib/create-react-class',
            // Not necessary unless you consume a module requiring `react-dom-factories`
            'react-dom-factories': 'preact-compat/lib/react-dom-factories'
        }
    },
    plugins: [
        new CopyWebpackPlugin([ {
            from: path.join(__dirname, '../extension/**/**'),
            to: path.join(__dirname, '../dist'),
            flatten: true
        }]),
    ]
};
