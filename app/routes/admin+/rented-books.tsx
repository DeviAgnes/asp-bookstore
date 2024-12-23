import { ActionIcon, Table } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ExternalLinkIcon, SquareLibraryIcon } from "lucide-react";
import { Page } from "~/components/page";
import { type GetAllRentedBooks, getAllRentedBooks } from "~/lib/book.server";
import { ViewPDFModal } from "~/routes/resources+/view-pdf";
import { extractShortId, formatDate } from "~/utils/misc";

export const loader = async () => {
  const rentals = await getAllRentedBooks();

  return json({
    rentals,
  });
};

type Rental = GetAllRentedBooks[number];

export default function ManageBooks() {
  const { rentals } = useLoaderData<typeof loader>();

  return (
    <>
      <Page.Layout>
        <Page.Header title="Rented Books" icon={<SquareLibraryIcon />} />

        {rentals.length > 0 ? (
          <div className="bg-gray-50 rounded-lg p-3">
            <Table stickyHeader>
              <Table.Thead className="bg-transparent">
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Title</Table.Th>
                  <Table.Th>Author</Table.Th>
                  <Table.Th>Genre</Table.Th>
                  <Table.Th>ISBN</Table.Th>
                  <Table.Th>Rent Date</Table.Th>
                  <Table.Th>Return Date</Table.Th>
                  <Table.Th>Rented By</Table.Th>
                  <Table.Th>Library</Table.Th>
                  <Table.Th>
                    <span className="sr-only">Actions</span>
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rentals.map((rental) => (
                  <TableRow key={rental.id} rental={rental} />
                ))}
              </Table.Tbody>
            </Table>
          </div>
        ) : (
          <div className="flex h-full min-h-36 items-center justify-center rounded-md border bg-blue-50 py-4 text-center">
            <span>No books rented!</span>
          </div>
        )}
      </Page.Layout>
    </>
  );
}

function TableRow({ rental }: { rental: Rental }) {
  const [isViewPDFModalOpen, handleViewPDFModal] = useDisclosure(false);

  return (
    <>
      <Table.Tr key={rental.id}>
        <Table.Td>{extractShortId(rental.id)}</Table.Td>
        <Table.Td>{rental.book!.title}</Table.Td>
        <Table.Td>{rental.book!.author}</Table.Td>
        <Table.Td>{rental.book!.genre!.name}</Table.Td>
        <Table.Td>{rental.book!.isbn}</Table.Td>
        <Table.Td>{formatDate(rental.rentedAt)}</Table.Td>
        <Table.Td>
          {rental.returnDate ? (
            formatDate(rental.returnDate)
          ) : (
            <p className="italic">Currently rented</p>
          )}
        </Table.Td>
        <Table.Td>{rental.user!.name}</Table.Td>
        <Table.Td>{rental.book!.library!.name}</Table.Td>

        <Table.Td>
          <div className="flex items-center justify-end gap-4">
            <ActionIcon color="blue" onClick={() => handleViewPDFModal.open()} variant="light">
              <ExternalLinkIcon size={16} />
            </ActionIcon>
          </div>
        </Table.Td>
      </Table.Tr>

      <ViewPDFModal
        onClose={handleViewPDFModal.close}
        open={isViewPDFModalOpen}
        pdfLink={rental.book!.pdfLink}
        title={rental.book!.title}
      />
    </>
  );
}
