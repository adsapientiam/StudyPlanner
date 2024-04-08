import React, {Component} from "react";

import generateCalendar from "./Logic/generateCalendar.jsx";

import DayEditor from "./Components/DayEditor.jsx";
import Day from "./Components/Day/Day.jsx";
import TodoElem from "./Components/TodoElem.jsx";
import SubjectBlob from "./Components/Day/SubjectBlob.jsx";

const axios = require("axios");

export default class StudyPlanner extends Component{ 
    constructor(props){ 
        super(props);
        this.handleSendData = this.handleSendData.bind(this);
        this.handleArrowDayChange = this.handleArrowDayChange.bind(this);
        this.handleAddNewTodo = this.handleAddNewTodo.bind(this);
        this.handleTodoChange = this.handleTodoChange.bind(this);
        this.handleDeleteTodo = this.handleDeleteTodo.bind(this);
        this.handleMarkOrUnMarkTestDay = this.handleMarkOrUnMarkTestDay.bind(this);
        this.onUnload = this.onUnload.bind(this);
        this.setCurSubjectColor = this.setCurSubjectColor.bind(this);

        this.userSubjects = this.props.subjects;

        const calendarMemoryDatasDays = this.props.calendarMemoryDatasDays; 

        const useToday = require("./Logic/globalNow").TODAY;
        const useNow = require("./Logic/globalNow").NOW;

        // If it's the first week of the calendar, there might be some shellDays to take space
        let shellDayCount = 0; 

        if(!calendarMemoryDatasDays){ // Generates a calendar through generatedCalendar
            const generatedCalendar = generateCalendar(this, this.props.endTime);

            // the working copy of the user's calendar which replaces the preexisting when application is turned off
            this.useCalendar = generatedCalendar[0];

            /* Array with objects each having these parameters:
                todoList:[], 
                style:{}, though assigned later
                _date:dayProps[i][0], 
                _month:dayProps[i][1],
                _weekNum:curWeek,
                _weekday:weekdayData
            */
            this.useCalendarData = generatedCalendar[1];

            shellDayCount = generatedCalendar[2];

            // Set useNow on its first monday cuz then easier to use
            useNow.setUTCDate(useNow.getUTCDate()+1-useNow.getUTCDay())
            useNow.setUTCHours(0)
            useNow.setUTCMinutes(1)
            this.lastWeekErase = Number(useNow);
        } 
        else { // Takes the data stored in the db to reconstruct the objects' components
            let calendarData;
            this.lastWeekErase = this.props.lastWeekErase;

            const weekDifference = Math.floor((useNow-this.lastWeekErase)/604800000);

            if (weekDifference > 0){
                calendarData = calendarMemoryDatasDays.slice(weekDifference*7,Infinity);
                useNow.setUTCDate(useNow.getUTCDate()+1-useNow.getUTCDay());
                useNow.setUTCHours(0);
                useNow.setUTCMinutes(1)
                this.lastWeekErase = Number(useNow);
            }
            else calendarData = calendarMemoryDatasDays;

            const calendarLength = calendarData.length;
            this.useCalendarData = calendarData; // Array of objects
            
            let calendarElements = [], calendarDataDay, todoListData, todoListDataLength, dayTodoList, curTodoData;
            for(let i=0; i<calendarLength; i++){
                calendarDataDay = calendarData[i];

                if(calendarDataDay){
                    todoListData = calendarDataDay.todoList;
    
                    todoListDataLength = todoListData.length;
                    dayTodoList = [];
                    for(let j=0;j<todoListDataLength; j++){
                        curTodoData = todoListData[j];

                        // only color matters for the todo as a new subject choice => new color
                                        // ParentId is required for auto updates in Day selection's todos. Otherwise this.props.index is preferable
                        dayTodoList[j] = <TodoElem parentId={i}
                                            onDeleteTodo={this.handleDeleteTodo}
                                            onTodoChange={this.handleTodoChange}
                                            onMarkOrUnMarkTestDay = {this.handleMarkOrUnMarkTestDay}
                                            duration={curTodoData.duration} 
                                            startTime={curTodoData.startTime} endTime={curTodoData.endTime} 
                                            subject={curTodoData.subject}
                                            color={curTodoData.color} desc={curTodoData.desc}
                                            // if not undefined this one is to make a thick width in SubjectBlobs
                                            subjectBlobStyleWidth={curTodoData.subjectBlobStyleWidth}/>
                    }

                    calendarElements[i] = <Day id={i} style={calendarDataDay.style} onSendData={this.handleSendData} subjectPreview={this.intoBlobs(dayTodoList)} 
                            todoList = {dayTodoList} todosTimeConfigurations={calendarDataDay.todosTimeConfigurations}
                            date={calendarDataDay._date} month={calendarDataDay._month} weekNum={calendarDataDay._weekNum} weekday={calendarDataDay._weekday} />
                }
                else {
                    // A "shellDay" is just meant to take space
                    shellDayCount++
                    calendarElements[i] = <div className="shell-day"></div>;
                }
            }
            this.useCalendar = calendarElements;
        }

        this.useCalendarLength = this.useCalendar.length-1; // so that arrowDayChange won't exceed Calendar length
        this.minClick = shellDayCount;
        
        this.monthId = {"Januari":1, "Februari":2,"Mars":3,"April":4,"Maj":5,"Juni":6,"Juli":7,"Augusti":8,"September":9,"October":10,"November":11, "December":12 }; // used in render() too
        
        // to decide start date; loops through user calendar and stops on object with same date and month value
        let curElem, curElemDate, curElemMonth, calendarExpired=true;
        for (let i = shellDayCount; i<this.useCalendarLength; i++){ 
            curElem = this.useCalendar[i].props; 
            curElemDate = curElem.date;
            curElemMonth = curElem.month-1; // useToday's January is 0
            this.curElemId = curElem.id; // will be changed through DayEditor arrowDayChange

            // if this one never called the useToday is out of range
            if(curElemDate == useToday[1] && curElemMonth == useToday[0]){
                calendarExpired=false
                break
            }
        };
        this.firstDay = this.useCalendar[shellDayCount].props;
        this.lastDay = this.useCalendar[this.useCalendarLength].props;

        const subjects = Object.keys(this.userSubjects);
        // for the <select> in DayEditor
        this.userSubjectOptions = Array.from(subjects, subject => <option>{String(subject)}</option>)

        this.state = {id:this.curElemId, chosenDay:curElem.weekday, chosenDate: curElemDate, chosenMonth: curElem.month, 
            chosenWeekNum: curElem.weekNum, chosenTodoList: curElem.todoList, curColor:this.userSubjects[subjects[0]]};
                                                                        // when initiated the first option is auto-chosen
    }

    onUnload(){
        axios.post("http://localhost:2999/calendar/unload", {days:this.useCalendarData, subjects:this.userSubjects, lastWeekErase:this.lastWeekErase})
        .catch(err=>{console.log(err)})
    }
      
    componentDidMount() {
        window.addEventListener("beforeunload", this.onUnload)
    }
    
    componentWillUnmount() {
        window.removeEventListener("beforeunload", this.onUnload);
    }

    handleSendData(id, date, month, weekNum, TodoList, weekday){
        this.setState({id:id, chosenDay:weekday, chosenDate:date, chosenMonth:month, chosenWeekNum:weekNum, chosenTodoList:TodoList})
    }

    handleArrowDayChange(newCurDayId){ 
        const changedDayProps = this.useCalendar[newCurDayId].props; 
        this.setState({id:changedDayProps.id, chosenDay:changedDayProps.weekday, chosenDate:changedDayProps.date, chosenMonth:changedDayProps.month, 
            chosenWeekNum:changedDayProps.weekNum, chosenTodoList:changedDayProps.todoList})
    }

    setCurSubjectColor(curSubject){
        this.setState({curColor:this.userSubjects[curSubject]})
    }

    //parentId cuz only the day needs to get the CSS stuff
    handleMarkOrUnMarkTestDay(idOfTriggeringTodo){
        const parentId = this.state.id;
        let 
            curDayProps = {...this.useCalendar[parentId].props}; 

        const THICKWIDTHTODO = "2.5px";

        // to make any potential TodoElems into just their props so that this.useCalendar can take them
        const 
            curTodoListLength = curDayProps.todoList.length,
            curDayTodoList = curDayProps.todoList;

        let curTodoProps, 
            todoListProps=[], todoList=[], 
            thereIsNoTestTodo=true;

        for(let i=0; i<curTodoListLength; i++) {
            curTodoProps = {...curDayTodoList[i].props};

            if(curTodoProps.parentId == idOfTriggeringTodo[0] && curTodoProps.endTime == idOfTriggeringTodo[1]) {
                if(curTodoProps["subjectBlobStyleWidth"]) delete curTodoProps["subjectBlobStyleWidth"];
                else curTodoProps["subjectBlobStyleWidth"] = THICKWIDTHTODO;
            }

            // subjectBlobStyleWidth is appended on todoProps uniquely for test SubjectBlobs
            if(curTodoProps.subjectBlobStyleWidth) thereIsNoTestTodo=false; 

            todoListProps[i] = curTodoProps;
            todoList[i] = <TodoElem {...curTodoProps}/>
        }

        if(thereIsNoTestTodo) delete curDayProps.style;
        else curDayProps["style"] = {borderWidth:"2.5px"};  

                                    // remember that day style and subjectBlobStyleWidth are used on different objects!
        this.useCalendarData[parentId] = {todoList:todoListProps, todosTimeConfigurations:curDayProps.todosTimeConfigurations,
            style:curDayProps.style, _date:curDayProps.date, _month:curDayProps.month, _weekNum:curDayProps.weekNum, _weekday:curDayProps.weekday}; 

        this.useCalendar[parentId] = <Day {...curDayProps} todoList={todoList} subjectPreview={this.intoBlobs(todoList)}/>
        this.setState({chosenTodoList:todoList})
    }

    // method applied only on methods below
    intoBlobs = todos => { 
        let 
            subjectPreview = [],
            curTodoProps;
        for(let i=0, todoLen=todos.length; i<todoLen; i++){
            curTodoProps = todos[i].props;                
            subjectPreview[i] = <SubjectBlob duration={curTodoProps.duration} subjectBlobStyle={{borderColor:curTodoProps.color, borderWidth:curTodoProps.subjectBlobStyleWidth||"1.5px"}}
                desc={curTodoProps.desc}/> 
        }
        return subjectPreview
    }

    // Color assignment: choose a subject => state change to have the subject color as the main one => when creating new todo that will be its color 
    // Need to change, just copy paste the data into new todo and choose the correct subject, simple as.
    handleTodoChange(newDesc, todoEndTime){
        const curDayId = this.state.id;
        let useValues = this.useCalendar[curDayId].props;
        let curTodoProps;

        const useValuesTodoCount = useValues.todoList.length;
        for (let i = 0; i<useValuesTodoCount;i++){
            const curTodo = useValues.todoList[i];
            curTodoProps = curTodo.props;

            // endTime is unique and more reliable than ids as Todos might be deleted and added
            if(curTodoProps.endTime == todoEndTime){ 
                this.useCalendarData[curDayId].todoList[i] = {...curTodoProps, desc:newDesc}
                useValues.todoList[i] = <TodoElem {...curTodoProps} desc={newDesc}/>;
                this.useCalendar[curDayId] = <Day {...useValues} subjectPreview={this.intoBlobs(useValues.todoList)}/>; 
                break
            }
        }
        this.setState({}); 
    }

    handleAddNewTodo(newTodo){ 
        const
            curDayId = this.state.id,
            curElemProps = this.useCalendar[curDayId].props,
            curElemPropsTodoList =curElemProps.todoList, // for usage in the if-statement
            todoCount = curElemPropsTodoList.length,
            todosTimeConfigurations = curElemProps.todosTimeConfigurations,
                storedStartTimes = todosTimeConfigurations.startTimes,
                storedDurations = todosTimeConfigurations.durations,
            
            // sort by the startTimes
            newTodosStartTimes = newTodo.props.startTime.split(":"),
                newTodoStartTime = Number(newTodosStartTimes [0])*60 + Number(newTodosStartTimes [1]),
            newTodosEndTimes = newTodo.props.endTime.split(":"),
            newTodoDuration= Number(newTodosEndTimes[0])*60 + Number(newTodosEndTimes[1]) - newTodoStartTime,

            updateTimeConfigurations = index => {
                // placing before ensures that it is always before placing afterwards ensures always afterwards even though for loop places correctly
                storedStartTimes .splice(index, Infinity, newTodoStartTime, ...storedStartTimes.slice(index, Infinity));
                storedDurations  .splice(index, Infinity,newTodoDuration, ...storedDurations.slice(index, Infinity));

                return {
                    startTimes:storedStartTimes,
                    durations:storedDurations
                }
            };
  
        let updatedTimeConfigurations;
        const iterationLength = todoCount
        if(todoCount){
            let curTodoStartTime;

           for(let i=iterationLength; i>=0; i--){
                curTodoStartTime= storedStartTimes[i];

                const         // if storedEndTimes[i-1] undefined you have hit the border. Everything will be greater than null
                    aMarginOnTheLeft = (((storedDurations[i-1]+storedStartTimes[i-1])||null) <= newTodoStartTime),
                    timeInputs = document.getElementsByClassName("time-input");

                if(aMarginOnTheLeft){
                    if(i==iterationLength){
                        curElemProps.todoList.push(newTodo);
                        this.useCalendarData[curDayId].todoList.push(newTodo.props);

                        const updatedConfigurations = updateTimeConfigurations(i);
                        this.useCalendarData[curDayId].todosTimeConfigurations = updatedConfigurations;
                        updatedTimeConfigurations = updatedConfigurations;

                        break
                    }
                    else if((newTodoStartTime+newTodoDuration) <= curTodoStartTime){
                        curElemProps.todoList.splice(i,Infinity,newTodo, ...curElemPropsTodoList.slice(i,Infinity))
                        this.useCalendarData[curDayId].todoList.splice(i, Infinity, newTodo.props, ...this.useCalendarData[curDayId].todoList.slice(i,Infinity))

                        const updatedConfigurations = updateTimeConfigurations(i);
                        this.useCalendarData[curDayId].todosTimeConfigurations = updatedConfigurations;
                        updatedTimeConfigurations = updatedConfigurations;

                        break
                    }
                    else{
                        updatedTimeConfigurations = todosTimeConfigurations;
                        let j=3;
                        while(j>=0){
                            timeInputs[j].setAttribute("style","border:1px solid red")
                            j--
                        }
                        break
                    }
                }
            }
        }
        else {
            curElemProps.todoList[0] = newTodo;
            this.useCalendarData[curDayId].todoList[0] = newTodo.props;

            const updatedConfigurations = updateTimeConfigurations(0);
            this.useCalendarData[curDayId].todosTimeConfigurations = updatedConfigurations;
            updatedTimeConfigurations = updatedConfigurations
        }

        this.useCalendar[curDayId] = <Day {...curElemProps} todosTimeConfigurations={updatedTimeConfigurations} subjectPreview={this.intoBlobs(curElemProps.todoList)}/>
  
        this.setState({chosenTodoList:curElemProps.todoList})
    }

    handleDeleteTodo(delElem){
        const parentId = this.state.id;        
        const parentElementProps = this.useCalendar[this.state.id].props;
        // filter by the duration, which is unique
        const 
            todoListRaw = parentElementProps.todoList,
            deletedTodoIndex =  todoListRaw.findIndex(el=> el.props.duration == delElem.props.duration),
            todoListAfterDelete = todoListRaw.filter(el=> el.props.duration != delElem.props.duration),
            todoListAfterDeleteLength = todoListAfterDelete.length;
    
        let todoListAfterDeleteData = [], postDeleteElementData,  postDeleteSubjectBlobWidth, 
            testTaskNotPresent=true;
        for (let i=0; i<todoListAfterDeleteLength; i++){
            postDeleteElementData = todoListAfterDelete[i].props;
            postDeleteSubjectBlobWidth = postDeleteElementData.subjectBlobStyleWidth;

            if(postDeleteSubjectBlobWidth) testTaskNotPresent=false; 
            // No function assigned props here as those are assigned in the file's beginning
            todoListAfterDeleteData[i] = {desc:postDeleteElementData.desc, subject: postDeleteElementData.subject, color:postDeleteElementData.color, subjectBlobStyleWidth:postDeleteSubjectBlobWidth,
                                        duration:postDeleteElementData.duration, endTime:postDeleteElementData.endTime, startTime:postDeleteElementData.startTime}
        }

                                                    // parentId is not todo's position
        parentElementProps.todosTimeConfigurations.durations.splice(deletedTodoIndex,1)
        parentElementProps.todosTimeConfigurations.startTimes.splice(deletedTodoIndex,1)
        const 
            style = (testTaskNotPresent && parentElementProps.style) ? {border:"4 double black"} : parentElementProps.style,
            newDay = <Day id={parentElementProps.id} onSendData={this.handleSendData} todoList={todoListAfterDelete} todosTimeConfigurations={parentElementProps.todosTimeConfigurations}
                date={parentElementProps.date} style={style} weekNum={parentElementProps.weekNum} weekday={parentElementProps.weekday} month={parentElementProps.month} 
                subjectPreview={this.intoBlobs(todoListAfterDelete)}/>;

        this.useCalendar[parentId] = newDay

        this.useCalendarData[parentId] = {todoList:todoListAfterDeleteData, todosTimeConfigurations:parentElementProps.todosTimeConfigurations, _date:parentElementProps.date, _month:parentElementProps.month, 
                                            style:style, _weekNum:parentElementProps.weekNum, _weekday:parentElementProps.weekday}

        this.setState({chosenTodoList:todoListAfterDelete}); 
    }

    render(){
        const 
            thisState = this.state,
            months = [undefined, "Januari","Februari","Mars","April","Maj","Juni","Juli","Augusti","September","Oktober","November", "December"],       
            calendarDuration = `${this.firstDay.weekday} ${this.firstDay.date} ${months[this.firstDay.month]} - ${this.lastDay.weekday} ${this.lastDay.date} ${months[this.lastDay.month]}`;               
        return(
            <div>
                <DayEditor 
                    displayDate={thisState.chosenDate} displayWeekday={thisState.chosenDay} displayMonth={thisState.chosenMonth} 
                    displayWeekNum={thisState.chosenWeekNum} displayTodoList={thisState.chosenTodoList}
                    curColor = {thisState.curColor} curDayId = {thisState.id} editorMonthId={this.monthId} 
                    userSubjectOptions = {this.userSubjectOptions}
                    onArrowDayChange={this.handleArrowDayChange} maxClick = {this.useCalendarLength} minClick ={this.minClick}
                    onAddNewTodo={this.handleAddNewTodo} onTodoChange={this.handleTodoChange} onSetCurSubjectColor={this.setCurSubjectColor}
                    onDeleteTodo={this.handleDeleteTodo} onMarkOrUnMarkTestDay={this.handleMarkOrUnMarkTestDay}
                />
                <div id="calendar">
                    <div style={{textAlign:"center"}}>
                        <span id="calendar-duration" >{calendarDuration}</span>
                    </div>
                    <div id="weekdays">
                        <div>Mån</div> 
                        <div>Tis</div> 
                        <div>Ons</div> 
                        <div>Tors</div> 
                        <div>Fre</div> 
                        <div>Lör</div> 
                        <div>Sön</div>
                    </div>
                    <div id="monthdays">
                        {this.useCalendar}
                    </div>
                </div>
            </div>
        )  
    }
};
