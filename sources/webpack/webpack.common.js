const webpack = require("webpack");
const CopyWebpackPlugin = require('copy-webpack-plugin');

const path = require('path');

module.exports = {
    entry: {
        background: [
            path.join(__dirname, '../src/background'),
            // path.join(__dirname, '../src/background/popupInteraction.ts'),
        ],
        content_script: [
            path.join(__dirname, '../src/content')
        ],
        popup: [
            path.join(__dirname, '../src/popup')
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
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: "css-loader",
                        options: {
                            modules: true,
                            importLoaders: 1,
                            localIdentName: "[name]_[local]_[hash:base64]",
                            sourceMap: true,
                            minimize: true
                        }
                    }
                ]
              }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    plugins: [
        new CopyWebpackPlugin([ {
            from: path.join(__dirname, '../extension/**/**'),
            to: path.join(__dirname, '../dist'),
            flatten: true
        }]),
    ]
};
