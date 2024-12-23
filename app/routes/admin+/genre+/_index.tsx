import { ActionIcon, Table } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { GridIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { Page } from "~/components/page";
import { type GetAllGenres, getAllGenres } from "~/lib/genre.server";
import { DeleteGenreModal } from "~/routes/resources+/delete-genre";
import { extractShortId } from "~/utils/misc";

export const loader = async () => {
  const genres = await getAllGenres();

  return json({
    genres,
  });
};

type Genre = GetAllGenres[number];

export default function ManageGenres() {
  const { genres } = useLoaderData<typeof loader>();

  return (
    <>
      <Page.Layout>
        <Page.Header
          action={
            <ActionIcon color="dark">
              <Link to="/admin/genre/new">
                <PlusIcon size={16} />
              </Link>
            </ActionIcon>
          }
          title="Genres"
          icon={<GridIcon />}
        />

        {genres.length > 0 ? (
          <div className="bg-gray-50 rounded-lg p-3">
            <Table stickyHeader>
              <Table.Thead className="bg-transparent">
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>
                    <span className="sr-only">Actions</span>
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {genres.map((genre) => (
                  <TableRow genre={genre} key={genre.id} />
                ))}
              </Table.Tbody>
            </Table>
          </div>
        ) : (
          <div className="flex h-full min-h-36 items-center justify-center rounded-md border bg-blue-50 py-4 text-center">
            <span>No Genres found</span>
          </div>
        )}
      </Page.Layout>
    </>
  );
}

function TableRow({ genre }: { genre: Genre }) {
  const [isDeleteModalOpen, handleDeleteModal] = useDisclosure(false);

  return (
    <>
      <Table.Tr key={genre.id}>
        <Table.Td>{extractShortId(genre.id)}</Table.Td>
        <Table.Td>{genre.name}</Table.Td>
        <Table.Td>
          <div className="flex items-center justify-end gap-4">
            <ActionIcon color="blue">
              <Link to={`${genre.id}/edit`}>
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

      <DeleteGenreModal genre={genre} onClose={handleDeleteModal.close} open={isDeleteModalOpen} />
    </>
  );
}
