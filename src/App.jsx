import './App.css';
import React from 'react'
import Footer from './Footer'
import Header from './Header';
import Navbar from './Navbar'
import Books from './Books'
import Login from './Login'
import Register from './Register'
import Survey from './Survey'
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';

const genres = ['Fantasy', 'Mystery', 'Romance', 'Science-fiction']

const Main = ({setUser}) => (
  <Routes>
    <Route path='/' element={<Navigate to='/login' replace/>}/>
    <Route exact path='/login' element={<Login setUser={setUser}/>}></Route>
    <Route exact path='/register' element={<Register/>}></Route>
    <Route exact path='/dashboard' element={<><Header/><Navbar genres={genres}/><Books/><Footer/></>}></Route>
    <Route exact path='/survey' element={<Survey/>}></Route>
  </Routes>
)

function App() {
  const [user, setUser] = React.useState(null)

  return (
    <BrowserRouter>
      <div className="flex flex-col gap-10 justify-center align-center">
        <Main setUser={setUser}/>
      </div>
    </BrowserRouter>
  );
}

export default App;
