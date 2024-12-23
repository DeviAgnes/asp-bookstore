import { Button, Divider, Select, Textarea, TextInput } from "@mantine/core";
import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { jsonWithError, redirectWithSuccess } from "remix-toast";
import { getAllNonAssignedLibrarians } from "~/lib/librarian.server";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import * as React from "react";
import { Page } from "~/components/page";
import { db } from "~/lib/prisma.server";
import { getLibraryById, updateLibrary } from "~/lib/library.server";
import { badRequest } from "~/utils/misc.server";
import type { inferErrors } from "~/utils/validation";
import { validateAction } from "~/utils/validation";
import { EditLibrarySchema } from "~/utils/zod.schema";
import type { User } from "@prisma/client";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { id } = params;
  if (!id) {
    return redirect("/admin/libraries");
  }

  const libraryToEdit = await getLibraryById(id);
  if (!libraryToEdit) {
    return redirect("/admin/libraries");
  }

  const librarians = await getAllNonAssignedLibrarians();

  return json({
    librarians,
    libraryToEdit,
  });
};

export interface ActionData {
  fieldErrors?: inferErrors<typeof EditLibrarySchema>;
  success: boolean;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { fieldErrors, fields } = await validateAction(request, EditLibrarySchema);

  if (fieldErrors) {
    return badRequest({ fieldErrors, success: false });
  }

  const { libraryId, ...restFields } = fields;

  const existingLibrary = await db.library.findFirst({
    where: { id: libraryId },
  });

  if (!existingLibrary) {
    return jsonWithError(
      {
        fieldErrors: {
          libraryId: "Library not found",
        },
        success: false,
      },
      "Media not found",
    );
  }

  await updateLibrary(
    { id: existingLibrary.id },
    {
      name: restFields.name,
      email: restFields.email,
      librarian: {
        connect: {
          id: restFields.librarianId,
        },
      },
      location: restFields.location,
      phoneNo: restFields.phoneNo,
    },
  );

  return redirectWithSuccess("/admin/libraries", "Library updated successfully!");
};

interface LibraryWithLibrarian {
  id: string;
  name: string;
  location: string;
  phoneNo: string;
  email: string;
  librarian: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    libraryId: string | null;
  }>;
}

export default function EditLibrary() {
  const { librarians, libraryToEdit } = useLoaderData<{
    librarians: User[];
    libraryToEdit: LibraryWithLibrarian;
  }>();

  const fetcher = useFetcher<ActionData>();

  const isSubmitting = fetcher.state !== "idle";

  const librarianOptions = React.useMemo(() => {
    const options = librarians.map((librarian) => ({
      label: librarian.name,
      value: librarian.id,
    }));

    // Include the currently assigned librarian if it exists
    if (libraryToEdit.librarian && libraryToEdit.librarian.length > 0) {
      const currentLibrarian = libraryToEdit.librarian[0];
      const currentLibrarianOption = {
        label: currentLibrarian.name,
        value: currentLibrarian.id,
      };

      // Only add if not already in the options
      if (!options.some((opt) => opt.value === currentLibrarianOption.value)) {
        options.unshift(currentLibrarianOption);
      }
    }

    // Ensure we always have at least an empty option
    if (options.length === 0) {
      options.push({ label: "No librarians available", value: "" });
    }

    return options;
  }, [librarians, libraryToEdit.librarian]);

  return (
    <Page.Layout>
      <Page.Header title="Edit Library" />
      <div className="bg-gray-50 border-2 rounded-md w-[50vw] p-5">
        <fetcher.Form className="mx-auto flex flex-col gap-4" method="POST">
          <input defaultValue={libraryToEdit.id} hidden name="libraryId" />

          <TextInput
            data-autofocus
            defaultValue={libraryToEdit.name}
            error={fetcher.data?.fieldErrors?.name}
            label="Name"
            name="name"
            placeholder="Enter name"
            required
          />
          <Textarea
            defaultValue={libraryToEdit.location}
            error={fetcher.data?.fieldErrors?.location}
            label="Location"
            name="location"
            placeholder="Enter location"
            required
          />
          <TextInput
            defaultValue={libraryToEdit.phoneNo}
            error={fetcher.data?.fieldErrors?.phoneNo}
            label="Phone Number"
            name="phoneNo"
            placeholder="Enter phone number"
            required
          />

          <TextInput
            defaultValue={libraryToEdit.email}
            error={fetcher.data?.fieldErrors?.email}
            label="Email"
            name="email"
            placeholder="Enter email"
            required
            type="email"
          />

          <Select
            data={librarianOptions}
            defaultValue={libraryToEdit.librarian?.[0]?.id || ""}
            error={fetcher.data?.fieldErrors?.librarianId}
            label="Librarian"
            name="librarianId"
            placeholder="Select librarian"
            required
            searchable
          />

          <Divider className="mt-4" />

          <div className="flex items-center justify-end gap-4">
            <Link to="/admin/libraries">
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
