const path = require('path');

module.exports = {
  // ... other webpack configurations
  
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: /node_modules/
      },
      // ... other rules
    ]
  },
  
  ignoreWarnings: [/Failed to parse source map/],
};