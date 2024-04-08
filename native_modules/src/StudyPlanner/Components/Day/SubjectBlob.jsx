import React from "react";

export default function subjectBlob(props){ // desc:str, color:
    return(                             // To conicder the border question
        <div className="subjectBlob" style={{...props.subjectBlobStyle}} >
            <div id="subjectBlobDurationDiv">
                <span className="subjectBlobDuration">{props.duration}</span>
            </div>
            <p className="subjectBlobDesc">{props.desc}</p>
        </div>
    )
}