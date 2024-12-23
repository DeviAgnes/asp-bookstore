import { Button, Divider, TextInput } from "@mantine/core";
import { json, type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { type ActionFunctionArgs, useFetcher } from "react-router-dom";
import { redirectWithSuccess } from "remix-toast";
import { Page } from "~/components/page";
import { db } from "~/lib/prisma.server";
import { getGenreById } from "~/lib/genre.server";
import { badRequest } from "~/utils/misc.server";
import { type inferErrors, validateAction } from "~/utils/validation";
import { EditGenreSchema } from "~/utils/zod.schema";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id;
  if (!id) {
    return redirect("/admin/genre");
  }

  const genreToEdit = await getGenreById(id);
  if (!genreToEdit) {
    return redirect("/admin/genre");
  }

  return json({
    genreToEdit,
  });
};

export interface ActionData {
  fieldErrors?: inferErrors<typeof EditGenreSchema>;
  success: boolean;
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { id: genreId } = params;
  if (!genreId) {
    return redirect("/admin/genre");
  }

  const { fieldErrors, fields } = await validateAction(request, EditGenreSchema);

  if (fieldErrors) {
    return badRequest({ fieldErrors, success: false });
  }

  await db.genre.update({
    where: { id: genreId },
    data: { name: fields.name },
  });

  return redirectWithSuccess("/admin/genre", "Genre updated successfully!");
};

export default function EditGenre() {
  const { genreToEdit } = useLoaderData<typeof loader>();

  const fetcher = useFetcher<ActionData>();

  const isSubmitting = fetcher.state !== "idle";

  return (
    <>
      <Page.Layout>
        <Page.Header title="Edit Genre" />

        <div className="bg-gray-50 border-2 rounded-md w-[50vw] p-5">
          <fetcher.Form method="POST">
            <input type="hidden" name="genreId" value={genreToEdit.id} />

            <TextInput
              label="Name"
              name="name"
              required
              error={fetcher.data?.fieldErrors?.name}
              defaultValue={genreToEdit.name}
            />

            <Divider className="mt-4" />
            <div className="flex items-center justify-end gap-4 mt-2">
              <Link to="/admin/genre">
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
    </>
  );
}
