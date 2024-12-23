import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider>
      <Toaster
        closeButton
        duration={3000}
        position="bottom-center"
        richColors
        theme="light"
        visibleToasts={3}
      />
      <ModalsProvider>{children}</ModalsProvider>
    </MantineProvider>
  );
}
