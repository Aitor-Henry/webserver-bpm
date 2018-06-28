import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.min.css'
import React from 'react';
import ReactDom from 'react-dom';
import {createStore,applyMiddleware} from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Router,Route,browserHistory} from 'react-router';
import { createLogger } from 'redux-logger'

import rootReducer from './ui/reducers/index.js';
import NavBar from './ui/containers/navbar.js'
import Options from './ui/containers/options.js'
import Infos from './ui/components/infos.js'
import Video from './ui/containers/Video.js'

const store=createStore(rootReducer,applyMiddleware(thunk, createLogger()));

class Main extends React.Component{

  render(){
    return (
      
      <div>
        <NavBar />
        <Options />
        <Infos />
        <Video />
      </div>
    )
  }
}


ReactDom.render(<Provider store={store}>
                <Router history={browserHistory}>
                  <Route path='/' component={Main}/>
                  <Route path='/:bpmKey' component={Main}/>
                </Router>
                </Provider>,
                document.getElementById('main'));

