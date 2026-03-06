import React, { useEffect, useState } from "react";
import axios from 'axios';
import { BookCard } from "./BookCard";

export default function SearchResults({ userId, searchQuery }) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const performSearch = async () => {
            if (!searchQuery) return;
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:4000/getBooks?search=${searchQuery}&userId=${userId}`);
                setResults(res.data);
            } catch (err) {
                console.log("Search error:", err);
            } finally {
                setLoading(false);
            }
        };
        performSearch();
    }, [searchQuery, userId]);

    // Added the actual function to talk to your preference table
    const handleSave = async (bookId) => {
        try {
            await axios.post(`http://localhost:4000/userPreference`, { 
                bookId: bookId, 
                userId: userId 
            });
            alert("Book saved to your preferences!");
        } catch (error) {
            console.error("Error saving book:", error);
            alert("Failed to save book.");
        }
    };

    if (loading) return <div className="text-center p-20 text-gray-500">Searching...</div>;

    return (
        <div className="min-h-screen bg-white p-8">
            <h1 className="text-2xl font-semibold mb-6">Results for "{searchQuery}"</h1>
            
            {results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {results.map((book) => (
                        <BookCard 
                            key={book.book_id} 
                            book={book} 
                            onAction={handleSave} 
                            buttonText="Add to List"
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-2xl">
                    <p className="text-gray-600">No books found for "{searchQuery}".</p>
                </div>
            )}
        </div>
    );
}