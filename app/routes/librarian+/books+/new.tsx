import { Button, Divider, NumberInput, Select, TextInput } from "@mantine/core";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, Link, useFetcher, useLoaderData } from "@remix-run/react";
import { DollarSignIcon } from "lucide-react";
import { redirectWithSuccess } from "remix-toast";
import { Page } from "~/components/page";
import { createBook } from "~/lib/book.server";
import { getAllGenres } from "~/lib/genre.server";
import { getLibrarianById } from "~/lib/librarian.server";
import { requireUserId } from "~/lib/session.server";
import { badRequest } from "~/utils/misc.server";
import type { inferErrors } from "~/utils/validation";
import { validateAction } from "~/utils/validation";
import { CreateBookSchema } from "~/utils/zod.schema";
import type { Genre, User } from "@prisma/client";

export const loader = async ({ request }: ActionFunctionArgs) => {
  const id = await requireUserId(request);
  const librarian = await getLibrarianById(id);

  const genres = await getAllGenres();

  return json({
    librarian,
    genres,
  });
};

export interface ActionData {
  fieldErrors?: inferErrors<typeof CreateBookSchema>;
  success: boolean;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { fieldErrors, fields } = await validateAction(request, CreateBookSchema);

  if (fieldErrors) {
    return badRequest({ fieldErrors, success: false });
  }

  await createBook({
    title: fields.title,
    author: fields.author,
    isbn: fields.isbn,
    pdfLink: fields.pdfLink,
    imageUrl: fields.imageUrl,
    purchaseAmount: Number(fields.purchaseAmount),
    genreId: fields.genreId,
    libraryId: fields.libraryId,
  });

  return redirectWithSuccess("/librarian/books", "Book created successfully!");
};

export default function NewBook() {
  const { librarian, genres } = useLoaderData<{
    librarian: User & { libraryId: string | null };
    genres: Genre[];
  }>();
  const fetcher = useFetcher<ActionData>();

  const isSubmitting = fetcher.state !== "idle";

  return (
    <Page.Layout>
      <Page.Header title="New Book" />
      <div className="bg-gray-50 border-2 rounded-md w-[50vw] p-5">
        <fetcher.Form className="mx-auto flex flex-col gap-4" method="POST">
          <input name="libraryId" type="hidden" value={librarian?.libraryId!} />

          <TextInput
            data-autofocus
            error={fetcher.data?.fieldErrors?.title}
            label="Title"
            name="title"
            placeholder="Enter title"
            required
          />
          <TextInput
            error={fetcher.data?.fieldErrors?.author}
            label="Author"
            name="author"
            placeholder="Enter author"
            required
          />
          <TextInput
            error={fetcher.data?.fieldErrors?.isbn}
            label="ISBN"
            name="isbn"
            placeholder="Enter ISBN"
            required
          />

          <TextInput
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
            data={genres.map((genre) => ({
              value: genre.id,
              label: genre.name,
            }))}
            required
          />

          <TextInput
            error={fetcher.data?.fieldErrors?.imageUrl}
            label="Image URL"
            name="imageUrl"
            placeholder="Enter image URL"
            required
            type="url"
          />

          <NumberInput
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
              Create
            </Button>
          </div>
        </fetcher.Form>
      </div>
    </Page.Layout>
  );
}
