'use strict';
const path = require( 'path' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );

module.exports = {
    mode: 'development',
    entry: {
        baseline: './src/Suggestions/Baseline/App.js',
        inline: './src/Suggestions/InlineSuggestions/App.js',
        dropdown: './src/Suggestions/DropdownSuggestions/App.js',
        sidebar: './src/Suggestions/SidebarSuggestions/App.js'
    },
    output: {
        path: path.resolve( __dirname, 'public/dist' ),
        filename: '[name].bundle.js'
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
