import react from "react";

export default function Header () {
    return (
        <header class="min-h-[40vh] text-center bg-purple-800">
            <div class="text-6xl text-white pt-10">Discover your next read</div>
            <div class="text-2xl text-white pt-2">Answer a few questions and we will recommend the perfect book</div>
            <div class="flex gap-5 pt-2 justify-center">
                <div class="text-white">Sign up</div>
                <div class="text-white">Log in</div>
            </div>
        </header>
    )
}