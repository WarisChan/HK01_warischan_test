import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { isChrome, isFirefox, isSafari, isIE, isEdge, isOpera } from './BrowserDetection'

const propTypes = {
    items: PropTypes.array.isRequired,
    onChangePage: PropTypes.func.isRequired,
    initialPage: PropTypes.number    
}

const defaultProps = {
    initialPage: 1
}

let isOnComposition = false;
let isInnerChangeFromOnChange = false;
	
class Pagination  extends Component {
	constructor(props) {
        super(props);
        this.state = { pager: {} };
    }

    componentWillMount() {
        // set page if items array isn't empty
        if (this.props.items && this.props.items.length) {
            this.setPage(this.props.initialPage);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        // reset page if items array has changed
        if (this.props.items !== prevProps.items) {
            this.setPage(this.props.initialPage);
        }
    }

    setPage(page) {
        var items = this.props.items;
        var pager = this.state.pager;

        // get new pager object for specified page
        pager = this.getPager(items.length, page);

        // get new page of items from items array
        var pageOfItems = items.slice(pager.startIndex, pager.endIndex + 1);

        // update state
        this.setState({ pager: pager });

        // call change page function in parent component
        this.props.onChangePage(pageOfItems, page);
    }

    getPager(totalItems, currentPage, pageSize) {
        // default to first page
        currentPage = currentPage || 1;

        // default page size is 10
        pageSize = pageSize || 10;

        // calculate total pages
        var totalPages = Math.ceil(totalItems / pageSize);

        var startPage, endPage;
        if (totalPages <= 10) {
            // less than 10 total pages so show all
            startPage = 1;
            endPage = totalPages;
        } else {
            // more than 10 total pages so calculate start and end pages
            if (currentPage <= 6) {
                startPage = 1;
                endPage = 10;
            } else if (currentPage + 4 >= totalPages) {
                startPage = totalPages - 9;
                endPage = totalPages;
            } else {
                startPage = currentPage - 5;
                endPage = currentPage + 4;
            }
        }

        // calculate start and end item indexes
        var startIndex = (currentPage - 1) * pageSize;
        var endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

        // create an array of pages to ng-repeat in the pager control
        var pages = _.range(startPage, endPage + 1);

        // return object with all pager properties required by the view
        return {
            totalItems: totalItems,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            startIndex: startIndex,
            endIndex: endIndex,
            pages: pages
        };
    }

    render() {
        var pager = this.state.pager;

        if (!pager.pages || pager.pages.length <= 1) {
            // don't display pager if there is only 1 page
            return null;
        }

        return (
			<div className="text-center">
				<ul className="pagination">
					{pager.pages.map((page, index) =>
						<li key={index} className={pager.currentPage === page ? 'active' : ''}>
							<a onClick={() => this.setPage(page)}>{page}</a>
						</li>
					)}
				</ul>
			</div>
        );
    }
}

class Homepage extends React.Component {
	constructor(props) {
        super(props);
		
        this.state = {
            topfreeapp: [],
            grossingapp: [],
            pageOfItems: [],
            topfreeapp_filter: [],
            grossingapp_filter: [],
			typed: "",
			page: 0
        };

        // bind function in constructor instead of render (https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-bind.md)
        this.onChangePage = this.onChangePage.bind(this);
    }
	
	componentWillMount() {
		fetch("https://itunes.apple.com/hk/rss/topgrossingapplications/limit=10/json")
		.then( (response) => response.json() )   
		.then( (json) => {
			this.setState({
				grossingapp: json.feed.entry
			});
		});
		
		fetch("https://itunes.apple.com/hk/rss/topfreeapplications/limit=100/json")
		.then( (response) => response.json() )   
		.then( (json) => {
			this.setState({
				topfreeapp: json.feed.entry
			});
		});
	}
	
    onChangePage(pageOfItems, page) {
        // update state with new page of items
        this.setState({ 
			page: page,
			pageOfItems: pageOfItems 
		});
    }

	updateSearch(event) {		
		event.target.value = event.target.value.replace(/\\/g, "\\\\");
		
		this.setState({ 
			typed: event.target.value 
		});
		
		function addlist(json, searchword){
			var updatedList = json;
			
			updatedList = updatedList.filter(function(item){
				return item["im:name"].label.toLowerCase().search(
				searchword.toLowerCase()) !== -1;
			});
			return updatedList;
		}
		
		fetch("https://itunes.apple.com/hk/rss/topfreeapplications/limit=100/json")
		.then( (response) => response.json() )   
		.then( (json) => {
			this.setState({
				topfreeapp: addlist(json.feed.entry, this.state.typed)
			});
		});
		
		fetch("https://itunes.apple.com/hk/rss/topgrossingapplications/limit=10/json")
		.then( (response) => response.json() )   
		.then( (json) => {
			this.setState({
				grossingapp: addlist(json.feed.entry, this.state.typed)
			});
		});
	}
	
	handleComposition = (e: Event) => {
		if (!(e.target instanceof HTMLInputElement)) return

		if (e.type === 'compositionend') {
			// Chrome is ok for only setState innerValue
			// Opera, IE and Edge is like Chrome
			if (isChrome || isIE || isEdge || isOpera) {
				this.setState({ innerValue: e.target.value })
			}

			// Firefox need to setState inputValue again...
			if (isFirefox) {
				this.setState({ innerValue: e.target.value, inputValue: e.target.value })
			}

			// Safari think e.target.value in composition event is keyboard char,
			//  but it will fired another change after compositionend
			if (isSafari) {
				 // do change in the next change event
				isInnerChangeFromOnChange = true
			}
			
			this.updateSearch(e);

			isOnComposition = false
		} else {
			isOnComposition = true
		}
	}

	handleChange = (e: Event) => {
		if (!(e.target instanceof HTMLInputElement)) return

		if (isInnerChangeFromOnChange) {
			this.setState({ inputValue: e.target.value, innerValue: e.target.value })
			isInnerChangeFromOnChange = false;
			return
		}

		// when is on composition, change inputValue only
		// when not in composition change inputValue and innerValue both
		if (!isOnComposition) {
			this.setState({
				inputValue: e.target.value,
				innerValue: e.target.value,
			})
			this.updateSearch(e);
		} else {
			this.setState({ inputValue: e.target.value })
		}
	}
		
	render() {
		let current_page = this.state.page - 1;
		return (
			<div>
				<div className="right-inner-addon text-center">
					<div className="search-container">
						<input className="glyphicon" type="text" onCompositionStart={this.handleComposition}  onCompositionUpdate={this.handleComposition} onCompositionEnd={this.handleComposition} onChange={this.handleChange} placeholder="&#xe003;搜尋"/>
					</div>
				</div>
				<div className="container">
					<div className="spacing"></div>
					<h2>推介</h2>
					<div className="gross-app-group">
						<div className="row-fluid">
							{this.state.grossingapp.map( (item,i) =>
								<div key={i} className="col-xs-4 align-top">
									<a href={item["link"]["attributes"].href} target="_blank">
									<img className="gross-app-icon" alt="" src={item["im:image"][0].label} />
									<p>{item["im:name"].label}</p>
									<p className="category">{item.category.attributes.label}</p>
									</a>
								</div>
							)}
						</div>
					</div>
					<hr/>
					<div className="top-app-group">
						{this.state.pageOfItems.map( (item,i) =>
							<div key={i} className="app-container">
							<table>
								<tbody>
								<tr>
									<td rowSpan="2"><div className="app-id">{i + (current_page*10) + 1}</div></td>
									<td rowSpan="2"><img className={( (i+1)%2 ? 'top-app-icon' : 'top-app-icon-even')} alt="" src={item["im:image"][0].label} /></td>
									<td><a href={item["link"]["attributes"].href} target="_blank">{item["im:name"].label}</a></td>
								</tr>
								<tr>
									<td><span className="category">{item.category.attributes.label}</span></td>
								</tr>
								</tbody>
							</table>
							</div>
						)}
						<Pagination items={this.state.topfreeapp} onChangePage={this.onChangePage} />
					</div>
				</div>
				<hr />
			</div>
		);
	};
}

Pagination.propTypes = propTypes;
Pagination.defaultProps = defaultProps;

export default Homepage;
