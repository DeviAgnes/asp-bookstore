import { ActionIcon } from "@mantine/core";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { BookCopyIcon, PlusIcon } from "lucide-react";
import { LibrarianBookCard } from "~/components/book-card";

import { Page } from "~/components/page";
import { getAllBooksByLibraryId } from "~/lib/book.server";
import { getLibrarianById } from "~/lib/librarian.server";
import { requireUserId } from "~/lib/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const librarianId = await requireUserId(request);

  const librarian = await getLibrarianById(librarianId);
  const books = await getAllBooksByLibraryId(librarian?.libraryId as string);

  return json({
    librarian,
    books,
  });
};

export default function ManageBooks() {
  const { books } = useLoaderData<typeof loader>();

  return (
    <>
      <Page.Layout>
        <Page.Header
          action={
            <ActionIcon color="dark">
              <Link to="/librarian/books/new">
                <PlusIcon size={16} />
              </Link>
            </ActionIcon>
          }
          title="Books"
          icon={<BookCopyIcon size={24} />}
        />

        {books.length > 0 ? (
          <div className="grid grid-cols-3 items-center justify-center gap-4">
            {books.map((book) => (
              <LibrarianBookCard book={book} key={book.id} />
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
