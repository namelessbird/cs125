import react from "react";
import {useNavigate} from "react-router-dom"

export default function Navbar ( {genres} ) {
    const navigate = useNavigate()
    return (
        <nav className="w-full bg-white/80 backdrop-blur-md shadow-sm top-0 flex justify-center">
            <button 
                className ="bg-white text-gray-700 border-gray-300 hover:bg-gray-100 cursor-pointer rounded-xl p-4"
                onClick ={() =>
                    navigate('/survey')
                }
            >
                Click me
                </button>
        </nav>
    )
}