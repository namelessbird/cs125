import React from "react"
import axios from 'axios'

export default function Books ( {searchQuery} ) {
    const [books, setBooks] = React.useState([])

    React.useEffect(() => {
        const fetchBooks = async () => {
            try {
                let url = "http://localhost:4000/getBooks";

                if (searchQuery) {
                    url += `?search=${searchQuery}`;
                }
                console.log("url search: ", url);
                const res = await axios.get(url)
                setBooks(res.data)
            } catch (err) {
                console.log("Error fetching books:", err)
            }
        }

        fetchBooks()
    }, [searchQuery])

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Recommended for You</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {books.map((book) => (
                    <div key={book.book_id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                        {/* Book Cover */}
                        <div className="h-64 bg-gray-200">
                            {/* {book.cover ? (
                                <img 
                                    src={book.cover} 
                                    alt={book.title} 
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">No Cover</div>
                            )} */}
                        </div>

                        {/* Book Info */}
                        <div className="p-4 flex-grow">
                            <h2 className="font-bold text-lg text-gray-900 line-clamp-1">{book.title}</h2>
                            <p className="text-sm text-blue-600 mb-2">{book.authors}</p>
                            
                            {/* Rating Badge */}
                            <div className="flex items-center mb-2">
                                <span className="text-yellow-500 text-sm">★</span>
                                <span className="text-sm text-gray-600 ml-1">{book.avg_rating}</span>
                            </div>

                            {/* Description - uses line-clamp to keep card height consistent */}
                            <div 
                                className="text-xs text-gray-500 line-clamp-3 italic"
                                dangerouslySetInnerHTML={{ __html: book.description }}
                            />
                        </div>
                        
                        <div className="p-4 border-t border-gray-100">
                            <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
                                To Read
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}