module.exports ={
  entry:{
    main: ['./index.js']
  },
  output: {
    path: __dirname + '/webpack_output',
    filename: 'bundle.js'
  },

  module: {
    rules: [
      {
	test: /\.js/,
	exclude: /node_modules/,
        enforce: "pre",
	use:[
          "babel-loader",
      ]
      },
      {
	test: /\.css$/,
        use: [
          {
	    loader: "style-loader"
          },
          {
            loader: "css-loader",
            options: {
              modules: false
            }
          }
        ]
      },
      {
	test: /\.less$/,
        use: [
          {
	    loader: "style-loader"
          },
          { loader: "css-loader",
            options: {
              importLoaders: "1"
            }
          },
          {
            loader: "less-loader"
          }
        ]
      },
      {
    test: /\.jsx$/,
        loader: "babel-loader",
	      exclude: /node_modules/
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=[a-z0-9]\.[a-z0-9]\.[a-z0-9])?$/,
        loader: 'url-loader?limit=100000'
      },


	  ]
  }
}
