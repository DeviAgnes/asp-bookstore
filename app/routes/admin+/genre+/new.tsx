import { Button, Divider, TextInput } from "@mantine/core";
import { Link } from "@remix-run/react";
import { useFetcher, type ActionFunctionArgs } from "react-router-dom";
import { redirectWithSuccess } from "remix-toast";
import { Page } from "~/components/page";
import { db } from "~/lib/prisma.server";
import { badRequest } from "~/utils/misc.server";
import { validateAction, type inferErrors } from "~/utils/validation";
import { CreateGenreSchema } from "~/utils/zod.schema";

export interface ActionData {
  fieldErrors?: inferErrors<typeof CreateGenreSchema>;
  success: boolean;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { fieldErrors, fields } = await validateAction(request, CreateGenreSchema);

  if (fieldErrors) {
    return badRequest({ fieldErrors, success: false });
  }

  await db.genre.create({
    data: { name: fields.name },
  });

  return redirectWithSuccess("/admin/genre", "Genre created successfully!");
};

export default function NewGenre() {
  const fetcher = useFetcher<ActionData>();

  const isSubmitting = fetcher.state !== "idle";

  return (
    <>
      <Page.Layout>
        <Page.Header title="New Genre" />

        <div className="bg-gray-50 border-2 rounded-md w-[50vw] p-5">
          <fetcher.Form method="POST">
            <TextInput label="Name" name="name" required error={fetcher.data?.fieldErrors?.name} />

            <Divider className="mt-4" />
            <div className="flex items-center justify-end gap-4 mt-2">
              <Link to="/admin/genre">
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
    </>
  );
}
