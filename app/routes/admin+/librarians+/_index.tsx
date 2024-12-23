import { ActionIcon, Badge, Table } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { PencilIcon, PlusIcon, Trash2Icon, Users2Icon } from "lucide-react";

import { Page } from "~/components/page";
import { type GetAllLibrarians, getAllLibrarians } from "~/lib/librarian.server";
import { DeleteLibrarianModal } from "~/routes/resources+/delete-librarian";
import { extractShortId } from "~/utils/misc";

export const loader = async () => {
  const librarians = await getAllLibrarians();

  return json({
    librarians,
  });
};

type Librarian = GetAllLibrarians[number];

export default function ManageLibrarians() {
  const { librarians } = useLoaderData<typeof loader>();

  return (
    <>
      <Page.Layout>
        <Page.Header
          action={
            <ActionIcon color="dark">
              <Link to="/admin/librarians/new">
                <PlusIcon size={16} />
              </Link>
            </ActionIcon>
          }
          title="Librarians"
          icon={<Users2Icon />}
        />

        {librarians.length > 0 ? (
          <div className="bg-gray-50 p-3 rounded-lg">
            <Table stickyHeader>
              <Table.Thead className="bg-transparent">
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Library</Table.Th>
                  <Table.Th>
                    <span className="sr-only">Actions</span>
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {librarians.map((librarian) => (
                  <TableRow librarian={librarian} key={librarian.id} />
                ))}
              </Table.Tbody>
            </Table>
          </div>
        ) : (
          <div className="flex h-full min-h-36 items-center justify-center rounded-md border bg-blue-50 py-4 text-center">
            <span>No Librarians found</span>
          </div>
        )}
      </Page.Layout>
    </>
  );
}

function TableRow({ librarian }: { librarian: Librarian }) {
  const [isDeleteModalOpen, handleDeleteModal] = useDisclosure(false);

  return (
    <>
      <Table.Tr key={librarian.id}>
        <Table.Td>{extractShortId(librarian.id)}</Table.Td>
        <Table.Td>{librarian.name}</Table.Td>
        <Table.Td>{librarian.email}</Table.Td>
        <Table.Td>
          {librarian.library ? librarian.library.name : <Badge color="red">Not Assigned</Badge>}
        </Table.Td>

        <Table.Td>
          <div className="flex items-center justify-end gap-4">
            <ActionIcon color="blue">
              <Link to={`/admin/librarians/${librarian.id}/edit`}>
                <PencilIcon size={16} />
              </Link>
            </ActionIcon>
            <ActionIcon
              color="red"
              onClick={() => {
                handleDeleteModal.open();
              }}
            >
              <Trash2Icon size={16} />
            </ActionIcon>
          </div>
        </Table.Td>
      </Table.Tr>

      <DeleteLibrarianModal
        librarian={librarian}
        onClose={handleDeleteModal.close}
        open={isDeleteModalOpen}
      />
    </>
  );
}
