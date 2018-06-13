import React, {Component} from 'react';



//splits query from Search and renders slider
//passes slider values back to Search to be 
//processed into a query

let boostconst = 1.3;//raise the range for the slider to this value and then divide by it to get boost val


//gets boost value from slider value
function slideVal(boostVal) {
    return Math.pow(Math.pow(boostconst,-1),(1-boostVal)).toFixed(2);//inverse function of boostval

}
class Slider extends Component {


    onRemove = () =>{
        this.props.onRemove(this.props.term)
    }
    onBoost = (e) =>{
        //pass list to parent
        const term =  this.props.term;
        this.props.onBoost(term,parseFloat(e.target.value));

    }
    render(){//value = this.props.boosts[i]
        return (
            
            <div className="Slider">
            <p className="Term">{this.props.term.replace(/ AND/g,"") + " : "+ slideVal(this.props.boost)}</p>
                
                <button className ="RemoveSlider" onClick={this.onRemove}>X</button>
                <input
                    className = "Slide"
                    type = "range"
                    min = "-12"
                    max = "13"
                    value = {this.props.boost}
                    onChange={(e) => this.onBoost(e)}
                />
            </div>    
        );
    } 
}


export default Slider;
