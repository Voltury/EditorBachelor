'use strict';
const path = require( 'path' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );

module.exports = {
    mode: 'development',
    entry: './src/App.js',
    output: {
        path: path.resolve( __dirname, 'public/dist' ),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: styles.getPostCssConfig( {
                                themeImporter: {
                                    themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' ),
                                },
                                minify: true
                            } )
                        }
                    },
                ]
            },
            {
                test: /\.svg$/,
                use: [ 'raw-loader' ]
            }
        ]
    },
    devtool: 'source-map',
    performance: { hints: false }
};
