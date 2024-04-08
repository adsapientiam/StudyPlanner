import React, {Component} from "react";
import TodoElem from "./TodoElem.jsx";
// import "./dayeditorstyle.css";

export default class DayEditor extends Component{ 
    /*props: 
        today: string array; 
        displayTodoList: string array; 
        editorMonthId:obj; 
        onAddNewToDo:func; 
        onTodoListChange:func; 
        onArrowDayChange:func; 
        maxClick:int;

        todaysTimeConfigurations: array of the HH:MM-HH:MM
    */
    constructor(props){
        super(props);
        this.addNewTodo = this.addNewTodo.bind(this);
        this.arrowDayChange = this.arrowDayChange.bind(this);
    }

    addNewTodo(startTime, endTime, subject, desc){ // contains data from input boxes too, the plus is just a click
        this.props.onAddNewTodo(
            <TodoElem  
                parentId={this.props.curDayId}
                onDeleteTodo={this.props.onDeleteTodo}
                onTodoChange={this.props.onTodoChange}
                onMarkOrUnMarkTestDay = {this.props.onMarkOrUnMarkTestDay}
                duration={startTime+"-"+endTime} 
                startTime={startTime} endTime={endTime} 
                subject={subject} desc={desc}
                color={this.props.curColor}
            />
        );
    }

    arrowDayChange(cremention){ 
        const c = this.props.curDayId;
        // when left corner is touched, the -1 will be neutralized by a 1
        // right corner touched, neutralized by -1
        // Otherwise the cremention will be untouched, added by 0
        const newCurDayId = c + cremention + ((c==this.props.minClick&&cremention==-1)||(c==this.props.maxClick&&cremention==1) ? (cremention==-1 ? 1 : -1) : 0);

        this.props.onArrowDayChange(newCurDayId) 
    }

    render(){
        const minuteWithZero = minute => minute.length==1 ? "0"+minute:minute // : string of minute int -> length 2 string

        function checkValues(e){
            e.preventDefault();
            const 
                formElems = e.target.elements,
                vals = Array.from(formElems, inpt=>inpt.value),
                startH=formElems[0],
                startMin=formElems[1],
                endH=formElems[2],
                endMin=formElems[3],
                hours1 = Number(vals[0]),
                hours2 = Number(vals[2]),
                minutes1 = Number(vals[1]),
                minutes2 = Number(vals[3]),
                hourBad = hours1>hours2,
                minuteBad = hours1==hours2 && minutes1>=minutes2;
            
            // no return values on false statements, since no return is an undefined
            if(hourBad){
                startH.setAttribute("style","border:1px solid red")
                endH.setAttribute("style","border:1px solid red")
            }
            if (minuteBad) {
                startMin.setAttribute("style","border:1px solid red")
                endMin.setAttribute("style","border:1px solid red")
            } 
            
            if (!(hourBad||minuteBad)){
                startH.removeAttribute("style");
                endH.removeAttribute("style");
                startMin.removeAttribute("style");
                endMin.removeAttribute("style");
                return [`${vals[0]}:${minuteWithZero(vals[1])}`,`${vals[2]}:${minuteWithZero(vals[3])}`,vals[4],vals[5]];
            }
        }
        function isSuccess(e, thisInstance){
            const formResult = checkValues(e);
            if(formResult){
                thisInstance.addNewTodo(...formResult)
                e.target.elements[5].value = ""
                // The smart student will have the same routine for the day and thus use the same time frame, changing subject and description, on the points below
            }
        }

        return(
            <div id="editor">
                <div id="editor-date-info">
                    <div id="editor-date">
                        <div id="arrow-left" className="arrow" onClick={e=>this.arrowDayChange(-1)}/> 
                        <span id="todayText"> {this.props.displayWeekday} {this.props.displayDate}/{this.props.displayMonth} {this.props.displayWeekNum ? "Vecka " + this.props.displayWeekNum : ""} </span>
                        <div id="arrow-right" className="arrow" onClick={e=>this.arrowDayChange(1)}/>
                    </div>
                </div>
                <form id="inputs" onSubmit={event=>isSuccess(event,this)}> 
                    <span id="startTime"> 
                        <input name ="startHour" className = "time-input" type="number" required min="0" max="23" size="2" />
                        <span>:</span>
                        <input name="startMinute" className = "time-input" type="number" required min="0" max="59"/>
                    </span>
                    <span>-</span>
                    <span id="endTime">
                        <input name="endHour" className = "time-input" type="number" required min="0" max="23"/>
                        <span>:</span>
                        <input name="endMinute" className = "time-input" type="number" required min="0" max="59"/>
                    </span>
                    <select id="subjects" onChange={e=>this.props.onSetCurSubjectColor(e.target.value)} required >
                        {this.props.userSubjectOptions}
                    </select>
                    <textarea style={{marginTop:"3px"}} className="description" name="description"/>
                    <input id="descriptionBtn" className="btn" value="Skapa studiepass" type="submit"/>
                </form>
                <div id="displayTodoList">
                    {this.props.displayTodoList}
                </div>
            </div>
        )
    }
};