import React, { Component } from 'react';

import './Assets/css/default.min.css';

import Footer from './components/footerComponents/footer';
import Homepage from './components/pages/homePage';

class App extends Component {
  render() {
    return (
		<div className="App">
  
		
		
			<Homepage />
		
		<Footer />
	
		</div>
    );
  }
}

export default App;
