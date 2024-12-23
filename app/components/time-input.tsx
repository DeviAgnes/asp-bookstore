import * as React from "react";

import { ActionIcon } from "@mantine/core";
import { TimeInput as MantineTimeInput } from "@mantine/dates";
import { ClockIcon } from "lucide-react";

type TimeInputProps = Omit<React.ComponentProps<typeof MantineTimeInput>, "ref" | "rightSection">;

export const TimeInput = (props: TimeInputProps) => {
  const ref = React.useRef<HTMLInputElement>(null);

  const pickerControl = (
    <ActionIcon color="gray" onClick={() => ref.current?.showPicker()} variant="subtle">
      <ClockIcon size={16} />
    </ActionIcon>
  );

  return <MantineTimeInput ref={ref} rightSection={pickerControl} {...props} />;
};
