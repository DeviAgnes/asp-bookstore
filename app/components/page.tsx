import { ActionIcon } from "@mantine/core";
import { Link } from "@remix-run/react";
import { ArrowLeftIcon } from "lucide-react";

import { cn } from "~/utils/misc";

function BackButton({ href }: { href: string }) {
  return (
    <ActionIcon color="dark" component={Link} to={href} variant="subtle">
      <ArrowLeftIcon size={16} />
    </ActionIcon>
  );
}

function Layout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col gap-20", className)}>{children}</div>;
}

type PageHeaderProps = {
  action?: React.ReactNode;
  backButtonHref?: string;
} & (
  | {
      children: React.ReactNode;
      icon?: never;
      title?: never;
    }
  | {
      children?: never;
      icon?: React.ReactNode;
      title: string;
    }
);

function Header(props: PageHeaderProps): React.ReactElement {
  const { action, backButtonHref } = props;

  return (
    <div className="min-h-header z-20 flex items-center justify-between pl-0 pr-3">
      <div className="flex w-full items-center gap-1.5">
        <div
          className={cn(
            "flex flex-1 flex-row items-center gap-4 pl-1.5",
            backButtonHref ? "pl-0" : "",
          )}
        >
          {backButtonHref ? <BackButton href={backButtonHref} /> : null}

          {props.children ?? (
            <div className=" flex w-full items-center gap-2">
              {props.icon}

              <p className="flex max-w-[50%] truncate text-xl font-semibold text-gray-900">
                {props.title}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="inline-flex gap-2">{action}</div>
    </div>
  );
}

export const Page = {
  Header: Header,
  Layout: Layout,
};
