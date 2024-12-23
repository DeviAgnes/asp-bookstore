import { Divider, Modal, ScrollArea } from "@mantine/core";
import { match } from "ts-pattern";
import { DetailField } from "~/components/details-field";
import type { GetPaymentsByUserId } from "~/lib/payment.server";

import { useCallbackOnRouteChange } from "~/utils/hooks/use-callback-on-route-change";
import { formatCurrency, formatDate, paymentMethodToLabel } from "~/utils/misc";
import type { DateToString } from "~/utils/types";

type Payment = GetPaymentsByUserId[number];

interface Prop {
  onClose: () => void;
  open: boolean;
  payment: Payment;
}

export const ViewInvoiceModal = ({ open, onClose, payment }: Prop) => {
  const invoice = getInvoiceDetails(payment);

  useCallbackOnRouteChange(() => onClose());

  return (
    <>
      <Modal
        closeOnClickOutside={false}
        onClose={() => onClose()}
        opened={open}
        scrollAreaComponent={ScrollArea.Autosize}
        size="md"
        padding="xl"
        radius="md"
        title="Invoice"
      >
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <Divider label="Payment Details" labelPosition="left" mb={6} />
            <DetailField label="Amount" value={formatCurrency(Number(payment.amount))} />
            <DetailField label="Payment Date" value={formatDate(payment.createdAt)} />
            <DetailField label="Type" value={payment.type} />
            <DetailField label="Method" value={paymentMethodToLabel[payment.paymentMethod]} />
          </div>

          <InvoiceDetails invoice={invoice} />
        </div>
      </Modal>
    </>
  );
};

const INVOICE_TYPES = {
  bookSale: "Book Sale",
  computerLabBooking: "Computer Lab Booking",
  studyRoomBooking: "Study Room Booking",
  rentalBook: "Rental Book",
} as const;

type InvoiceResult =
  | {
      type: (typeof INVOICE_TYPES)["bookSale"];
      data: NonNullable<DateToString<Payment["bookSale"]>>;
    }
  | {
      type: (typeof INVOICE_TYPES)["rentalBook"];
      data: NonNullable<DateToString<Payment["rentalBook"]>>;
    };

const getInvoiceDetails = (payment: Payment): InvoiceResult => {
  if (payment.bookSale) {
    return {
      type: INVOICE_TYPES.bookSale,
      data: payment.bookSale,
    };
  }
  if (payment.rentalBook) {
    return {
      type: INVOICE_TYPES.rentalBook,
      data: payment.rentalBook,
    };
  }

  throw new Error("Invalid payment type");
};

const BookSaleDetails = ({
  data,
}: {
  data: NonNullable<DateToString<Payment["bookSale"]>>;
}) => {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Divider label="Book Details" labelPosition="left" mb={6} />
        <DetailField label="Title" value={data.book!.title} />
        <DetailField label="Author" value={data.book!.author} />
        <DetailField label="ISBN" value={data.book!.isbn} />
      </div>
    </>
  );
};

const RentalBookDetails = ({
  data,
}: {
  data: NonNullable<DateToString<Payment["rentalBook"]>>;
}) => {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Divider label="Book Details" labelPosition="left" mb={6} />
        <DetailField label="Title" value={data.book!.title} />
        <DetailField label="Author" value={data.book!.author} />
        <DetailField label="ISBN" value={data.book!.isbn} />
        <DetailField label="Rented At" value={formatDate(data.rentedAt)} />
        <DetailField
          label="Returned At"
          value={data.returnDate ? formatDate(data.returnDate) : undefined}
        />
      </div>
    </>
  );
};

const InvoiceDetails = ({ invoice }: { invoice: InvoiceResult }) => {
  return match(invoice.type)
    .with(INVOICE_TYPES.bookSale, () => <BookSaleDetails data={invoice.data} />)
    .with(INVOICE_TYPES.rentalBook, () => (
      // @ts-expect-error - FIX ME
      <RentalBookDetails data={invoice.data} />
    ))
    .exhaustive();
};
