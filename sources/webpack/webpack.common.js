const webpack = require("webpack");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    entry: {
        background: [
            path.join(__dirname, '../src/background/index.ts'),
            path.join(__dirname, '../src/background/popupInteraction.ts'),
        ],
        content_script: [
            path.join(__dirname, '../src/content/index.ts'),
        ],
        popup: [
            path.join(__dirname, '../src/content/popup/index.tsx?')
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
        extensions: ['.ts', '.tsx', '.js']
    },
    plugins: [
        new CopyWebpackPlugin([ {
            from: path.join(__dirname, '../extension/**/**'),
            to: path.join(__dirname, '../dist'),
            flatten: true
        }]),
    ]
};
