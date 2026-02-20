import './App.css';
import React from 'react'
import Footer from './Footer'
import Header from './Header';
import Navbar from './Navbar'
import Books from './Books'
import Login from './Login'
import Register from './Register'
import Survey from './Survey'
import Search from './Search'
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import {useState} from "react";

const genres = ['Fantasy', 'Mystery', 'Romance', 'Science-fiction']

const Main = ({setU, user, searchQuery, setSearchQuery}) => (
  <Routes>
    <Route path='/' element={<Navigate to='/login' replace/>}/>
    <Route exact path='/login' element={<Login setU={setU}/>}></Route>
    <Route exact path='/register' element={<Register/>}></Route>
    <Route exact path='/dashboard' element={<><Header/><Navbar genres={genres}/><Search setSearchQuery={setSearchQuery}/><Books searchQuery={searchQuery}/><Footer/></>}></Route>
    <Route exact path='/survey' element={<Survey userId={user}/>}></Route>
  </Routes>
)

function App() {
  const [user, setU] = React.useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  return (
    <BrowserRouter>
      <div className="flex flex-col gap-10 justify-center align-center">
        <Main setU={setU} user = {user} searchQuery={searchQuery} setSearchQuery={setSearchQuery}/>
      </div>
    </BrowserRouter>
  );
}

export default App;
