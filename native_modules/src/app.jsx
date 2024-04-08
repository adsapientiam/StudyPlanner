import React from 'react';
import ReactDOM from 'react-dom';

import StudyPlanner from "./StudyPlanner/StudyPlanner.jsx"; 

const axios = require("axios");

function propRender(props){
    ReactDOM.render(                            
        <StudyPlanner {...props}/>, 
        document.getElementById("root")
    );
}

axios.get("http://localhost:2999/calendar/load") 
.then(res=>{
    const resData = res.data;
    // if there are days a calendar has already been generated
    let props;

    // the two possible render scenarios
    if(resData.days){
        props = {
            calendarMemoryDatasDays: resData.days,
            subjects:resData.subjects,
            lastWeekErase:resData.lastWeekErase
        }
    } 
    else props = {subjects:resData.subjects, endTime:resData.endTime};
    propRender(props)
})
.catch(err=>{console.log(err)})

