import React from "react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";

export default function Search({ setSearchQuery }) {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            setSearchQuery(inputValue);
        }
    };

    const handleClear = () => {
        setInputValue("");
        setSearchQuery("");
    };

    return (
        <div className="flex justify-center w-full">
            <div className="relative w-2xl">
                <input 
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)} 
                    onKeyDown={handleKeyDown}
                    placeholder="Search by title"
                    className="w-full outline-none border border-gray-300 rounded-2xl pl-4 pr-10 py-2 focus:border-blue-500 transition-all shadow-sm" 
                />
                
                {inputValue && (
                    <button 
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        aria-label="Clear search"
                    >
                        <FontAwesomeIcon icon={faTimesCircle} />
                    </button>
                )}
            </div>
        </div>
    );
}