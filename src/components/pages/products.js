import React, { Component } from 'react';

// const urlForAppname = appname =>
	// `https://itunes.apple.com/hk/lookup?id=${app_id}`

class Products extends Component {
  constructor(){
        super();
        this.state = {
            data: []
        };
    };
	
	componentDidMount() {
		fetch("https://itunes.apple.com/hk/rss/topfreeapplications/limit=100/json")
		.then( (response) => response.json() )   
		.then( (json) => {
			console.log(json.feed.entry);
			this.setState({
				data: json.feed.entry
			});
		});
	}
	
	render() {
        return (
			<div>
				{
					this.state.data.map( (dynamicData,i) =>
						<p key={i}>
							{i + 1}
							<img src={dynamicData["im:image"][0].label} />
							{dynamicData["im:name"].label}
							{dynamicData.category.attributes.label}
						</p>
					)
				}
			</div>
		);
    };
}

export default Products;
