import './App.css';
import Footer from './Footer'
import Header from './Header';
import Navbar from './Navbar'
import Books from './Books'

const genres = ['Fantasy', 'Mystery', 'Romance', 'Science-fiction']

function App() {
  return (
    <div className="flex flex-col gap-10 justify-center align-center">
      <Header/>
      <Navbar genres={genres}/>
      <Books/>
      <Footer/>
    </div>
  );
}

export default App;
