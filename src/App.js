import React, { Component } from 'react';
import{
	BrowserRouter as Router,
	Route
} from 'react-router-dom'

import './Assets/css/default.min.css';

import Footer from './components/footerComponents/footer';
import Homepage from './components/pages/homePage';
import Products from './components/pages/products';

class App extends Component {
  render() {
    return (
		<Router>
			<div className="App">
	  
			
			
				<Route exact path='/' component={Homepage} />
				<Route exact path='/Products' component={Products} />
			
			<Footer />
		
			</div>
		</Router>
    );
  }
}

export default App;
