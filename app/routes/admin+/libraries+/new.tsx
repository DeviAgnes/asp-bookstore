import { Button, Divider, Select, Textarea, TextInput } from "@mantine/core";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { redirectWithSuccess } from "remix-toast";
import { getAllNonAssignedLibrarians } from "~/lib/librarian.server";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { Page } from "~/components/page";
import { badRequest } from "~/utils/misc.server";
import type { inferErrors } from "~/utils/validation";
import { validateAction } from "~/utils/validation";
import { CreateLibrarySchema } from "~/utils/zod.schema";
import { createLibrary } from "~/lib/library.server";
import type { User } from "@prisma/client";

export const loader = async () => {
  const librarians = await getAllNonAssignedLibrarians();

  return json({
    librarians,
  });
};

export interface ActionData {
  fieldErrors?: inferErrors<typeof CreateLibrarySchema>;
  success: boolean;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { fieldErrors, fields } = await validateAction(request, CreateLibrarySchema);

  if (fieldErrors) {
    return badRequest({ fieldErrors, success: false });
  }

  await createLibrary({
    email: fields.email,
    location: fields.location,
    name: fields.name,
    phoneNo: fields.phoneNo,
    librarian: fields.librarianId
      ? {
          connect: {
            id: fields.librarianId,
          },
        }
      : undefined,
  });

  return redirectWithSuccess("/admin/libraries", "Library created successfully!");
};

export default function NewLibrary() {
  const { librarians } = useLoaderData<{
    librarians: User[];
  }>();

  const fetcher = useFetcher<ActionData>();

  const isSubmitting = fetcher.state !== "idle";

  return (
    <Page.Layout>
      <Page.Header title="New Library" />
      <div className="bg-gray-50 border-2 rounded-md w-[50vw] p-5">
        <fetcher.Form className="mx-auto flex flex-col gap-4" method="POST">
          <TextInput
            data-autofocus
            error={fetcher.data?.fieldErrors?.name}
            label="Name"
            name="name"
            placeholder="Enter name"
            required
          />
          <Textarea
            error={fetcher.data?.fieldErrors?.location}
            label="Location"
            name="location"
            placeholder="Enter location"
            required
          />
          <TextInput
            error={fetcher.data?.fieldErrors?.phoneNo}
            label="Phone Number"
            name="phoneNo"
            placeholder="Enter phone number"
            required
          />

          <TextInput
            error={fetcher.data?.fieldErrors?.email}
            label="Email"
            name="email"
            placeholder="Enter email"
            required
            type="email"
          />

          <Select
            error={fetcher.data?.fieldErrors?.librarianId}
            label="Librarian"
            name="librarianId"
            data={librarians.map((librarian) => ({
              label: librarian.name,
              value: librarian.id,
            }))}
            placeholder="Select librarian"
            required
          />

          <Divider className="mt-4" />

          <div className="flex items-center justify-end gap-4">
            <Link to="/admin/libraries">
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
