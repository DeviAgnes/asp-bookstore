import { Button, Divider, Modal, ScrollArea, Text } from "@mantine/core";
import type { ActionFunctionArgs } from "@remix-run/node";
import { jsonWithError, redirectWithSuccess } from "remix-toast";
import { z } from "zod";
import { DetailField } from "~/components/details-field";
import { db } from "~/lib/prisma.server";
import type { GetAllBooks } from "~/lib/book.server";
import { requireUserId } from "~/lib/session.server";
import { useCallbackOnRouteChange } from "~/utils/hooks/use-callback-on-route-change";
import { useFetcherCallback } from "~/utils/hooks/use-fetcher-callback";
import { badRequest } from "~/utils/misc.server";
import type { inferErrors } from "~/utils/validation";
import { validateAction } from "~/utils/validation";

const RENT_BOOK_ROUTE = "/resources/rent-book";
const RENT_BOOK_FORM_ID = "rent-book-form";

const RentBookSchema = z.object({
  bookId: z.string().trim().min(1, "Study room ID is required"),
});

export interface ActionData {
  fieldErrors?: inferErrors<typeof RentBookSchema>;
  success: boolean;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const { fieldErrors, fields } = await validateAction(request, RentBookSchema);

  if (fieldErrors) {
    return badRequest({ fieldErrors, success: false });
  }

  const existingBook = await db.book.findFirst({
    where: { id: fields.bookId },
  });

  if (!existingBook) {
    return jsonWithError(
      {
        success: false,
      },
      "Book not found",
    );
  }

  await db.rentedBook.create({
    data: {
      bookId: fields.bookId,
      userId,
    },
  });

  return redirectWithSuccess("/rented-books", "Book rented successfully!");
};

interface Props {
  book: GetAllBooks[number];
  onClose: () => void;
  open: boolean;
}

export const RentBookDrawer = ({ open, onClose, book }: Props) => {
  const fetcher = useFetcherCallback<ActionData>({
    onSuccess: () => onClose(),
  });

  useCallbackOnRouteChange(() => onClose());

  return (
    <>
      <Modal
        closeOnClickOutside={false}
        onClose={() => onClose()}
        opened={open}
        padding="xl"
        radius="md"
        scrollAreaComponent={ScrollArea.Autosize}
        size="md"
        title="Rent Book"
      >
        <div className="col-span-4">
          <fetcher.Form
            action={RENT_BOOK_ROUTE}
            className="mx-auto flex flex-col gap-8"
            id={RENT_BOOK_FORM_ID}
            method="POST"
          >
            <input hidden name="bookId" value={book.id} />
            <Text size="sm">
              Are you sure you want to rent this book? This will be a one-time rental.
            </Text>

            <div className="flex flex-col gap-2">
              <DetailField label="Title" value={book.title} />
              <DetailField label="Author" value={book.author} />
              <DetailField label="ISBN" value={book.isbn} />
            </div>

            <Divider />

            <div className="flex items-center justify-end gap-4">
              <Button color="red" onClick={() => onClose()} variant="subtle">
                Cancel
              </Button>
              <Button form={RENT_BOOK_FORM_ID} loading={fetcher.isPending} type="submit">
                Rent
              </Button>
            </div>
          </fetcher.Form>
        </div>
      </Modal>
    </>
  );
};
