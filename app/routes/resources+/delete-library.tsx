import { Button, Modal, ScrollArea, Text } from "@mantine/core";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirectWithSuccess } from "remix-toast";
import type { GetAllLibraries } from "~/lib/library.server";
import { db } from "~/lib/prisma.server";
import { useCallbackOnRouteChange } from "~/utils/hooks/use-callback-on-route-change";
import { useFetcherCallback } from "~/utils/hooks/use-fetcher-callback";
import { badRequest } from "~/utils/misc.server";
import type { inferErrors } from "~/utils/validation";
import { validateAction } from "~/utils/validation";
import { DeleteLibrarySchema } from "~/utils/zod.schema";

const DELETE_LIBRARY_ROUTE = "/resources/delete-library";
const DELETE_LIBRARY_FORM_ID = "delete-library-form";

export interface ActionData {
  fieldErrors?: inferErrors<typeof DeleteLibrarySchema>;
  success: boolean;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { fieldErrors, fields } = await validateAction(request, DeleteLibrarySchema);

  if (fieldErrors) {
    return badRequest({ fieldErrors, success: false });
  }

  const { libraryId } = fields;

  await db.library.delete({
    where: { id: libraryId },
  });

  return redirectWithSuccess("/admin/libraries", "Library deleted successfully!");
};

interface IDeleteLibraryModal {
  library: GetAllLibraries[number];
  onClose: () => void;
  open: boolean;
}

export const DeleteLibraryModal = ({ open, onClose, library }: IDeleteLibraryModal) => {
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
        title="Delete Library"
      >
        <fetcher.Form
          action={DELETE_LIBRARY_ROUTE}
          className="mx-auto flex flex-col gap-4"
          id={DELETE_LIBRARY_FORM_ID}
          method="POST"
        >
          <input defaultValue={library.id} hidden name="libraryId" />

          <Text>
            Are you sure you want to delete the library <strong>{library.name}</strong>
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
