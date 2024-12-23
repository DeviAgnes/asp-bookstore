import type { LoaderFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

import { validateUserRole } from "~/lib/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  await validateUserRole(request, null);
  return null;
};

export default function AuthLayout() {
  return (
    <div className="relative grid h-screen w-full ">
      <div className="relative h-full bg-gradient-to-b from-blue-900 via-zinc-50 via-90% to-white">
        <div className="flex h-full items-center justify-center px-12 py-20">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
