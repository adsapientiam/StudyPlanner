import React, {Component} from "react";

export default class TodoElem extends Component{ 
    /*
        props: 
            parentId:int, 
            desc:string; 
            startH:int; 
            startMin:int;
            endH:int;
            endMin:int;
            endTime: string of `endH:endMin`
            subject:string which will be used for the day objects, e.g 3 first will be in color balls
    */
    constructor(props){
        super(props);
        this.deleteTodo = this.deleteTodo.bind(this);
        this.markOrUnMarkTestDay = this.markOrUnMarkTestDay.bind(this);
    }

    deleteTodo(delElem){
        this.props.onDeleteTodo(delElem)
    }

    markOrUnMarkTestDay(keyOfTriggeringTodo){
        this.props.onMarkOrUnMarkTestDay(keyOfTriggeringTodo)
    }

    render(){
        const props = this.props;
        /* The comment here and the one in StudyPlanner are extras. Add style={{visibility:"hidden"}} to the last input's attributes for auto-hid of the deletetask-button
        function showDelBtn(e){ // provoked on the onFocus
            e.target.nextElementSibling.setAttribute("style","visibility:visible");
        } 
         onFocus={e=>showDelBtn(e)} this one besides onBlur=>
        */

        function saveNewDesc(e){
            props.onTodoChange(e.target.value, props.endTime) // this become duration
            //e.target.nextElementSibling.style = "visibility:hidden";
        }

                // This key cuz it ensures that defaultValue is updated
        const key = [this.props.parentId, this.props.endTime];
        return(   
            <div className="todo" style={{borderColor:props.color, borderWidth:props.subjectBlobStyleWidth ? "6px" : "2px",borderStyle:"solid", borderRadius:"5%"}} key={key}>
                <span className="todo-duration-subject">{props.duration} {props.subject}</span>
                <textarea className="description" type="text" defaultValue={props.desc} onChange={e=>saveNewDesc(e)}/>
                <input className="deleteBtn btn" type="button" value="Ta bort pass" onClick={e=>this.deleteTodo(this)}/>
                <input className="testBtn btn" type="button" value="Markera prov/läxa/inlämning" onClick={e=>this.markOrUnMarkTestDay(key)}/>
            </div>
        )
    }
}