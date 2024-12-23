import { Button, Divider, NumberInput, Select, TextInput } from "@mantine/core";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, Link, redirect, useFetcher, useLoaderData } from "@remix-run/react";
import { DollarSignIcon } from "lucide-react";
import { jsonWithError, redirectWithSuccess } from "remix-toast";
import { Page } from "~/components/page";
import { db } from "~/lib/prisma.server";
import { getBookById, updateBook } from "~/lib/book.server";
import { getAllGenres } from "~/lib/genre.server";
import { badRequest } from "~/utils/misc.server";
import type { inferErrors } from "~/utils/validation";
import { validateAction } from "~/utils/validation";
import { EditBookSchema } from "~/utils/zod.schema";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { id } = params;
  if (!id) {
    return redirect("/librarian/books");
  }

  const bookToEdit = await getBookById(id);
  if (!bookToEdit) {
    return redirect("/librarian/books");
  }

  const genres = await getAllGenres();

  return json({
    bookToEdit,
    genres,
  });
};

export interface ActionData {
  fieldErrors?: inferErrors<typeof EditBookSchema>;
  success: boolean;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { fieldErrors, fields } = await validateAction(request, EditBookSchema);

  if (fieldErrors) {
    return badRequest({ fieldErrors, success: false });
  }

  const { bookId, ...restFields } = fields;

  const existingBook = await db.book.findFirst({
    where: { id: bookId },
  });

  if (!existingBook) {
    return jsonWithError(
      {
        fieldErrors: {
          bookId: "Book not found",
        },
        success: false,
      },
      "Media not found",
    );
  }

  await updateBook(existingBook.id, {
    title: restFields.title,
    author: restFields.author,
    isbn: restFields.isbn,
    pdfLink: restFields.pdfLink,
    imageUrl: restFields.imageUrl,
    purchaseAmount: Number(restFields.purchaseAmount),
    genreId: restFields.genreId,
  });

  return redirectWithSuccess("/librarian/books", "Book updated successfully!");
};

export default function EditBook() {
  const { bookToEdit, genres } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<ActionData>();

  const isSubmitting = fetcher.state !== "idle";

  return (
    <Page.Layout>
      <Page.Header title="Edit Book" />
      <div className="bg-gray-50 border-2 rounded-md w-[50vw] p-5">
        <fetcher.Form className="mx-auto flex flex-col gap-4" method="POST">
          <input value={bookToEdit.id} hidden name="bookId" />
          <input value={bookToEdit.libraryId!} hidden name="libraryId" />

          <TextInput
            data-autofocus
            defaultValue={bookToEdit.title}
            error={fetcher.data?.fieldErrors?.title}
            label="Title"
            name="title"
            placeholder="Enter title"
            required
          />
          <TextInput
            defaultValue={bookToEdit.author}
            error={fetcher.data?.fieldErrors?.author}
            label="Author"
            name="author"
            placeholder="Enter author"
            required
          />
          <TextInput
            defaultValue={bookToEdit.isbn}
            error={fetcher.data?.fieldErrors?.isbn}
            label="ISBN"
            name="isbn"
            placeholder="Enter ISBN"
            required
          />

          <TextInput
            defaultValue={bookToEdit.pdfLink}
            error={fetcher.data?.fieldErrors?.pdfLink}
            label="PDF Link"
            name="pdfLink"
            placeholder="Enter PDF Link"
            required
            type="url"
          />

          <Select
            error={fetcher.data?.fieldErrors?.genreId}
            label="Genre"
            name="genreId"
            data={Object.values(genres).map((genre) => ({
              value: genre.id,
              label: genre.name,
            }))}
            defaultValue={bookToEdit.genreId}
            required
          />

          <TextInput
            error={fetcher.data?.fieldErrors?.imageUrl}
            defaultValue={bookToEdit.imageUrl}
            label="Image URL"
            name="imageUrl"
            placeholder="Enter image URL"
            required
            type="url"
          />

          <NumberInput
            defaultValue={Number(bookToEdit.purchaseAmount)}
            error={fetcher.data?.fieldErrors?.purchaseAmount}
            fixedDecimalScale
            label="Purchase Amount"
            leftSection={<DollarSignIcon className="size-4" />}
            name="purchaseAmount"
            placeholder="Enter purchase amount"
            required
          />

          <Divider className="mt-4" />

          <div className="flex items-center justify-end gap-4">
            <Link to="/librarian/books">
              <Button color="red" variant="subtle">
                Cancel
              </Button>
            </Link>
            <Button loading={isSubmitting} type="submit">
              Update
            </Button>
          </div>
        </fetcher.Form>
      </div>
    </Page.Layout>
  );
}
