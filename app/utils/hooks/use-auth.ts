import { UserRole } from "@prisma/client";
import { useSubmit } from "@remix-run/react";

import { useRootData } from "~/utils/hooks/use-root-data";

export function useUser() {
  const { user } = useRootData();

  if (!user) {
    throw new Error("No user found");
  }

  return user;
}

export const useAuth = () => {
  const submit = useSubmit();
  const user = useUser();

  const isCustomer = user.role === UserRole.customer;
  const isLibrarian = user.role === UserRole.librarian;
  const isAdmin = user.role === UserRole.admin;

  const signOut = () => {
    return submit(null, {
      action: "/logout",
      method: "POST",
      navigate: false,
    });
  };

  return { signOut, user, isStudent: isCustomer, isFaculty: isLibrarian, isAdmin };
};
