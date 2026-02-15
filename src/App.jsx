import './App.css';
import Footer from './Footer'
import Header from './Header';
import Navbar from './Navbar'
import Books from './Books'
import Login from './Login'
import Register from './Register'
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';

const genres = ['Fantasy', 'Mystery', 'Romance', 'Science-fiction']

const Main = () => (
  <Routes>
    <Route path='/' element={<Navigate to='/login' replace/>}/>
    <Route exact path='/login' element={<Login/>}></Route>
    <Route exact path='/register' element={<Register/>}></Route>
    <Route exact path='/dashboard' element={<><Header/><Navbar genres={genres}/><Books/><Footer/></>}></Route>
  </Routes>
)

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col gap-10 justify-center align-center">
        <Main/>
      </div>
    </BrowserRouter>
  );
}

export default App;
