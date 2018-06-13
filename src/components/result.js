
import React, {Component} from 'react'

//Class to extract info from returned results
//handle individual result objects
class Result extends Component{

    parse = (res) => {
        var parsedObj = {};
        var info = res["_source"];
        parsedObj["title"] = info["Article Title"];
        parsedObj["content"] = info["Full Content"];
        return parsedObj;
    }

    render(){
        const q = this.parse(this.props.res);
        return(
            <li key= {q.title}>
                <p>{q.title}</p>
                <p>{q.content}</p>
            </li>
        );
    }

}








export default Result
