import { Button, Modal, ScrollArea, Text } from "@mantine/core";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirectWithSuccess } from "remix-toast";
import { db } from "~/lib/prisma.server";
import type { GetAllBooks, GetAllBooksByLibraryId } from "~/lib/book.server";
import { useCallbackOnRouteChange } from "~/utils/hooks/use-callback-on-route-change";
import { useFetcherCallback } from "~/utils/hooks/use-fetcher-callback";
import { badRequest } from "~/utils/misc.server";
import type { inferErrors } from "~/utils/validation";
import { validateAction } from "~/utils/validation";
import { DeleteBookSchema } from "~/utils/zod.schema";

const DELETE_BOOK_ROUTE = "/resources/delete-book";
const DELETE_BOOK_FORM_ID = "delete-book-form";

export interface ActionData {
  fieldErrors?: inferErrors<typeof DeleteBookSchema>;
  success: boolean;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { fieldErrors, fields } = await validateAction(request, DeleteBookSchema);

  if (fieldErrors) {
    return badRequest({ fieldErrors, success: false });
  }

  const { bookId } = fields;

  await db.book.delete({
    where: { id: bookId },
  });

  return redirectWithSuccess("/librarian/books", "Book deleted successfully!");
};

interface IDeleteBookModal {
  book: GetAllBooksByLibraryId[number] | GetAllBooks[number];
  onClose: () => void;
  open: boolean;
}

export const DeleteBookModal = ({ open, onClose, book }: IDeleteBookModal) => {
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
          action={DELETE_BOOK_ROUTE}
          className="mx-auto flex flex-col gap-4"
          id={DELETE_BOOK_FORM_ID}
          method="POST"
        >
          <input defaultValue={book.id} hidden name="bookId" />

          <Text>
            Are you sure you want to delete the book <strong>{book.title}</strong>
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
