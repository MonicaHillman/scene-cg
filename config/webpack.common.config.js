const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports = {
    entry: {
        main: './src/index.ts'
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: '[name].[chunkhash].js' 
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'WebGL Project',
            template: './src/index.html',
            inject: true,
            minify: {
                removeComments: true,
                collapseWhitespace: false
            }
        }),
        new MiniCssExtractPlugin({
            filename: 'style.[chunkhash].css'
        }),
        new CopyWebpackPlugin([
        {
            from: './src/assets/textures',
            to: 'assets/textures'
        },
        {
            from: './src/assets/shaders',
            to: 'assets/shaders'
        },
        {
            from: './src/assets/models',
            to: 'assets/models'
        }
        ]),
        new CleanWebpackPlugin()
    ],
    resolve: {
        extensions: ['.js', '.ts']
    },
    module: {
        rules: [
            {
                test: [/.js$|.ts$/],
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [                            
                            '@babel/preset-env',
                            '@babel/typescript'
                        ],
                        plugins: [
                            '@babel/plugin-transform-runtime',
                            'transform-class-properties'
                        ]
                    }
                }
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'postcss-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'postcss-loader'
                ]
            },
            {
                test: [/.css$|.scss$/],
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'assets/images'
                        }
                    }
                ]
            },
            {
                test: /\.(glsl|vert|frag)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'assets/shaders'
                        }
                    }
                ]
            }
        ]
    }
}