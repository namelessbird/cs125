import React from "react";
import {useState} from "react";

export default function Search ({setSearchQuery}) {

    const [inputValue, setInputValue] = useState("");

    const handleClick = () => {
        setSearchQuery(inputValue);
        console.log(inputValue);
    };

    return (
        <div className="flex justify-center gap-3 w-full">
            <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)} 
                className="outline-1 w-2xl rounded-2xl pl-1.5" 
            />
            <button
                onClick={handleClick}
                className="w-2xs py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
            >
                Search   
            </button>
        </div>
    )
}