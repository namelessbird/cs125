import React, { useEffect, useState } from "react";
import axios from 'axios';
import { BookCard } from "./BookCard";

export default function Books({ userId }) {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        const fetchRecommended = async () => {
            try {
                // Notice we don't send search queries here, just the userId for recommendations
                const res = await axios.get(`http://localhost:4000/getBooks?userId=${userId}`);
                setBooks(res.data);
            } catch (err) {
                console.log("Error fetching recommendations:", err);
            }
        };
        fetchRecommended();
    }, [userId]);

    const handleSave = async (bookId) => {
        try {
            await axios.post(`http://localhost:4000/userPreference`, { bookId, userId });
            alert("Added to your reading list!");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Recommended for You</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {books.map((book) => (
                    <BookCard key={book.book_id} book={book} onAction={handleSave} buttonText="To Read" />
                ))}
            </div>
        </div>
    );
}