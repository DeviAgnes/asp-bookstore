import { AppShell, Avatar, Menu, ScrollArea, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { UserRole } from "@prisma/client";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { FolderKanbanIcon, LogOutIcon, SettingsIcon } from "lucide-react";
import Logo from "~/components/logo";
import { SidebarNav } from "~/components/sidebar-nav-link";
import { requireUserId, validateUserRole } from "~/lib/session.server";
import { RentalConfigModal } from "~/routes/resources+/rental-config";
import { useAuth } from "~/utils/hooks/use-auth";
import { getInitials } from "~/utils/misc";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request);
  await validateUserRole(request, [UserRole.admin]);

  return json({});
};

function Sidebar() {
  const { user, signOut } = useAuth();
  const [isConfigModalOpen, { close: closeConfigModal, open: openConfigModal }] =
    useDisclosure(false);

  return (
    <>
      <AppShell.Section className="min-h-16" p="md">
        <div className="flex h-full items-center justify-between">
          <Logo />
        </div>
      </AppShell.Section>

      <AppShell.Section component={ScrollArea} grow mb="sm" mt={36} offsetScrollbars p="md">
        <div className="flex flex-col gap-1">
          <SidebarNav.Button
            label="Rental Config"
            leftIcon={<SettingsIcon size={14} />}
            onClick={() => openConfigModal()}
          />

          <SidebarNav.Group label="Manage" leftIcon={<FolderKanbanIcon size={14} />}>
            <SidebarNav.Link end label="Books" to="/admin/books" />
            <SidebarNav.Link end label="Genres" to="/admin/genre" />
            <SidebarNav.Link end label="Libraries" to="/admin/libraries" />
            <SidebarNav.Link end label="Librarians" to="/admin/librarians" />
            <SidebarNav.Link end label="Rented Books" to="/admin/rented-books" />
            <SidebarNav.Link end label="Purchased Books" to="/admin/purchased-books" />
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

      {/* <AppShell.Section>
        <div className="flex h-full items-center p-4">Navbar footer</div>
      </AppShell.Section> */}

      <RentalConfigModal onClose={closeConfigModal} open={isConfigModalOpen} />
    </>
  );
}

export default function AdminLayout() {
  // const pinned = useHeadroom({ fixedAt: 64 })

  return (
    <div className="relative">
      <AppShell
        // header={{ height: 64, offset: true }}
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

        {/* <AppShell.Header
          className={cn('bg-transparent', pinned ? '' : 'border-b  shadow')}
        >
          <Group h="100%" px="lg">
            <p className="text-sm font-semibold">Dashboard</p>
          </Group>
        </AppShell.Header> */}

        <AppShell.Main>
          <div className="px-10 pt-8">
            <Outlet />
          </div>
        </AppShell.Main>
      </AppShell>
    </div>
  );
}
