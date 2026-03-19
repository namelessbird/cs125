import React, { useEffect, useState } from "react";
import axios from 'axios';
import { BookCard } from "./BookCard";
// If you have FontAwesome installed:
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function Books({ userId }) {
    const [sections, setSections] = useState({ general: [], basedOnToRead: [], basedOnSearch: [] });
    const [loading, setLoading] = useState(true); // Start as true

    useEffect(() => {
        const fetchSections = async () => {
            setLoading(true); // Ensure loading is true if userId changes
            try {
                const res = await axios.get(`http://localhost:4000/getBooks?userId=${userId}`);
                setSections(res.data);
            } catch (err) {
                console.error("Error fetching sections:", err);
            } finally {
                setLoading(false); // Stop loading regardless of success/fail
            }
        };
        fetchSections();
    }, [userId]);

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

    // 1. Full Screen Loading State
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                {/* Spinning Icon */}
                <div className="animate-spin text-[#384264] text-4xl">
                    <FontAwesomeIcon icon={faSpinner} />
                </div>
                <h2 className="text-xl font-medium text-gray-600 animate-pulse">
                    Curating your personal recommendations...
                </h2>
                <p className="text-gray-400 text-sm italic">Gathering covers and descriptions</p>
            </div>
        );
    }

    // 2. Main Content (Only shows when loading is false)
    return (
        <div className="space-y-12 p-8 bg-gray-100 min-h-screen">
            <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Trending Books For You</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {sections.general.map(book => (
                        <BookCard key={book.book_id} book={book} onAction={handleSave} />
                    ))}
                </div>
            </section>

            {sections.basedOnToRead.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Because You Liked Similar Authors</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {sections.basedOnToRead.map(book => (
                            <BookCard key={book.book_id} book={book} onAction={handleSave} />
                        ))}
                    </div>
                </section>
            )}

            {sections.basedOnSearch.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Based On Your Recent Interest</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {sections.basedOnSearch.map(book => (
                            <BookCard key={book.book_id} book={book} onAction={handleSave} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}