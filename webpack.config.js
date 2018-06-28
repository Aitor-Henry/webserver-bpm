module.exports ={
  entry:{ //Le fichier d'entrer qui nous interesse
    main: ['./index.js']
  },
  output: { //Le fichier en sortie
    path: __dirname + '/webpack_output',
    filename: 'bundle.js' //Le fichier en sortie sera bundle.js
  },

  devServer: {
    host: "0.0.0.0",
    historyApiFallback:true,
    proxy: {
      '/api/*': {
        target: "http://localhost:8066",
	      xfwd: true
      },
      '/bcu_basler/api/image_channel':{
        target: "ws://localhost:8066",
        ws: true,
        secure: false
      }
    }
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
      /*{
        test: /\.html$/,
          use: [ {
            loader: 'html-loader',
            options: {
              minimize: true
            }
          }
        ]
      },*/

	  ]
  }
}
