import { z } from "zod";

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export const emailSchema = z.string().regex(EMAIL_REGEX, "Invalid email");
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

export const CreateBookSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  author: z.string().trim().min(1, "Author is required"),
  isbn: z.string().trim().min(1, "ISBN is required"),
  pdfLink: z.string().trim().url("Invalid URL"),
  imageUrl: z.string().trim().url("Invalid URL"),
  genreId: z.string().trim().min(1, "Genre is required"),
  purchaseAmount: z.preprocess(Number, z.number().min(0, "Purchase amount must be greater than 0")),
  libraryId: z.string().trim().min(1, "Library is required"),
});

export const EditBookSchema = CreateBookSchema.extend({
  bookId: z.string().trim().min(1, "ID is required"),
});

export const CreateLibrarianSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["password", "confirmPassword"],
  });

export const EditLibrarianSchema = z
  .object({
    librarianId: z.string().trim().min(1, "ID is required"),
    name: z.string().trim().min(1, "Name is required"),
    email: emailSchema,
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password || data.confirmPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  )
  .refine(
    (data) => {
      if (data.password) {
        return data.password.length >= 8;
      }
      return true;
    },
    {
      message: "Password must be at least 8 characters",
      path: ["password"],
    },
  );

export const CreateLibrarySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  location: z.string().trim().min(1, "Location is required"),
  phoneNo: z.string().trim().min(1, "Phone number is required"),
  email: z.string().trim().email("Invalid email"),
  librarianId: z.string().trim().min(1, "Librarian is required"),
});

export const EditLibrarySchema = CreateLibrarySchema.extend({
  libraryId: z.string().trim().min(1, "ID is required"),
});

export const CreateGenreSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export const EditGenreSchema = CreateGenreSchema.extend({
  genreId: z.string().trim().min(1, "ID is required"),
});

export const DeleteLibrarySchema = z.object({
  libraryId: z.string().trim().min(1, "ID is required"),
});

export const DeleteLibrarianSchema = z.object({
  librarianId: z.string().trim().min(1, "ID is required"),
});

export const DeleteBookSchema = z.object({
  bookId: z.string().trim().min(1, "ID is required"),
});

export const DeleteGenreSchema = z.object({
  genreId: z.string().trim().min(1, "ID is required"),
});
