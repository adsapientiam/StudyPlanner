import React from "react";

import Day from "../Components/Day/Day.jsx"
import {NOW, TODAY} from "./globalNow.js"; 

export default function generateCalendar(thisInstance, endTime){ 
    // creates a calendar until next lov if user account has none
    const generatorToday = TODAY; // 0 - month, 1 - date, 2 - day
    const nextBreak = endTime; // for temporary test values: [generatorToday[0]+1, generatorToday[1]-2]; 

    function treatAsUTC(date) {
        let result = new Date(0, ...date);
        result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
        return result;
    };
    const daysUntil = breakDate => (treatAsUTC(breakDate) - treatAsUTC(generatorToday)) / 86400000; // miliseconds per day

    const months = [  // since the days will show date and month. January is 1
        [1,31],
        [2,NOW.getFullYear() % 4 ? 28 : 29],
        [3,31],
        [4,30],
        [5,31],
        [6,30],
        [7,31],
        [8,31],
        [9,30],
        [10,31],
        [11,30], 
        [12,31]
    ];

    const 
    // "shelldays"' only purpose is to take space in the first week in place of the Days
        dayOfLastShellDay = (NOW.getDay()||7)-1, // to make sure that a Wednesday day doesn't start on monday and that a Sunday makes 6 shellDays because it normally is 0
        shellDay = () => <div className="shell-day"> </div>

    let duration = daysUntil(nextBreak); // duration in days
    let dayProps= Array.from({length:dayOfLastShellDay}, undefined); 
        
// GET PROPERTIES FOR FIRST MONTH
    const firstMonthDuration = nextBreak[0] == generatorToday[0] ? nextBreak[1] : months[generatorToday[0]][1];
    let calendarStart = generatorToday[1]; 
    // NOW.getDay() decides from what point these will be added, all before be empty

    for(let curDay = calendarStart; curDay <= firstMonthDuration; curDay++){
        dayProps.push([curDay,months[generatorToday[0]][0]]);
    }

    duration -= (firstMonthDuration - generatorToday[1]);
    
// GET PROPERTIES FOR OTHER MONTHS
    for(let curMonth = generatorToday[0]+1, curMonthLen; curMonth <= nextBreak[0]; curMonth++){
        curMonthLen = months[curMonth][1];
        
        for(let curDay = 1; curDay <= curMonthLen && duration > 0; curDay++){
            dayProps.push([curDay, months[curMonth][0]]);
            duration--;
        }
    } 

// CREATION OF Day OBJECTS & weekday PROPERTY
    let 
        content = Array.from({length:dayOfLastShellDay}, shellDay),
        contentData = Array.from({length:dayOfLastShellDay}, ()=>{}), // Content but it's a set of arrays with the data
        curWeek = (function(){
            NOW.setUTCDate(NOW.getUTCDate() + 4 - (NOW.getUTCDay()||7)); // Set to nearest Thursday: current date + 4 - current day number; make Sunday's day number 7
            let firstDayOfYear = new Date(Date.UTC(NOW.getUTCFullYear(), 0, 1));
            console.log((((NOW - firstDayOfYear) / 86400000) + 1)/7)
            return Math.floor((((NOW - firstDayOfYear) / 86400000) + 1)/7); // Calculate full weeks to nearest Thursday
        })(),
        weekday;

    const dayCount =  dayProps.length;
    let i= weekday = dayOfLastShellDay;
    while(i<dayCount){
        let weekdayData = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"][weekday%7]
        // contentData has the remaining attributes applied for the Day objects in StudyPlanner.jsx
        contentData[i] = {todoList:[], todosTimeConfigurations:{startTimes:[], durations:[]}, _date:dayProps[i][0], _month:dayProps[i][1], _weekNum:curWeek, _weekday:weekdayData};
        // a change here will require the Day object to be from contentData to also have it
        content[i] = <Day onSendData={thisInstance.handleSendData} id={i} todoList = {[]} todosTimeConfigurations={{startTimes:[], durations:[]}} date={dayProps[i][0]}
            month={dayProps[i][1]} weekNum={curWeek} weekday={weekdayData} />;
        // ++i augments i before checking if it has 0 rest divided by 7  
        if(++i%7==0) curWeek++; 
        weekday++;
    }
    return [content, contentData, dayOfLastShellDay]; 
}
