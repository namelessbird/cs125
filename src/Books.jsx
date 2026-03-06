import React, { useEffect, useState } from "react";
import axios from 'axios';
import { BookCard } from "./BookCard";

export default function Books({ userId }) {
    const [sections, setSections] = useState({ general: [], basedOnToRead: [], basedOnSearch: [] });

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const res = await axios.get(`http://localhost:4000/getBooks?userId=${userId}`);
                setSections(res.data);
            } catch (err) {
                console.error("Error fetching sections:", err);
            }
        };
        fetchSections();
    }, [userId]);

    // This is the function that handles the "To Read" button click
    const handleSave = async (bookId) => {
        try {
            await axios.post(`http://localhost:4000/userPreference`, { 
                bookId: bookId, 
                userId: userId 
            });
            alert("Added to your reading list!");
        } catch (error) {
            console.error("Error saving book:", error);
            alert("Could not save book.");
        }
    };

    return (
        <div className="space-y-12 p-8 bg-gray-100 min-h-screen">
            {/* General Section */}
            <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Trending Books For You</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {sections.general.map(book => (
                        <BookCard 
                            key={book.book_id} 
                            book={book} 
                            onAction={handleSave}  
                        />
                    ))}
                </div>
            </section>

            {/* Author Recommendation Section */}
            {sections.basedOnToRead.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Because You Liked Similar Authors</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {sections.basedOnToRead.map(book => (
                            <BookCard 
                                key={book.book_id} 
                                book={book} 
                                onAction={handleSave}  
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Recent Search Recommendation Section */}
            {sections.basedOnSearch.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Based On Your Recent Interest</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {sections.basedOnSearch.map(book => (
                            <BookCard 
                                key={book.book_id} 
                                book={book} 
                                onAction={handleSave}  
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}