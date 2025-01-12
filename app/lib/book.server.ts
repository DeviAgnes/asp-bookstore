import type { SerializeFrom } from "@remix-run/node";
import { db } from "~/lib/prisma.server";
import { BookingType, type PaymentMethod } from "@prisma/client";
import axios from "axios";

export const getAllBooks = async () => {
  return db.book.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      library: true,
      genre: true,
    },
  });
};

export type GetAllBooks = SerializeFrom<typeof getAllBooks>;

export const getBookById = async (bookId: string) => {
  return await db.book.findFirst({
    where: { id: bookId },
  });
};

export const getAllBooksByLibraryId = async (libraryId: string) => {
  if (!libraryId) {
    throw new Error("Library ID is required");
  }
  return db.book.findMany({
    where: { libraryId },
    include: {
      library: true,
      genre: true,
    },
  });
};

export type GetAllBooksByLibraryId = SerializeFrom<typeof getAllBooksByLibraryId>;

export const getPurchasedBooksByUserId = async (userId: string) => {
  return db.book.findMany({
    where: {
      sales: {
        some: {
          userId,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export type GetPurchasedBooksByUserId = SerializeFrom<typeof getPurchasedBooksByUserId>;

export const getAllRentedBooks = async () => {
  return db.rentedBook.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      book: {
        include: {
          library: true,
          genre: true,
        },
      },
      user: true,
    },
  });
};

export type GetAllRentedBooks = SerializeFrom<typeof getAllRentedBooks>;

export const getAllPurchasedBooks = async () => {
  return db.bookSale.findMany({
    select: {
      id: true,
      createdAt: true,
      book: {
        include: {
          library: true,
          genre: true,
        },
      },
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export type GetAllPurchasedBooks = SerializeFrom<typeof getAllPurchasedBooks>;

export const getAllRentedBooksByUserId = async (userId: string) => {
  return db.rentedBook.findMany({
    where: { userId },
    include: {
      book: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export type GetRentedBooksByUserId = SerializeFrom<typeof getAllRentedBooksByUserId>;

export const getRentedBooksByLibraryId = async (libraryId: string) => {
  return db.rentedBook.findMany({
    where: {
      book: {
        libraryId,
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      book: {
        include: {
          library: true,
          genre: true,
        },
      },
      user: true,
    },
  });
};

export type GetRentedBooksByLibraryId = SerializeFrom<typeof getRentedBooksByLibraryId>;

export const getPurchasedBooksByLibraryId = async (libraryId: string) => {
  return db.bookSale.findMany({
    where: {
      book: {
        libraryId,
      },
    },
    include: {
      book: {
        include: {
          library: true,
          genre: true,
        },
      },
      user: true,
    },
  });
};

export type GetPurchasedBooksByLibraryId = SerializeFrom<typeof getPurchasedBooksByLibraryId>;

export async function updateBook(
  existingBookId: string,
  data: {
    title?: string;
    author?: string;
    description?: string;
    isbn?: string;
    purchaseAmount?: number;
    genreId?: string;
    libraryId?: string;
    pdfLink?: string;
    imageUrl?: string;
  },
) {
  return await db.$transaction(async (tx) => {
    const { genreId, ...bookData } = data;

    // Filter out undefined values
    const filteredBookData = Object.fromEntries(
      Object.entries(bookData).filter(([_, v]) => v !== undefined),
    );

    // Update the book
    return await tx.book.update({
      where: { id: existingBookId },
      data: {
        ...filteredBookData,
        ...(genreId && { genreId }),
      },
    });
  });
}

export async function createBook(fields: {
  title: string;
  author: string;
  description?: string;
  isbn: string;
  purchaseAmount: number;
  genreId: string;
  libraryId: string;
  pdfLink: string;
  imageUrl: string;
}) {
  return await db.$transaction(async (tx) => {
    // Add the book to the database
    const book = await tx.book.create({
      data: fields,
    });

    // Trigger the Lambda function to send an email
    try {
      const payload = {
        title: fields.title,
        author: fields.author,
        emailDetails: {
          to: "tirudev92@gmail.com", // Recipient email address
          subject: "New Book Added to the Library",
          body: `A new book titled "${fields.title}" by ${fields.author} has been added to the library.`,
        },
      };

      // Call the Lambda function via API Gateway
      const response = await axios.post(
        "https://ecqfn7o5a6.execute-api.us-east-1.amazonaws.com/default/bookstore-dbchanges", // Lambda API Gateway endpoint
        payload
      );

      console.log("Email sent successfully via Lambda:", response.data);
    } catch (error) {
      console.error("Failed to send email via Lambda:", error);
    }

    return book;
  });
}

export async function createBookSale(
  fields: {
    bookId: string;
    paymentAmount: number;
    method: PaymentMethod;
  },
  userId: string,
) {
  return await db.$transaction(async (tx) => {
    // First, create the book sale
    const newBookSale = await tx.bookSale.create({
      data: {
        bookId: fields.bookId,
        userId: userId,
      },
    });

    // Then, create the payment
    await tx.payment.create({
      data: {
        type: BookingType.purchase,
        paymentMethod: fields.method,
        amount: fields.paymentAmount,
        bookSaleId: newBookSale.id,
      },
    });
  });
}

export async function returnRentedBook(
  existingRentalId: string,
  fields: {
    paymentAmount: number;
    method: PaymentMethod;
  },
) {
  return await db.$transaction(async (tx) => {
    // Update the rented book
    const updatedRental = await tx.rentedBook.update({
      where: { id: existingRentalId },
      data: {
        returnDate: new Date(),
        isReturned: true,
      },
    });

    if (!updatedRental) {
      throw new Error("Rented book not found");
    }

    // Create the payment
    await tx.payment.create({
      data: {
        amount: fields.paymentAmount,
        paymentMethod: fields.method,
        type: BookingType.rent,
        rentalBookId: existingRentalId,
      },
    });
  });
}
