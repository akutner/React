import React, { Component } from 'react';
import  elasticsearch from 'elasticsearch'

import './App.css';

//Component imports
import Search from './components/search'
import Slider from './components/slider'
import Result from './components/result'


let client = new elasticsearch.Client({
            host: 'localhost:9200',log: 'trace'
});



//Constants
let ind = 'db';//index to query
let startdate =  "2010-01-01T00:00:00Z";//start date for query, TODO: add drop down to select date
let enddate = "2018-01-01T00:00:00Z";//end date for query, TODO: add drop down to select date
let dateformat = "yyyy-MM-dd'T'HH:mm:ssZ";//format for date into query

let boostconst = 1.3;//raise the range for the slider to this value and then divide by it to get boost val


//gets boost value from slider value
function boostVal(slideVal) {
    return Math.pow(boostconst,slideVal)/boostconst;
}

class App extends Component {
    constructor(props){
        super(props);
        this.state ={
            box: "",
            query: [],//current query list split by " " except those in quotes
            results: [],//results to pass to results pane
            boosts: {},//boosts mapping search to value
        };
        this.getInfo();//initial query
    }


    //queries elastic search and updates results state
    getInfo = () => {        
        const terms = this.state.query;
        //date range
        var daterange = {range: {
                        Date: {
                            gte: startdate, 
                            lt: enddate, 
                            format: dateformat,
                        }}};
        
        var query = []//query terms

        //forming query strings and boost values from string
        for(var x in terms){
            if(terms[x].length >0){
                query.push({query_string: {
                            "query": terms[x],
                            "boost": boostVal(this.state.boosts[terms[x]]),
                        }});
            }
        }

        var parameters = [daterange,];//parameters sent to elasticsearch
        if(query.length>0){//if there was a query
            parameters.push(query);
        }
        
        client.search({
            index: ind,
            body: {query:{bool:{must:parameters}}}
        }).then(function (body) {//more parsing needed!!! send to pane 
            const hits = body.hits.hits;
            //console.log(hits);
            this.setState({results: hits});
        }.bind(this),
        function(error){
            console.trace(error.message);
        });
    }


    handleUpdate = (q) =>{
        this.setState({
            box: q
        });
    }
    //Handles any update in the search queries
    //Supports multi-word terms in quotations
    addTerm = () => {
        
        //update boosts as well (add, subtract ect sliders)
        //check that words all have value, if not add to dict
        //get rid of unnecessary dict keys
         
        const curB = this.state.boosts;
        const lsQ = this.state.query;

        var term = this.state.box;

        if(term.split(" ").length >1){
            term= term.trim();
            term = term.replace(/ /g," AND ");
        }

        if(!(this.state.box in curB)){
            curB[term] = 1;
        }
        lsQ.push(term);

        this.setState({
            query: lsQ,
            boosts : curB,
            box : ""
        }
        , () =>{
            this.getInfo();}
        );
    }
    //handles change of boost
    handleBoost = (term, bo) => {
        const b = this.state.boosts;
        b[term] = bo;
        
        this.setState({
            boosts: b
        }, () => {
            this.getInfo();
        });
    
    }
    
    resetSliders= () => {
        const lsQ = this.state.query;
        const nboosts = {};
        for(var x in lsQ){
            nboosts[lsQ[x]] = 1;
        }
        this.setState({
            boosts: nboosts
        }, () => {
            this.getInfo();
        });
    }
       
    resetQuery = () =>{ 
        this.setState({
            query: [],
            boosts: {},
            box: ""
        }, () => {

            this.getInfo();
        });
    }
    handleRemove = (term) =>{
        const nQuery = new Set(this.state.query);
        nQuery.delete(term);
        
        this.setState({
            query: Array.from(nQuery)
        }, () => {
            this.getInfo();
        });
    }
    
    render() {
        const listTerms = Array.from(new Set(this.state.query));
        //creates list elements of the query term and the slider beneath it
        var terms = <p></p>;
        if(listTerms){
            terms = listTerms.map(q => {
                if(q.length>0){
                    return (
                        <li key={q}>
                        <Slider 
                        term = {q}
                        boost = {this.state.boosts[q]}
                        onBoost = {this.handleBoost}
                        onRemove = {this.handleRemove}
                        />
                        </li>
                    );
                }
            });
        }
        var results = <p>No results found</p>;
        if(this.state.results.length >0){

            results = this.state.results.map(q =>{
                if(q){
                    return (
                        <Result key = {q["_id"]}
                            res = {q}
                        />
                    );
                }
            });
        }
        //TODO:Order by idf
        //  Can I get this from results from the search?
        //  Also need to add current value next to it as well
        //cut out most frequent words (where??)
        //Two-word terms?
        
        return (
            <div className="App">
                <Search 
                    queryUpdate={this.handleUpdate}
                    val = {this.state.box}
                />
                <button className="AddTerm" onClick = {this.addTerm}>Add Term</button>
                <ul>{terms}</ul>
                <button onClick={this.resetSliders}>Reset Sliders</button>
                <button className="RemoveAll" onClick ={this.resetQuery}>Reset Query</button>
                <div className="Results">
                    <p>Results</p>
                    <ul>{results}</ul>
                </div>
            </div>

        );
    }
}

export default App;

