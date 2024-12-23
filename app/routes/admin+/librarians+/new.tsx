import { Button, Divider, PasswordInput, TextInput } from "@mantine/core";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Link, useFetcher } from "@remix-run/react";
import { redirectWithSuccess } from "remix-toast";
import { Page } from "~/components/page";
import { db } from "~/lib/prisma.server";
import { UserRole } from "@prisma/client";
import { badRequest } from "~/utils/misc.server";
import type { inferErrors } from "~/utils/validation";
import { validateAction } from "~/utils/validation";
import { CreateLibrarianSchema } from "~/utils/zod.schema";

export interface ActionData {
  fieldErrors?: inferErrors<typeof CreateLibrarianSchema>;
  success: boolean;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { fieldErrors, fields } = await validateAction(request, CreateLibrarianSchema);

  if (fieldErrors) {
    return badRequest({ fieldErrors, success: false });
  }

  const { confirmPassword, ...userData } = fields;

  await db.user.create({
    data: {
      ...userData,
      role: UserRole.librarian,
      status: "active",
    },
  });

  return redirectWithSuccess("/admin/librarians", "Librarian created successfully!");
};

export default function NewLibrary() {
  const fetcher = useFetcher<ActionData>();

  const isSubmitting = fetcher.state !== "idle";

  return (
    <Page.Layout>
      <Page.Header title="New Librarian" />
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
          <TextInput
            error={fetcher.data?.fieldErrors?.email}
            label="Email"
            name="email"
            placeholder="Enter email"
            type="email"
            required
          />

          <PasswordInput
            error={fetcher.data?.fieldErrors?.password}
            label="Password"
            name="password"
            placeholder="Enter password"
            required
          />

          <PasswordInput
            error={fetcher.data?.fieldErrors?.confirmPassword}
            label="Confirm Password"
            name="confirmPassword"
            placeholder="Enter password"
            required
          />

          <Divider className="mt-4" />

          <div className="flex items-center justify-end gap-4">
            <Link to="/admin/librarians">
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
