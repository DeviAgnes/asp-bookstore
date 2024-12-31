import { PrismaClient, UserRole } from "@prisma/client";
import { createHash } from "~/utils/encryption";

// const db = new PrismaClient();

const db = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});


async function cleanup() {
  console.time("🧹 Cleaned up the database...");
  try {
    await db.payment.deleteMany();
    await db.rentedBook.deleteMany();
    await db.bookSale.deleteMany();
    await db.book.deleteMany();
    await db.genre.deleteMany();
    await db.user.deleteMany();
    await db.library.deleteMany();
    await db.config.deleteMany();
    console.timeEnd("🧹 Cleaned up the database...");
  } catch (error) {
    console.error("Error during cleanup:", error);
    throw error;
  }
}

async function createUsers() {
  console.time("👤 Created users, library, genre and book...");
  try {
    // Create Admin
    await db.user.create({
      data: {
        name: "Admin",
        email: "admin@app.com",
        password: await createHash("password"),
        role: UserRole.admin,
      },
    });

    // Create Customer
    await db.user.create({
      data: {
        name: "Customer",
        email: "user@app.com",
        password: await createHash("password"),
        role: UserRole.customer,
      },
    });

    // Create Library
    const newLibrary = await db.library.create({
      data: {
        name: "Library",
        location: "Location",
        phoneNo: "1234567890",
        email: "library@app.com",
      },
    });

    // Create Librarian
    await db.user.create({
      data: {
        name: "Librarian",
        email: "librarian@app.com",
        password: await createHash("password"),
        role: UserRole.librarian,
        libraryId: newLibrary.id,
      },
    });

    // Create Genre
    const newGenre = await db.genre.create({
      data: {
        name: "Fiction",
      },
    });

    // Create Book
    await db.book.create({
      data: {
        title: "The Enchanted Forest",
        isbn: "978-3-16-148410-0",
        author: "Emily R. Thompson",
        pdfLink: "https://www.srs.fs.usda.gov/pubs/gtr/gtr_srs080/gtr_srs080.pdf",
        imageUrl:
          "https://m.media-amazon.com/images/M/MV5BMTdkMzQ5MGYtNzFjNS00YjQ1LTg2ZWUtY2IyYTc2YzljZDFjXkEyXkFqcGdeQXVyMTY5Nzc4MDY@._V1_.jpg",
        genreId: newGenre.id,
        purchaseAmount: 24.99,
        libraryId: newLibrary.id,
      },
    });

    console.timeEnd("👤 Created users, library, genre and book...");
    console.log("👤 Admin, Customer, Librarian, Library, Genre and Book created...");
  } catch (error) {
    console.error("Error during user creation:", error);
    throw error;
  }
}

async function createConfig() {
  console.time("⚙️ Created config...");
  try {
    await db.config.create({
      data: {
        amountTill60DaysPricePerDay: 6,
        moreThan60DaysPricePerDay: 3,
      },
    });
    console.timeEnd("⚙️ Created config...");
  } catch (error) {
    console.error("Error creating config:", error);
    throw error;
  }
}

async function seed() {
  console.log("🌱 Seeding...\n");

  try {
    await cleanup();
    console.time("🌱 Database has been seeded");
    await createUsers();
    await createConfig();
    console.timeEnd("🌱 Database has been seeded");
  } catch (error) {
    console.error("Seeding failed:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("Seeding done!...");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
    process.exit(0);
  });
