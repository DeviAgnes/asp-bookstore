import { Button, Divider, NumberInput, Select, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, Link, redirect, useFetcher, useLoaderData } from "@remix-run/react";
import { jsonWithError, redirectWithSuccess } from "remix-toast";
import { z } from "zod";
import { DetailField } from "~/components/details-field";
import { Page } from "~/components/page";
import { db } from "~/lib/prisma.server";
import { createBookSale, getBookById } from "~/lib/book.server";
import { requireUser } from "~/lib/session.server";
import { useAuth } from "~/utils/hooks/use-auth";
import { formatCurrency, paymentMethodToLabel } from "~/utils/misc";
import { badRequest } from "~/utils/misc.server";
import type { inferErrors } from "~/utils/validation";
import { validateAction } from "~/utils/validation";
import { PaymentMethod } from "@prisma/client";

const PurchaseBookSchema = z.object({
  bookId: z.string().trim().min(1, "Book ID is required"),
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
    return redirect("/books");
  }

  const bookToPurchase = await getBookById(id);
  if (!bookToPurchase) {
    return redirect("/books");
  }

  return json({
    bookToPurchase,
  });
};

interface ActionData {
  fieldErrors?: inferErrors<typeof PurchaseBookSchema>;
  success: boolean;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request);

  const { fieldErrors, fields } = await validateAction(request, PurchaseBookSchema);

  if (fieldErrors) {
    return badRequest({ fieldErrors, success: false });
  }

  const existingBook = await db.book.findFirst({
    where: { id: fields.bookId },
  });

  if (!existingBook) {
    return jsonWithError(
      {
        fieldErrors: {
          bookId: "Book not found",
        },
        success: false,
      },
      "Book not found",
    );
  }

  await createBookSale(
    {
      bookId: fields.bookId as string,
      paymentAmount: fields.paymentAmount as number,
      method: fields.paymentMethod as PaymentMethod,
    },
    user.id,
  );

  return redirectWithSuccess("/purchased-books", "Book purchased successfully!");
};

export default function PurchaseBook() {
  const { user } = useAuth();
  const { bookToPurchase } = useLoaderData<typeof loader>();

  const fetcher = useFetcher<ActionData>();

  const isSubmitting = fetcher.state !== "idle";

  return (
    <Page.Layout>
      <Page.Header title="Purchase Book" />
      <div className="grid grid-cols-2 gap-x-16 gap-y-8 bg-gray-50 p-5">
        <div className="flex flex-col gap-3">
          <Divider label="Book Details" labelPosition="left" mb={6} />

          <DetailField label="Title" value={bookToPurchase.title} />
          <DetailField label="Author" value={bookToPurchase.author} />
          <DetailField label="ISBN" value={bookToPurchase.isbn} />
        </div>

        <div>
          <fetcher.Form className="mx-auto flex flex-col gap-4" method="POST" id="purchase-form">
            <div className="flex flex-col gap-3">
              <Divider label="Payment Details" labelPosition="left" mb={6} />
              <DetailField
                label="Purchase Amount"
                value={formatCurrency(Number(bookToPurchase.purchaseAmount))}
              />
            </div>

            <input defaultValue={bookToPurchase.id} hidden name="bookId" />
            <input defaultValue={bookToPurchase.purchaseAmount} hidden name="paymentAmount" />

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
            <Link to="/books">
              <Button color="red" variant="subtle">
                Cancel
              </Button>
            </Link>
            <Button loading={isSubmitting} type="submit" form="purchase-form">
              Purchase
            </Button>
          </div>
        </div>
      </div>
    </Page.Layout>
  );
}
