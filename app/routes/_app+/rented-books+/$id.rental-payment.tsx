import { Button, Divider, NumberInput, Select, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { PaymentMethod } from "@prisma/client";
import { type ActionFunctionArgs, type LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { jsonWithError, redirectWithSuccess } from "remix-toast";
import { z } from "zod";
import { DetailField } from "~/components/details-field";
import { Page } from "~/components/page";
import { getUserById } from "~/lib/auth.server";
import { type GetRentedBooksByUserId, returnRentedBook } from "~/lib/book.server";
import type { GetConfig } from "~/lib/config.server";
import { db } from "~/lib/prisma.server";
import { requireUserId } from "~/lib/session.server";
import { useAuth } from "~/utils/hooks/use-auth";
import { useConfig } from "~/utils/hooks/use-config";
import { formatCurrency, paymentMethodToLabel } from "~/utils/misc";
import { badRequest } from "~/utils/misc.server";
import type { DateToString } from "~/utils/types";
import { type inferErrors, validateAction } from "~/utils/validation";

const RentalPaymentSchema = z.object({
  rentalId: z.string().trim().min(1, "Booking ID is required"),
  nameOnCard: z.string().trim().min(1, "Name on card is required"),
  cardNumber: z.string().regex(/^[0-9]{16}$/, "Card number is invalid"),
  expirationDate: z.string().trim().min(1, "Expiration date is required"),
  cvv: z.string().regex(/^[0-9]{3,4}$/, "CVV should be either 3 or 4 digits"),
  paymentMethod: z.nativeEnum(PaymentMethod, {
    errorMap: () => ({
      message: "Please select a payment method",
    }),
  }),
  paymentAmount: z.preprocess(Number, z.number().min(0, "Payment amount must be greater than 0")),
});

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { id } = params;
  if (!id) {
    return redirect("/rented-books");
  }

  const rental = await db.rentedBook.findFirst({
    where: { id },
    include: {
      book: true,
      payment: true,
    },
  });

  if (!rental) {
    return redirect("/rented-books");
  }

  return json({
    rental,
  });
};

interface ActionData {
  fieldErrors?: inferErrors<typeof RentalPaymentSchema>;
  success: boolean;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { fieldErrors, fields } = await validateAction(request, RentalPaymentSchema);
  const userId = await requireUserId(request);

  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (fieldErrors) {
    return badRequest({ fieldErrors, success: false });
  }

  const existingRental = await db.rentedBook.findFirst({
    where: { id: fields.rentalId },
  });

  if (!existingRental) {
    return jsonWithError(
      {
        success: false,
      },
      "rental booking not found",
    );
  }

  await returnRentedBook(existingRental.id, {
    paymentAmount: fields.paymentAmount as number,
    method: fields.paymentMethod as PaymentMethod,
  });

  return redirectWithSuccess("/rented-books", "Payment successful!");
};

export default function RentalPayment() {
  const { user } = useAuth();
  const { rental } = useLoaderData<typeof loader>();
  const bookingsCount = 1;

  const config = useConfig();
  const amount = calculateRentalAmount(rental, config, bookingsCount);

  const fetcher = useFetcher<ActionData>();

  const isSubmitting = fetcher.state !== "idle";

  return (
    <Page.Layout>
      <Page.Header title="Rental Payment" />
      <div className="grid grid-cols-2 gap-x-16 gap-y-8 bg-gray-50 p-5">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <Divider label="Book Details" labelPosition="left" mb={6} />

            <DetailField label="Title" value={rental.book!.title} />
            <DetailField label="Author" value={rental.book!.author} />
            <DetailField label="ISBN" value={rental.book!.isbn} />
          </div>

          <div className="flex flex-col gap-3">
            <Divider label="Payment Details" labelPosition="left" mb={6} />

            <DetailField label="Free Rental Days" value={amount.freeRentalDays} />

            {amount.till60DaysCost > 0 ? (
              <DetailField
                label="Till 60 Days Cost"
                value={formatCurrency(amount.till60DaysCost)}
              />
            ) : null}

            {amount.moreThan60DaysCost > 0 ? (
              <DetailField
                label="More than 60 Days Cost"
                value={formatCurrency(amount.moreThan60DaysCost)}
              />
            ) : null}

            {Number(amount.totalAmount) > 0 && bookingsCount > 0 ? (
              <DetailField
                label="Combined Discount"
                value={formatCurrency(Number(amount.totalAmount) * 0.1)}
              />
            ) : null}

            <Divider />
            <DetailField label="Total" value={formatCurrency(Number(amount.totalAmount))} />
          </div>
        </div>

        <div>
          <fetcher.Form
            className="mx-auto flex flex-col gap-4"
            method="POST"
            id="rental-payment-form"
          >
            <input defaultValue={rental.id} hidden name="rentalId" />

            <div className="flex flex-col gap-3">
              <Divider label="Payment Details" labelPosition="left" mb={6} />
              <DetailField
                label="Total Amount"
                value={formatCurrency(Number(amount.totalAmount))}
              />
            </div>

            <input defaultValue={amount.totalAmount} hidden name="paymentAmount" />

            <TextInput
              data-autofocus
              defaultValue={user.name}
              error={fetcher.data?.fieldErrors?.nameOnCard}
              label="Name on card"
              name="nameOnCard"
              placeholder="Enter name on card"
              required
              withAsterisk={false}
            />

            <NumberInput
              defaultValue={4321432143214321}
              error={fetcher.data?.fieldErrors?.cardNumber}
              hideControls
              label="Card number"
              name="cardNumber"
              placeholder="Enter card number"
              required
              withAsterisk={false}
            />

            <Select
              data={Object.values(PaymentMethod).map((method) => ({
                label: paymentMethodToLabel[method as PaymentMethod],
                value: method,
              }))}
              defaultValue={PaymentMethod.credit_card}
              error={fetcher.data?.fieldErrors?.paymentMethod}
              label="Payment method"
              name="paymentMethod"
              placeholder="Select a payment method"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                defaultValue={123}
                error={fetcher.data?.fieldErrors?.cvv}
                hideControls
                label="CVV"
                name="cvv"
                placeholder="Enter CVV"
                required
                withAsterisk={false}
              />

              <DatePickerInput
                defaultValue={new Date("2029-12-31")}
                error={fetcher.data?.fieldErrors?.expirationDate}
                label="Expiration date"
                minDate={new Date()}
                name="expirationDate"
                placeholder="Pick date"
                valueFormat="MM/YY"
              />
            </div>
          </fetcher.Form>
        </div>

        <div className="col-span-2 flex flex-col gap-4">
          <Divider />

          <div className="flex items-center justify-end gap-4">
            <Link to="/rented-books">
              <Button color="red" variant="subtle">
                Cancel
              </Button>
            </Link>
            <Button loading={isSubmitting} type="submit" form="rental-payment-form">
              Return
            </Button>
          </div>
        </div>
      </div>
    </Page.Layout>
  );
}

const calculateRentalAmount = (
  booking: DateToString<GetRentedBooksByUserId[number]>,
  config: GetConfig,
  bookingsCount: number,
) => {
  const { createdAt, returnDate, book } = booking;
  const _createdAt = new Date(createdAt);
  const _returnDate = returnDate ? new Date(returnDate) : new Date();

  const rentalDays = Math.ceil((_returnDate.getTime() - _createdAt.getTime()) / (1000 * 3600 * 24));

  const freeRentalDays = Math.min(rentalDays, 30);
  const till60DaysCost =
    Math.min(Math.max(rentalDays - 30, 0), 30) * Number(config.amountTill60DaysPricePerDay);
  const moreThan60DaysCost =
    Math.max(rentalDays - 60, 0) * Number(config.moreThan60DaysPricePerDay);
  const after100DaysCost = rentalDays > 100 ? book!.purchaseAmount : 0;

  let totalAmount =
    Number(after100DaysCost) > 0 ? after100DaysCost : till60DaysCost + moreThan60DaysCost;

  totalAmount = bookingsCount > 0 ? Number(totalAmount) * 0.9 : totalAmount;

  return {
    freeRentalDays,
    till60DaysCost,
    moreThan60DaysCost,
    totalAmount,
  };
};
