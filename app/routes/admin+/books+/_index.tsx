import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BookCopyIcon } from "lucide-react";
import { AdminBookCard } from "~/components/book-card";

import { Page } from "~/components/page";
import { getAllBooks } from "~/lib/book.server";

export const loader = async () => {
  const books = await getAllBooks();

  return json({
    books,
  });
};

export default function ManageBooks() {
  const { books } = useLoaderData<typeof loader>();

  return (
    <>
      <Page.Layout>
        <Page.Header title="Books" icon={<BookCopyIcon />} />
        {books.length > 0 ? (
          <div className="grid grid-cols-3 items-center justify-center gap-4">
            {books.map((book) => (
              <AdminBookCard book={book} key={book.id} />
            ))}
          </div>
        ) : (
          <div className="flex h-full min-h-36 items-center justify-center rounded-md border bg-blue-50 py-4 text-center">
            <span>No Books found</span>
          </div>
        )}
      </Page.Layout>
    </>
  );
}
