import react from "react";

export default function Navbar ( {genres} ) {
    return (
        <nav class="w-full bg-white/80 backdrop-blur-md shadow-sm top-0">
            <ul class="flex justify-evenly gap-1">
                <li>All</li>
                <li>Fantasy</li>
                <li>Mystery</li>
                <li>Romance</li>
                <li>Comedy</li>
            </ul>
        </nav>
    )
}