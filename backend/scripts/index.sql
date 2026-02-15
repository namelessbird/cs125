CREATE UNIQUE INDEX IF NOT EXISTS idx_books_title 
on books.book(title);

CREATE UNIQUE INDEX IF NOT EXISTS idx_books_ISBN13
on books.book(isbn13);

CREATE UNIQUE INDEX IF NOT EXISTS idx_books_rating
on books.book(avg_rating DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_books_rating_count 
on books.book(ratings_count DESC);
 
CREATE UNIQUE INDEX IF NOT EXISTS idx_books_ISBN
on books.book(isbn);

