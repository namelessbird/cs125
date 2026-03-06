import React from "react";

export const BookCard = ({ book, onAction }) => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
        <div className="h-64 bg-gray-200">
            {book.cover && (
                <img src={book.cover} alt={book.title} className="w-full h-full object-contain" />
            )}
        </div>
        <div className="p-4 grow">
            <h2 className="font-bold text-lg text-gray-900 line-clamp-1">{book.title}</h2>
            <p className="text-sm text-blue-600 mb-2">{book.authors}</p>
            <div className="flex items-center mb-2">
                <span className="text-yellow-500 text-sm">★</span>
                <span className="text-sm text-gray-600 ml-1">{book.avg_rating}</span>
            </div>
            <div 
                className="text-xs text-gray-500 line-clamp-3 italic"
                dangerouslySetInnerHTML={{ __html: book.description }}
            />
        </div>
        <div className="p-4 border-t border-gray-100">
            <button 
                className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                onClick={() => onAction(book.book_id)}
            >
                Add to List
            </button>
        </div>
    </div>
);