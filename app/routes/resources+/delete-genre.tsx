import { Button, Modal, ScrollArea, Text } from "@mantine/core";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirectWithSuccess } from "remix-toast";
import { db } from "~/lib/prisma.server";
import type { GetAllGenres } from "~/lib/genre.server";
import { useCallbackOnRouteChange } from "~/utils/hooks/use-callback-on-route-change";
import { useFetcherCallback } from "~/utils/hooks/use-fetcher-callback";
import { badRequest } from "~/utils/misc.server";
import type { inferErrors } from "~/utils/validation";
import { validateAction } from "~/utils/validation";
import { DeleteGenreSchema } from "~/utils/zod.schema";

const DELETE_GENRE_ROUTE = "/resources/delete-genre";
const DELETE_GENRE_FORM_ID = "delete-genre-form";

export interface ActionData {
  fieldErrors?: inferErrors<typeof DeleteGenreSchema>;
  success: boolean;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { fieldErrors, fields } = await validateAction(request, DeleteGenreSchema);

  if (fieldErrors) {
    return badRequest({ fieldErrors, success: false });
  }

  const { genreId } = fields;

  await db.genre.delete({
    where: { id: genreId },
  });

  return redirectWithSuccess("/admin/genre", "Genre deleted successfully!");
};

interface IDeleteGenreModal {
  genre: GetAllGenres[number];
  onClose: () => void;
  open: boolean;
}

export const DeleteGenreModal = ({ open, onClose, genre }: IDeleteGenreModal) => {
  const onModalClose = () => {
    onClose();
  };

  const fetcher = useFetcherCallback<ActionData>({
    onSuccess: () => onModalClose(),
  });

  useCallbackOnRouteChange(() => onModalClose());

  return (
    <>
      <Modal
        closeOnClickOutside={false}
        onClose={() => onModalClose()}
        opened={open}
        scrollAreaComponent={ScrollArea.Autosize}
        size="lg"
        title="Delete Genre"
      >
        <fetcher.Form
          action={DELETE_GENRE_ROUTE}
          className="mx-auto flex flex-col gap-4"
          id={DELETE_GENRE_FORM_ID}
          method="POST"
        >
          <input defaultValue={genre.id} hidden name="genreId" />

          <Text>
            Are you sure you want to delete the genre <strong>{genre.name}</strong>
          </Text>

          <div className="flex items-center justify-end gap-4">
            <Button color="red" onClick={() => onModalClose()} variant="subtle">
              Cancel
            </Button>
            <Button loading={fetcher.isPending} type="submit">
              Delete
            </Button>
          </div>
        </fetcher.Form>
      </Modal>
    </>
  );
};
