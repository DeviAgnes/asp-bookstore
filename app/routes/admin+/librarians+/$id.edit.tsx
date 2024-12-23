import { Button, Divider, PasswordInput, TextInput } from "@mantine/core";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, Link, redirect, useFetcher, useLoaderData } from "@remix-run/react";
import * as React from "react";
import { jsonWithError, redirectWithSuccess } from "remix-toast";
import { Page } from "~/components/page";
import { db } from "~/lib/prisma.server";
import { getLibrarianById } from "~/lib/librarian.server";
import { badRequest, createPasswordHash } from "~/utils/misc.server";
import type { inferErrors } from "~/utils/validation";
import { validateAction } from "~/utils/validation";
import { EditLibrarianSchema } from "~/utils/zod.schema";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { id } = params;
  if (!id) {
    return redirect("/admin/librarians");
  }

  const librarianToEdit = await getLibrarianById(id);

  if (!librarianToEdit) {
    return redirect("/admin/librarians");
  }

  return json({
    librarianToEdit,
  });
};

export interface ActionData {
  fieldErrors?: inferErrors<typeof EditLibrarianSchema>;
  success: boolean;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { fieldErrors, fields } = await validateAction(request, EditLibrarianSchema);

  if (fieldErrors) {
    return badRequest({ fieldErrors, success: false });
  }

  const { librarianId, password, confirmPassword, ...restFields } = fields;

  const existingLibrarian = await db.user.findFirst({
    where: { id: librarianId },
  });

  if (!existingLibrarian) {
    return jsonWithError(
      {
        fieldErrors: {
          libraryId: "Librarian not found",
        },
        success: false,
      },
      "Librarian not found!",
    );
  }

  const updateData: {
    name: string;
    email: string;
    password?: string;
  } = {
    name: restFields.name,
    email: restFields.email,
  };

  if (password) {
    updateData.password = await createPasswordHash(password);
  }

  await db.user.update({
    where: { id: librarianId },
    data: updateData,
  });

  return redirectWithSuccess("/admin/librarians", "Librarian updated successfully!");
};

export default function EditLibrarian() {
  const { librarianToEdit } = useLoaderData<typeof loader>();

  const fetcher = useFetcher<ActionData>();

  const isSubmitting = fetcher.state !== "idle";

  const [isPasswordSet, setIsPasswordSet] = React.useState(false);

  return (
    <Page.Layout>
      <Page.Header title="Edit Librarian" />
      <div className="bg-gray-50 border-2 rounded-md w-[50vw] p-5">
        <fetcher.Form className="mx-auto flex flex-col gap-4" method="POST">
          <input defaultValue={librarianToEdit.id} hidden name="librarianId" />

          <TextInput
            data-autofocus
            defaultValue={librarianToEdit.name}
            error={fetcher.data?.fieldErrors?.name}
            label="Name"
            name="name"
            placeholder="Enter name"
            required
          />
          <TextInput
            defaultValue={librarianToEdit.email}
            error={fetcher.data?.fieldErrors?.email}
            label="Email"
            name="email"
            placeholder="Enter email"
            type="email"
            required
          />

          <PasswordInput
            error={fetcher.data?.fieldErrors?.password}
            label="New Password"
            name="password"
            placeholder="Leave blank to keep the same"
            onChange={(e) => setIsPasswordSet(!!e.currentTarget.value)}
          />

          {isPasswordSet && (
            <PasswordInput
              error={fetcher.data?.fieldErrors?.confirmPassword}
              label="Confirm New Password"
              name="confirmPassword"
            />
          )}

          <Divider className="mt-4" />

          <div className="flex items-center justify-end gap-4">
            <Link to="/admin/librarians">
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
