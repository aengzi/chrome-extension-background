module.exports = {
	mode: 'production',
	entry: './src/index.js',
    optimization: {
      minimize: false
    },
	output: {
		filename: 'background.min.js',
		path: __dirname+'/../aengzi-chrome-extension/'
	},
	devtool: 'source-map'
};
