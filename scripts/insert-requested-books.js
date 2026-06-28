const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'admin123',
    database: process.env.DB_NAME || 'mandalabookpoint',
  });

  const booksToInsert = [
    {
      title: "Human Nature",
      author: "Thomas",
      categoryId: 2,
      description: "A profound look into human nature.",
      price: 1500,
      stock: 20,
      availability: 1,
      coverImage: "/uploads/1781337030598-1.jpg"
    },
    {
      title: "Studies in Nepali History and Society (Vol. 30 No. 2)",
      author: "Mandala Book Point",
      categoryId: 2,
      description: "A Mandala Book Point Journal featuring various academic papers.",
      price: 800,
      stock: 50,
      availability: 1,
      coverImage: "/uploads/1771924585755-Sinhas-30.2.png"
    },
    {
      title: "India Border Disputes: Mahakali and Susta",
      author: "Pitamber Sharma",
      categoryId: 2,
      description: "A detailed analysis of the border disputes.",
      price: 1200,
      stock: 15,
      availability: 1,
      coverImage: "/uploads/1781265449699-820fc0bc-5ebc-4a03-a590-7758e685090f.jpg"
    },
    {
      title: "Becoming an Anthropologist",
      author: "Alan Macfarlane",
      categoryId: 2,
      description: "Memoirs and insights into becoming an anthropologist.",
      price: 1100,
      stock: 25,
      availability: 1,
      coverImage: "/uploads/1778489870083-8556cc08-fbf3-4c98-948d-63112397878b.jpg"
    }
  ];

  console.log('Inserting books...');
  for (const book of booksToInsert) {
    try {
      await connection.execute(
        `INSERT INTO books (title, author, category_id, description, price, stock, availability, cover_image) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [book.title, book.author, book.categoryId, book.description, book.price, book.stock, book.availability, book.coverImage]
      );
      console.log(`✅ Inserted: ${book.title}`);
    } catch (err) {
      console.error(`❌ Failed to insert ${book.title}:`, err.message);
    }
  }

  console.log('Done!');
  await connection.end();
  process.exit(0);
}

run();
