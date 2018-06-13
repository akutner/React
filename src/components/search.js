import React, { Component } from 'react';

class Search extends Component {    
    handleInputChange = () => {
        var val = this.search.value
        this.props.queryUpdate(val)
    }
    
    render() {
        return (
            <form>
                <input
                    placeholder="Search for..."
                    ref={input => this.search = input}
                    onChange={this.handleInputChange}
                    value= {this.props.val}
                />
            </form>
        )
    }
}

export default Search;



