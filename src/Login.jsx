import React from "react";
import "./styles.css"
import axios from 'axios'

export default function Login({setUser}){
    const [user, setUser] = React.useState("")
    const [pass, setPass] = React.useState("")
    const [errorMessage, setErrorMessage] = React.useState("")
    //const apiUrl = import.meta.env.VITE_API_URL

     const handleSubmit = async(e) => {
        e.preventDefault()

        try{
            const data = {
                user: user,
                pass: pass
            }
            const response = await axios.post(
                `http://localhost:4000/login`,
                data,
                { withCredentials: true }
            )
            setUser(response.data.userID)

            window.location.replace("/dashboard")
        } catch (error){
            if(error.response){
                setErrorMessage(error.response.data.message)
            }
            else{
                setErrorMessage("Network error, please try again")
            }
        }

    }

    return(
        <div className="bg-[#384264] h-screen flex flex-col items-center justify-center">
            <form onSubmit={handleSubmit} className="relative flex flex-col text-center content-center bg-white rounded-md px-8 pt-20 pb-10 sm:w-[30%] sm:max-w-96 sm:min-w-64">
                <h2 className="absolute top-5 left-1/2 -translate-x-1/2 text-xl">Login</h2>
                <label className="sm:-mx-2">
                    <input className="border-gray-200 border-2 rounded pl-2 py-1 sm:w-[100%]" type="text" placeholder="username" value={user}
                    onChange={(e) => setUser(e.target.value)} required></input>
                </label>
                <label className="pt-6 pb-6 sm:-mx-2">
                    <input className="border-gray-200 border-2 rounded pl-2 py-1 sm:w-[100%]" type="password" placeholder="password" value={pass}
                    onChange={(e) => setPass(e.target.value)} required></input>
                </label>
                <button type="submit" className="text-white bg-[#384264] cursor-pointer py-1.5 mx-[25%] rounded-md hover:brightness-80">Log In</button>
                {errorMessage && (
                    <p className="text-red-500 pt-3 -mb-4">{errorMessage}</p>
                )}
            </form>
            <a href="/register" className="text-white cursor-pointer underline pt-2.5">Don't have an account? Sign Up</a>
        </div>
    )
}