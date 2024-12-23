import { ActionIcon, Badge, Table } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Building2Icon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Page } from "~/components/page";
import { type GetAllLibraries, getAllLibraries } from "~/lib/library.server";
import { DeleteLibraryModal } from "~/routes/resources+/delete-library";
import { extractShortId } from "~/utils/misc";

export const loader = async () => {
  const libraries = await getAllLibraries();
  console.log("Libraries data:", JSON.stringify(libraries, null, 2));

  return json({
    libraries,
  });
};

export default function ManageLibraries() {
  const { libraries } = useLoaderData<typeof loader>();

  return (
    <>
      <Page.Layout>
        <Page.Header
          action={
            <ActionIcon color="dark">
              <Link to="/admin/libraries/new">
                <PlusIcon size={16} />
              </Link>
            </ActionIcon>
          }
          title="Libraries"
          icon={<Building2Icon />}
        />

        {libraries.length > 0 ? (
          <div className="bg-gray-50 rounded-lg p-3">
            <Table stickyHeader>
              <Table.Thead className="bg-transparent">
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Location</Table.Th>
                  <Table.Th>Phone</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Librarian</Table.Th>
                  <Table.Th>
                    <span className="sr-only">Actions</span>
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {libraries.map((library) => (
                  <TableRow library={library} key={library.id} />
                ))}
              </Table.Tbody>
            </Table>
          </div>
        ) : (
          <div className="flex h-full min-h-36 items-center justify-center rounded-md border bg-blue-50 py-4 text-center">
            <span>No Libraries found</span>
          </div>
        )}
      </Page.Layout>
    </>
  );
}

function TableRow({ library }: { library: GetAllLibraries[number] }) {
  const [isDeleteModalOpen, handleDeleteModal] = useDisclosure(false);

  return (
    <>
      <Table.Tr key={library.id}>
        <Table.Td>{extractShortId(library.id)}</Table.Td>
        <Table.Td>{library.name}</Table.Td>
        <Table.Td>{library.location}</Table.Td>
        <Table.Td>{library.phoneNo}</Table.Td>
        <Table.Td>{library.email}</Table.Td>
        <Table.Td>
          {library.librarian && library.librarian.length > 0 ? (
            <span className="text-sm font-medium">{library.librarian[0].name}</span>
          ) : (
            <Badge color="red">Not Assigned</Badge>
          )}
        </Table.Td>

        <Table.Td>
          <div className="flex items-center justify-end gap-4">
            <ActionIcon color="blue">
              <Link to={`/admin/libraries/${library.id}/edit`}>
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

      <DeleteLibraryModal
        library={library}
        onClose={handleDeleteModal.close}
        open={isDeleteModalOpen}
      />
    </>
  );
}
