import { Button, Divider, Modal, NumberInput, ScrollArea } from "@mantine/core";
import type { ActionFunctionArgs } from "@remix-run/node";
import { DollarSignIcon } from "lucide-react";
import { jsonWithSuccess } from "remix-toast";
import { z } from "zod";
import { DetailField } from "~/components/details-field";
import { db } from "~/lib/prisma.server";
import { getConfig } from "~/lib/config.server";
import { useCallbackOnRouteChange } from "~/utils/hooks/use-callback-on-route-change";
import { useConfig } from "~/utils/hooks/use-config";
import { useFetcherCallback } from "~/utils/hooks/use-fetcher-callback";
import { formatCurrency } from "~/utils/misc";
import { badRequest } from "~/utils/misc.server";
import type { inferErrors } from "~/utils/validation";
import { validateAction } from "~/utils/validation";

const RENTAL_CONFIG_ROUTE = "/resources/rental-config";
const RENTAL_CONFIG_FORM_ID = "rental-config-form";

const RentalConfigSchema = z.object({
  amountTill60DaysPricePerDay: z.preprocess(
    Number,
    z.number().min(0, "Amount till 60 days price per day must be greater than 0"),
  ),
  moreThan60DaysPricePerDay: z.preprocess(
    Number,
    z.number().min(0, "More than 60 days price per day must be greater than 0"),
  ),
});

export interface ActionData {
  fieldErrors?: inferErrors<typeof RentalConfigSchema>;
  success: boolean;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { fieldErrors, fields } = await validateAction(request, RentalConfigSchema);

  if (fieldErrors) {
    return badRequest({ fieldErrors, success: false });
  }

  const _config = await getConfig();

  await db.config.update({
    where: { id: _config.id },
    data: {
      amountTill60DaysPricePerDay: fields.amountTill60DaysPricePerDay,
      moreThan60DaysPricePerDay: fields.moreThan60DaysPricePerDay,
    },
  });

  return jsonWithSuccess(
    {
      success: true,
    },
    "Config updated successfully!",
  );
};

interface Props {
  onClose: () => void;
  open: boolean;
}

export const RentalConfigModal = ({ open, onClose }: Props) => {
  const config = useConfig();

  const fetcher = useFetcherCallback<ActionData>({
    onSuccess: () => onClose(),
  });

  useCallbackOnRouteChange(() => onClose());

  return (
    <>
      <Modal
        closeOnClickOutside={false}
        onClose={() => onClose()}
        opened={open}
        padding="lg"
        scrollAreaComponent={ScrollArea.Autosize}
        size="60%"
        title="Rental Config"
      >
        <div className="grid grid-cols-7 gap-x-20 gap-y-8">
          <div className="col-span-2 flex flex-col gap-10">
            <div className="flex flex-col gap-2">
              <Divider label="Current Config" labelPosition="left" mb={6} />

              <DetailField
                label="Amount Till 60 Days"
                orientation="vertical"
                value={`${formatCurrency(Number(config.amountTill60DaysPricePerDay))} / day`}
              />
              <DetailField
                label="More than 60 Days"
                orientation="vertical"
                value={`${formatCurrency(Number(config.moreThan60DaysPricePerDay))} / day`}
              />
            </div>
          </div>

          <div className="col-span-5">
            <Divider label="Update Config" labelPosition="left" mb={6} />

            <fetcher.Form
              action={RENTAL_CONFIG_ROUTE}
              className="grid grid-cols-2 gap-4"
              id={RENTAL_CONFIG_FORM_ID}
              method="POST"
            >
              <NumberInput
                decimalScale={2}
                defaultValue={Number(config.amountTill60DaysPricePerDay)}
                error={fetcher.data?.fieldErrors?.amountTill60DaysPricePerDay}
                fixedDecimalScale
                hideControls
                label="Amount from 30-60 days price per day"
                leftSection={<DollarSignIcon className="size-4" />}
                leftSectionPointerEvents="none"
                min={0}
                name="amountTill60DaysPricePerDay"
                placeholder="Enter amount till 60 days price per day"
                required
                size="sm"
              />

              <NumberInput
                decimalScale={2}
                defaultValue={Number(config.moreThan60DaysPricePerDay)}
                error={fetcher.data?.fieldErrors?.moreThan60DaysPricePerDay}
                fixedDecimalScale
                hideControls
                label="More than 60 days price per day"
                leftSection={<DollarSignIcon className="size-4" />}
                leftSectionPointerEvents="none"
                min={0}
                name="moreThan60DaysPricePerDay"
                placeholder="Enter more than 60 days price per day"
                required
                size="sm"
              />
            </fetcher.Form>
          </div>

          <div className="col-span-full flex flex-col gap-4">
            <Divider />

            <div className="flex items-center justify-end gap-4">
              <Button color="red" onClick={() => onClose()} variant="subtle">
                Cancel
              </Button>
              <Button form={RENTAL_CONFIG_FORM_ID} loading={fetcher.isPending} type="submit">
                Update
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
