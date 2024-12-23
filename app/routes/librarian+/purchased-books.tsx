import { ActionIcon, Table } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ExternalLinkIcon, SquareLibraryIcon } from "lucide-react";
import { Page } from "~/components/page";
import { type GetPurchasedBooksByLibraryId, getPurchasedBooksByLibraryId } from "~/lib/book.server";
import { getLibrarianById } from "~/lib/librarian.server";
import { requireUserId } from "~/lib/session.server";
import { ViewPDFModal } from "~/routes/resources+/view-pdf";
import { extractShortId, formatCurrency } from "~/utils/misc";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const librarianId = await requireUserId(request);
  const librarian = await getLibrarianById(librarianId);

  if (!librarian) {
    throw new Error("Librarian not found");
  }

  const purchases = await getPurchasedBooksByLibraryId(librarian?.libraryId as string);

  return json({
    purchases,
  });
};

type Sale = GetPurchasedBooksByLibraryId[number];

export default function ManageBooks() {
  const { purchases } = useLoaderData<typeof loader>();

  return (
    <>
      <Page.Layout>
        <Page.Header title="Purchased Books" icon={<SquareLibraryIcon />} />

        {purchases.length > 0 ? (
          <div className="bg-gray-50 p-3 rounded-lg">
            <Table stickyHeader>
              <Table.Thead className="bg-transparent">
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Title</Table.Th>
                  <Table.Th>Author</Table.Th>
                  <Table.Th>Genre</Table.Th>
                  <Table.Th>ISBN</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>Purchased By</Table.Th>
                  <Table.Th>
                    <span className="sr-only">Actions</span>
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {purchases.map((purchase) => (
                  <TableRow sale={purchase} key={purchase.id} />
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

function TableRow({ sale }: { sale: Sale }) {
  const [isViewPDFModalOpen, handleViewPDFModal] = useDisclosure(false);

  return (
    <>
      <Table.Tr key={sale.id}>
        <Table.Td>{extractShortId(sale.id)}</Table.Td>
        <Table.Td>{sale.book!.title}</Table.Td>
        <Table.Td>{sale.book!.author}</Table.Td>
        <Table.Td>{sale.book!.genre!.name}</Table.Td>
        <Table.Td>{sale.book!.isbn}</Table.Td>
        <Table.Td>{formatCurrency(Number(sale.book!.purchaseAmount))}</Table.Td>
        <Table.Td>{sale.user!.name}</Table.Td>
        <Table.Td>
          <ActionIcon color="blue" onClick={() => handleViewPDFModal.open()} variant="light">
            <ExternalLinkIcon size={16} />
          </ActionIcon>
        </Table.Td>
      </Table.Tr>

      <ViewPDFModal
        onClose={handleViewPDFModal.close}
        open={isViewPDFModalOpen}
        pdfLink={sale.book!.pdfLink}
        title={sale.book!.title}
      />
    </>
  );
}
