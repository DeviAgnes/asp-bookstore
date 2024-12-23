import { ActionIcon, Table } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ExternalLinkIcon, SquareLibraryIcon } from "lucide-react";

import { Page } from "~/components/page";
import { type GetPurchasedBooksByUserId, getPurchasedBooksByUserId } from "~/lib/book.server";
import { requireUserId } from "~/lib/session.server";
import { ViewPDFModal } from "~/routes/resources+/view-pdf";
import { extractShortId, formatCurrency } from "~/utils/misc";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const books = await getPurchasedBooksByUserId(userId);

  return json({
    books,
  });
};

type Book = GetPurchasedBooksByUserId[number];

export default function ManageBooks() {
  const { books } = useLoaderData<typeof loader>();

  return (
    <>
      <Page.Layout>
        <Page.Header title="Purchased Books" icon={<SquareLibraryIcon />} />

        {books.length > 0 ? (
          <div className="bg-gray-50 rounded-lg p-3">
            <Table stickyHeader>
              <Table.Thead className="bg-transparent">
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Title</Table.Th>
                  <Table.Th>Author</Table.Th>
                  <Table.Th>ISBN</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>
                    <span className="sr-only">Actions</span>
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {books.map((media) => (
                  <TableRow book={media} key={media.id} />
                ))}
              </Table.Tbody>
            </Table>
          </div>
        ) : (
          <div className="flex h-full min-h-36 items-center justify-center rounded-md border bg-blue-50 py-4 text-center">
            <span>No books purchased!</span>
          </div>
        )}
      </Page.Layout>
    </>
  );
}

function TableRow({ book }: { book: Book }) {
  const [isPurchaseBookModalOpen, handlePurchaseBookModal] = useDisclosure(false);

  return (
    <>
      <Table.Tr key={book.id}>
        <Table.Td>{extractShortId(book.id)}</Table.Td>
        <Table.Td>{book.title}</Table.Td>
        <Table.Td>{book.author}</Table.Td>
        <Table.Td>{book.isbn}</Table.Td>
        <Table.Td>{formatCurrency(Number(book.purchaseAmount))}</Table.Td>

        <Table.Td>
          <div className="flex items-center justify-end gap-4">
            <ActionIcon color="blue" onClick={() => handlePurchaseBookModal.open()} variant="light">
              <ExternalLinkIcon size={16} />
            </ActionIcon>
          </div>
        </Table.Td>
      </Table.Tr>

      <ViewPDFModal
        onClose={handlePurchaseBookModal.close}
        open={isPurchaseBookModalOpen}
        pdfLink={book.pdfLink}
        title={book.title}
      />
    </>
  );
}
