import { modals } from "@mantine/modals";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BookCopyIcon } from "lucide-react";
import { CustomerBookCard } from "~/components/book-card";

import { Page } from "~/components/page";
import {
  type GetAllBooks,
  getAllBooks,
  getAllRentedBooksByUserId,
  getPurchasedBooksByUserId,
} from "~/lib/book.server";
import { requireUserId } from "~/lib/session.server";
import { useCallbackOnRouteChange } from "~/utils/hooks/use-callback-on-route-change";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const [books, purchasedBooks, rentedBooks] = await Promise.all([
    getAllBooks(),
    getPurchasedBooksByUserId(userId),
    getAllRentedBooksByUserId(userId),
  ]);

  return json({
    books,
    currentRentedBookIds: rentedBooks
      .filter((b) => !b.payment)
      .map((rentedBook) => rentedBook.bookId),
    purchasedBookIds: purchasedBooks.map((purchasedBook) => purchasedBook.id),
  });
};

type Book = GetAllBooks[number];

export default function Books() {
  const { books } = useLoaderData<typeof loader>();

  useCallbackOnRouteChange(() => modals.closeAll());

  return (
    <Page.Layout>
      <Page.Header title="Books" icon={<BookCopyIcon />} />
      {books.length > 0 ? (
        <div className="grid grid-cols-3 items-center justify-center gap-4">
          {books.map((book) => (
            <BookRow key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="flex h-full min-h-36 items-center justify-center rounded-md border bg-blue-50 py-4 text-center">
          <span>No Books found</span>
        </div>
      )}
    </Page.Layout>
  );
}

function BookRow({ book }: { book: Book }) {
  const { currentRentedBookIds, purchasedBookIds } = useLoaderData<typeof loader>();

  const isBookPurchased = purchasedBookIds.includes(book.id);
  const isBookRented = currentRentedBookIds.includes(book.id);

  return (
    <CustomerBookCard
      book={book}
      showLibrary={true}
      isBookPurchased={isBookPurchased}
      isBookRented={isBookRented}
      showPurchaseOrRentButton={true}
    />
  );
}
