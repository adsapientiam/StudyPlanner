import React, {Component} from "react";

export default class Day extends Component { 
    /* 
        props: 
            onSendData:function handleSendData; 
            subjectPreview:array of SubjectBlob, 
            date:int, 
            id:int, 
            weekNum:int,  
            weekday:str, 
            month:str,
    */ 
    constructor(props){
        super(props);
        this.sendData = this.sendData.bind(this);
    }
    
    sendData(){
        const tprops = this.props;
        this.props.onSendData(tprops.id, tprops.date, tprops.month, tprops.weekNum, tprops.todoList, tprops.weekday)
    }
    
    render(){
        return(
            <div className="day" style={this.props.style} data-week={this.props.weekNum} data-month={this.props.month} onClick={this.sendData}>
                <div className="date">
                    <span>{this.props.date}/{this.props.month}</span>
                </div>
                <div className="day-content">
                    {this.props.subjectPreview}
                </div>
            </div>
        )
    }
};

