import React, { useState } from 'react'


export default function Textfrom(props) {
    const [text, setText] = useState('');

    const handelUpClick = () => {
        // console.log("UpeerCase");
        let newtext = text.toUpperCase();
        setText(newtext);
    }
    const handelOnChange = (event) => {
        // console.log("on change");
        setText(event.target.value);
    }

    const handelCopy = () => {
        var text = document.getElementById("mybox");
        text.select();
        navigator.clipboard.writeText(text.value);
    }
    return (
        <>
            <div className="container my-3">
            <div >
                <h1>{props.heading}</h1>
                <div className="mb-3">


                    <textarea className="form-control" value={text} onChange={handelOnChange} id="mybox" rows="8"></textarea>
                </div>
                <button className="btn btn-primary mx-2" onClick={handelUpClick}>Convert to UpperCase</button>
                <button className="btn btn-primary" onClick={handelCopy}>Copy</button>
             </div>
             <div className="container my-2">
                <h2>Your Text summary</h2>
                <p>{text.split(" ").length} words and {text.length} character</p>
                <p>{0.008 * text.split(" ").length} min to read</p>
                <h2> Preview</h2>
                <p>{text}</p>
            </div>
            </div>
        </>
    )
}
