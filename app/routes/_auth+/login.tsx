import { Button, Card, Divider, PasswordInput, Switch, TextInput } from "@mantine/core";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { ChevronRight } from "lucide-react";
import { z } from "zod";

import Logo from "~/components/logo";
import { verifyLogin } from "~/lib/auth.server";
import { createUserSession } from "~/lib/session.server";
import { useIsPending } from "~/utils/hooks/use-is-pending";
import { badRequest, safeRedirect } from "~/utils/misc.server";
import { type inferErrors, validateAction } from "~/utils/validation";

const LoginSchema = z.object({
  email: z.string().trim().min(3, "Name is required"),
  password: z.string().min(1, "Password is required"),
  redirectTo: z.string().trim().default("/"),
  remember: z.enum(["on"]).optional(),
});

interface ActionData {
  fieldErrors?: inferErrors<typeof LoginSchema>;
}

export type SearchParams = {
  redirectTo?: string;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { fieldErrors, fields } = await validateAction(request, LoginSchema);

  if (fieldErrors) {
    return badRequest<ActionData>({ fieldErrors });
  }

  const { email, password, redirectTo, remember } = fields;

  const user = await verifyLogin(email, password);
  if (!user) {
    return badRequest<ActionData>({
      fieldErrors: {
        password: "Invalid username or password",
      },
    });
  }

  return createUserSession({
    redirectTo: safeRedirect(redirectTo),
    // biome-ignore lint/complexity/noUselessTernary: <explanation>
    remember: remember === "on" ? true : false,
    request,
    role: user.role,
    userId: user.id,
  });
};

export default function Login() {
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
          <p className="text-center text-sm text-gray-600">Please sign in to your account.</p>
        </Card.Section>

        <Card.Section className="bg-white" inheritPadding pt="md" withBorder={false}>
          <Divider />
        </Card.Section>

        <Card.Section className="rounded-b-xl bg-white" inheritPadding pb="xl" withBorder>
          <Form className="mt-8" method="post">
            <fieldset className="flex flex-col gap-4" disabled={isPending}>
              <TextInput
                autoComplete="email"
                autoFocus
                error={actionData?.fieldErrors?.email}
                label="Email address"
                name="email"
                required
                type="email"
                withAsterisk={false}
              />

              <PasswordInput
                autoComplete="current-password"
                error={actionData?.fieldErrors?.password}
                label="Password"
                name="password"
                required
                withAsterisk={false}
              />

              <div className="flex items-center gap-2">
                <Switch
                  id="rememberMe"
                  label="Remember me"
                  labelPosition="left"
                  name="rememberMe"
                />
              </div>

              <Button className="mt-2" loading={isPending} type="submit">
                Continue <ChevronRight className="ml-2" size={14} />
              </Button>
            </fieldset>
          </Form>
          <div className="mt-4 text-sm">
            Don't have an account?{" "}
            <Link className=" text-blue-600 hover:underline" to="/register">
              Register
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
