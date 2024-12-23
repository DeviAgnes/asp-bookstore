import { NavLink as MantineNavLink, UnstyledButton } from "@mantine/core";
import { NavLink } from "@remix-run/react";

function SidebarNavLink({
  end,
  children,
  to,
  label,
  leftIcon,

  description,
}: {
  children?: React.ReactNode;
  description?: string;
  end?: boolean;
  label: string;
  leftIcon?: React.ReactNode;
  to: string;
}) {
  return (
    <NavLink end={end} to={to}>
      {({ isActive }) => (
        <MantineNavLink
          active={isActive}
          childrenOffset={28}
          classNames={{
            root: "py-1 rounded-md",
          }}
          component="div"
          description={description}
          label={label}
          leftSection={leftIcon}
          variant="light"
        >
          {children}
        </MantineNavLink>
      )}
    </NavLink>
  );
}
function SidebarNavButton({
  label,
  onClick,
  children,
  leftIcon,
  description,
}: {
  children?: React.ReactNode;
  description?: string;
  label: string;
  leftIcon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <MantineNavLink
      classNames={{
        root: "py-1 rounded-md",
      }}
      component={UnstyledButton}
      description={description}
      label={label}
      leftSection={leftIcon}
      onClick={onClick}
      variant="light"
    >
      {children}
    </MantineNavLink>
  );
}

function NavLinkGroup({
  children,
  label,
  leftIcon,
  defaultOpened = true,
  description,
}: {
  children?: React.ReactNode;
  defaultOpened?: boolean;
  description?: string;
  label: string;
  leftIcon?: React.ReactNode;
}) {
  return (
    <MantineNavLink
      childrenOffset={28}
      classNames={{
        root: "py-1 rounded-md",
      }}
      component="div"
      defaultOpened={defaultOpened}
      description={description}
      label={label}
      leftSection={leftIcon}
      variant="light"
    >
      {children}
    </MantineNavLink>
  );
}

export const SidebarNav = {
  Group: NavLinkGroup,
  Link: SidebarNavLink,
  Button: SidebarNavButton,
};
