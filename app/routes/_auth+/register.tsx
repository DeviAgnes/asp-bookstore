import { Button, Card, Divider, PasswordInput, TextInput } from "@mantine/core";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { ChevronRight } from "lucide-react";
import { z } from "zod";
import Logo from "~/components/logo";
import { db } from "~/lib/prisma.server";
import { UserRole } from "@prisma/client";
import { createUserSession } from "~/lib/session.server";
import { createHash } from "~/utils/encryption";
import { useIsPending } from "~/utils/hooks/use-is-pending";
import { badRequest, safeRedirect } from "~/utils/misc.server";
import { type inferErrors, validateAction } from "~/utils/validation";
import { emailSchema, passwordSchema } from "~/utils/zod.schema";

const RegisterSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
    role: z
      .nativeEnum(UserRole, {
        errorMap: () => ({
          message: "Select a role",
        }),
      })
      .default(UserRole.customer),
    redirectTo: z.string().trim().default("/"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      return ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword", "password"],
      });
    }
  });

interface ActionData {
  fieldErrors?: inferErrors<typeof RegisterSchema>;
}

export type SearchParams = {
  redirectTo?: string;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { fieldErrors, fields } = await validateAction(request, RegisterSchema);

  if (fieldErrors) {
    return badRequest<ActionData>({ fieldErrors });
  }

  const { email, password, redirectTo, name, role } = fields;

  const existingUser = await db.user.count({
    where: { email },
  });

  if (existingUser > 0) {
    return badRequest<ActionData>({
      fieldErrors: {
        email: "Email already exists",
      },
    });
  }

  const insertedUser = await db.user.create({
    data: {
      email,
      name,
      password: await createHash(password as string),
      role,
    },
  });

  return createUserSession({
    redirectTo: safeRedirect(redirectTo),
    request,
    role: insertedUser.role,
    userId: insertedUser.id,
  });
};

export default function Register() {
  const actionData = useActionData<ActionData>();
  const isPending = useIsPending();

  return (
    <div className="flex flex-col items-center gap-4">
      <Card className="w-96 bg-gray-100" padding="xl" radius="lg" shadow="xl" withBorder>
        <Card.Section className="bg-white" inheritPadding pb="sm" pt="xl">
          <div className="mb-4 flex items-center justify-center">
            <Logo />
          </div>

          <h2 className="text-center text-xl font-bold text-gray-900">Welcome</h2>
          <p className="text-center text-sm text-gray-600">Create an account</p>
        </Card.Section>

        <Card.Section className="bg-white" inheritPadding pt="md" withBorder={false}>
          <Divider />
        </Card.Section>

        <Card.Section className="rounded-b-xl bg-white" inheritPadding pb="xl" withBorder>
          <Form className="mt-8" method="post">
            <fieldset className="flex flex-col gap-4" disabled={isPending}>
              <TextInput
                autoComplete="given-name"
                autoFocus
                error={actionData?.fieldErrors?.name}
                label="Name"
                name="name"
                placeholder="Name"
                required
                withAsterisk={false}
              />

              <TextInput
                autoComplete="email"
                error={actionData?.fieldErrors?.email}
                label="Email address"
                name="email"
                placeholder="Email address"
                required
                type="email"
                withAsterisk={false}
              />

              <PasswordInput
                autoComplete="current-password"
                error={actionData?.fieldErrors?.password}
                label="Password"
                name="password"
                placeholder="Password"
                required
                withAsterisk={false}
              />

              <PasswordInput
                autoComplete="current-password"
                error={actionData?.fieldErrors?.confirmPassword}
                label="Confirm password"
                name="confirmPassword"
                placeholder="Confirm password"
                required
                withAsterisk={false}
              />

              <Button className="mt-2" loading={isPending} type="submit">
                Create Account <ChevronRight className="ml-2" size={14} />
              </Button>
            </fieldset>
          </Form>

          <div className="mt-4 text-sm">
            Already have an account?{" "}
            <Link className=" text-blue-600 hover:underline" to="/login">
              Login
            </Link>
          </div>
        </Card.Section>

        <Card.Section className="" inheritPadding py="sm">
          <div className="flex items-center justify-center gap-2">
            <p className="text-xsm font-medium text-gray-900">Secured by</p>
            <span className="text-xsm font-bold">BSMS</span>
          </div>
        </Card.Section>
      </Card>
    </div>
  );
}
