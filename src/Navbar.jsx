import react from "react";
import {useNavigate} from "react-router-dom"

export default function Navbar ( {genres} ) {
    const navigate = useNavigate()
    return (
        <nav className="w-full bg-white/80 backdrop-blur-md shadow-sm top-0">
            <button onClick ={() =>
                    navigate('/survey')
            }
            >
                Click me
                </button>
        </nav>
    )
}