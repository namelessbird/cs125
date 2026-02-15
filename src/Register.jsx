import React from "react";
import "./styles.css"
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';

const SuccessCard = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-2xl shadow-xl max-w-sm mx-auto animate-in fade-in zoom-in duration-300">
      {/* Success Icon */}
      <div className="flex items-center justify-center w-16 h-16">
        <FontAwesomeIcon 
            icon={faCircleCheck} 
            className="text-green-500 text-5xl mb-4" 
        />
      </div>

      {/* Text Content */}
      <h2 className="mb-3 text-2xl font-bold text-gray-800">Account Created!</h2>

      {/* Action Button */}
      <button 
        onClick={() => window.location.href = '/login'}
        className="w-full py-3 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 cursor-pointer"
      >
        Proceed to Login
      </button>
    </div>
  );
};

export default function Register(){
    const [user, setUser] = React.useState("")
    const [pass, setPass] = React.useState("")
    const [errorMessage, setErrorMessage] = React.useState("")
    const [registered, setRegistered] = React.useState(false)
    //const apiUrl = import.meta.env.VITE_API_URL

     const handleSubmit = async(e) => {
        e.preventDefault()
        console.log("trying to create new user")
        try{
            const data = {
                user: user,
                pass: pass
            }
            const response = await axios.post(
                `http://localhost:4000/register`,
                data,
                { withCredentials: true }
            )
            if(response.status == 200){
                setRegistered(true)
            }
            
            
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
            {registered ? <SuccessCard/> : 
                <>
                    <form onSubmit={handleSubmit} className="relative flex flex-col text-center content-center bg-white rounded-md px-8 pt-20 pb-10 sm:w-[30%] sm:max-w-96 sm:min-w-64">
                        <h2 className="absolute top-5 left-1/2 -translate-x-1/2 text-xl">Sign Up Form</h2>
                        <label className="sm:-mx-2">
                            <input className="border-gray-200 border-2 rounded pl-2 py-1 sm:w-[100%]" type="text" placeholder="username" value={user}
                            onChange={(e) => setUser(e.target.value)} required></input>
                        </label>
                        <label className="pt-6 pb-6 sm:-mx-2">
                            <input className="border-gray-200 border-2 rounded pl-2 py-1 sm:w-[100%]" type="password" placeholder="password" value={pass}
                            onChange={(e) => setPass(e.target.value)} required></input>
                        </label>
                        <button type="submit" className="text-white bg-[#384264] cursor-pointer py-1.5 mx-[25%] rounded-md hover:brightness-80">Sign Up</button>
                        {errorMessage && (
                            <p className="text-red-500 pt-3 -mb-4">{errorMessage}</p>
                        )}
                    </form>
                    <a href="/login" className="text-white cursor-pointer underline pt-2.5">Go Back to Login</a>
                </>
            }
        </div>
    )
}