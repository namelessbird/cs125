import { useState } from "react";

export default function Survey() {

    const [surveyData, setSurveyData] = useState({
        length: "",
        preference: "",
        publication: ""
    });

    const bookLength = [
        "Under 250 pages",
        "250-400 pages",
        "400-600 pages",
        "600+ pages"
    ];

    const bookPreference = [
        "Critically acclaimed books",
        "Bestsellers",
        "Hidden gems"
    ];

    const publicationDate = [
        "Classic (pre-1970)",
        "1970-2000",
        "2000-2015",
        "Recent (2015+)"
    ];

    // const bigArray = [
    //     bookLength, bookPreference, publicationDate
    // ];
    
    const handleSubmit = async () => {
        try{
            const response = await axios.post(
                `http://localhost:4000/user-preference`,
                surveyData,
                { withCredentials: true }
            )
        } catch (error){
            if(error.response){
                setErrorMessage(error.response.data.message)
            }
            else{
                setErrorMessage("Network error, please try again")
            }
        }
    };

    return (
        
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
                
                <h2 className="text-2xl font-bold text-center mb-6">
                    Choose Your Preferred Book Length
                </h2>

                {/* <div>
                    {bigArray.map((array, index) => (
                        <div key={index}>
                            {array.map((item) => (
                                <h1 key={item}>{item}</h1>
                            ))}
                        </div>
                    ))}
                </div> */}

                <div className="flex flex-wrap gap-3 justify-center">
                    {bookLength.map((length) => {
                        const isSelected = surveyData.length === length;

                        return (
                            <button
                                key={length}
                                onClick={() => 
                                    setSurveyData({ ...surveyData, length})  
                                }
                                className={`px-4 py-2 rounded-xl border transition
                                ${
                                    isSelected
                                    ? "bg-indigo-600 text-white border-indigo-600"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                }`}
                            >
                                {length}
                            </button>
                        );
                    })}
                </div>
                
                <h2 className="text-2xl font-bold text-center mb-6 mt-6">
                    What is your book preference?
                </h2>

                <div className="flex flex-wrap gap-3 justify-center">
                    {publicationDate.map((publication) => {
                        const isSelected = surveyData.publication === publication;

                        return (
                            <button
                                key={publication}
                                onClick={() => 
                                    setSurveyData({ ...surveyData, publication})  
                                }
                                className={`px-4 py-2 rounded-xl border transition
                                ${
                                    isSelected
                                    ? "bg-indigo-600 text-white border-indigo-600"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                }`}
                            >
                                {publication}
                            </button>
                        );
                        
                    })}
                </div>

                <h2 className="text-2xl font-bold text-center mb-6 mt-6">
                    How old are you?
                </h2>

                <div className="flex flex-wrap gap-3 justify-center">
                    {bookPreference.map((preference) => {
                        const isSelected = surveyData.preference === preference;

                        return (
                            <button
                                key={preference}
                                onClick={() => 
                                    setSurveyData({ ...surveyData, preference})  
                                }
                                className={`px-4 py-2 rounded-xl border transition
                                ${
                                    isSelected
                                    ? "bg-indigo-600 text-white border-indigo-600"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                }`}
                            >
                                {preference}
                            </button>
                        );
                        
                    })}
                </div>

                <button
                    onClick={handleSubmit}
                    className="mt-6 w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition"
                >
                    Submit
                </button>
            </div>
        </div>
    )
}