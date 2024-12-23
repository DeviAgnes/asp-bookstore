import { Button, Modal, ScrollArea, Text } from "@mantine/core";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirectWithSuccess } from "remix-toast";
import { db } from "~/lib/prisma.server";
import type { GetAllLibrarians } from "~/lib/librarian.server";
import { useCallbackOnRouteChange } from "~/utils/hooks/use-callback-on-route-change";
import { useFetcherCallback } from "~/utils/hooks/use-fetcher-callback";
import { badRequest } from "~/utils/misc.server";
import type { inferErrors } from "~/utils/validation";
import { validateAction } from "~/utils/validation";
import { DeleteLibrarianSchema } from "~/utils/zod.schema";

const DELETE_LIBRARIAN_ROUTE = "/resources/delete-librarian";
const DELETE_LIBRARIAN_FORM_ID = "delete-librarian-form";

export interface ActionData {
  fieldErrors?: inferErrors<typeof DeleteLibrarianSchema>;
  success: boolean;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { fieldErrors, fields } = await validateAction(request, DeleteLibrarianSchema);

  if (fieldErrors) {
    return badRequest({ fieldErrors, success: false });
  }

  const { librarianId } = fields;

  await db.user.delete({
    where: { id: librarianId },
  });

  return redirectWithSuccess("/admin/librarians", "Librarian deleted successfully!");
};

interface IDeleteLibrarianModal {
  librarian: GetAllLibrarians[number];
  onClose: () => void;
  open: boolean;
}

export const DeleteLibrarianModal = ({ open, onClose, librarian }: IDeleteLibrarianModal) => {
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
        title="Delete Librarian"
      >
        <fetcher.Form
          action={DELETE_LIBRARIAN_ROUTE}
          className="mx-auto flex flex-col gap-4"
          id={DELETE_LIBRARIAN_FORM_ID}
          method="POST"
        >
          <input defaultValue={librarian.id} hidden name="librarianId" />

          <Text>
            Are you sure you want to delete the librarian <strong>{librarian.name}</strong>
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
