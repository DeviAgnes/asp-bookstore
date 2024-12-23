import { AppShell, Avatar, Menu, ScrollArea, UnstyledButton } from "@mantine/core";
import { UserRole } from "@prisma/client";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { LayoutDashboardIcon, LogOutIcon, TicketCheckIcon } from "lucide-react";

import Logo from "~/components/logo";
import { SidebarNav } from "~/components/sidebar-nav-link";
import { requireUserId, validateUserRole } from "~/lib/session.server";
import { useAuth } from "~/utils/hooks/use-auth";
import { getInitials } from "~/utils/misc";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request);
  await validateUserRole(request, [UserRole.customer]);

  return json({});
};

function Sidebar() {
  const { user, signOut } = useAuth();

  return (
    <>
      <AppShell.Section className="min-h-16" p="md">
        <div className="flex h-full items-center justify-between">
          <Logo />
        </div>
      </AppShell.Section>

      <AppShell.Section component={ScrollArea} grow mb="sm" mt={36} offsetScrollbars p="md">
        <div className="flex flex-col gap-1">
          {/* <SidebarNav.Link
            end
            label="Overview"
            leftIcon={<LayoutDashboardIcon size={14} />}
            to="/"
          /> */}

          <SidebarNav.Group label="Explore" leftIcon={<LayoutDashboardIcon size={14} />}>
            <SidebarNav.Link end label="Books" to="/books" />
          </SidebarNav.Group>

          <SidebarNav.Group label="My Account" leftIcon={<TicketCheckIcon size={14} />}>
            <SidebarNav.Link end label="Purchased Books" to="/purchased-books" />
            <SidebarNav.Link end label="Rented Books" to="/rented-books" />
            <SidebarNav.Link end label="Invoices" to="/invoices" />
          </SidebarNav.Group>
        </div>
      </AppShell.Section>

      <div className="flex items-center justify-center mb-10">
        <Menu position="top" shadow="md" width={200}>
          <Menu.Target>
            <UnstyledButton>
              <Avatar color="blue" radius="xl">
                {getInitials(user.name)}
              </Avatar>
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>
              <p>{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </Menu.Label>

            <Menu.Divider />
            <Menu.Item leftSection={<LogOutIcon className="size-4" />} onClick={() => signOut()}>
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </>
  );
}

export default function AppLayout() {
  return (
    <div className="relative">
      <AppShell
        layout="alt"
        navbar={{
          width: 240,
          breakpoint: "md",
        }}
        /**
         * This `padding` props controls the padding of the `AppShell.Main` component.
         * @see https://mantine.dev/core/app-shell/#padding-prop
         */
        padding={0}
        withBorder={false}
      >
        <AppShell.Navbar className="bg-transparent" pt={0} withBorder>
          <Sidebar />
        </AppShell.Navbar>

        <AppShell.Main>
          <div className="px-10 pt-8">
            <Outlet />
          </div>
        </AppShell.Main>
      </AppShell>
    </div>
  );
}
