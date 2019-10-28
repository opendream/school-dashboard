const { resolve } = require('path')

const path = require('path');
const srcPath = path.join(__dirname, '/../src');

const HtmlWebPackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: "./src/index.js",
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'
    },
    // vendor: [
    //     'xlsx',
    //     'file-saver'
    // ],
    node: {fs: 'empty'},
    externals: [
        {'./cptable': 'var cptable'},
        {'./jszip': 'jszip'}
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader"
                    }
                ]
            },
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
            components: `${srcPath}/components/`,
            config: `${srcPath}/config/`,
        }
    },
    devServer: {
        historyApiFallback: true,
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./public/index.html",
            filename: "index.html"
        }),
        new CopyPlugin([
            { from: 'public/static', to: 'static' },
        ]),
    ]
};