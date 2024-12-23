import { Button, Table } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ArrowRightIcon, ReceiptIcon } from "lucide-react";

import { Page } from "~/components/page";
import { type GetPaymentsByUserId, getPaymentsByUserId } from "~/lib/payment.server";
import { requireUserId } from "~/lib/session.server";
import { ViewInvoiceModal } from "~/routes/resources+/view-invoice";
import { extractShortId, formatCurrency, formatDate, paymentMethodToLabel } from "~/utils/misc";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const payments = await getPaymentsByUserId(userId);

  return json({
    payments,
  });
};

type Payment = GetPaymentsByUserId[number];

export default function ManageBooks() {
  const { payments } = useLoaderData<typeof loader>();

  return (
    <>
      <Page.Layout>
        <Page.Header title="Invoices" icon={<ReceiptIcon />} />

        {payments.length > 0 ? (
          <div className="bg-gray-50 p-3 rounded-lg">
            <Table stickyHeader>
              <Table.Thead className="bg-transparent">
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Method</Table.Th>
                  <Table.Th>Amount</Table.Th>

                  <Table.Th>
                    <span className="sr-only">Actions</span>
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} payment={payment} />
                ))}
              </Table.Tbody>
            </Table>
          </div>
        ) : (
          <div className="flex h-full min-h-36 items-center justify-center rounded-md border bg-blue-50 py-4 text-center">
            <span>No invoices generated!</span>
          </div>
        )}
      </Page.Layout>
    </>
  );
}

function TableRow({ payment }: { payment: Payment }) {
  const [isViewModalOpen, { open: openViewModal, close: closeViewModal }] = useDisclosure(false);

  return (
    <>
      <Table.Tr key={payment.id}>
        <Table.Td>{extractShortId(payment.id)}</Table.Td>
        <Table.Td>{formatDate(payment.createdAt)}</Table.Td>
        <Table.Td>{payment.type}</Table.Td>
        <Table.Td>{paymentMethodToLabel[payment.paymentMethod]}</Table.Td>
        <Table.Td>{formatCurrency(Number(payment.amount))}</Table.Td>

        <Table.Td>
          <div className="flex items-center justify-end gap-4">
            <Button
              onClick={() => openViewModal()}
              rightSection={<ArrowRightIcon size={14} />}
              size="compact-sm"
              variant="light"
            >
              View
            </Button>
          </div>
        </Table.Td>
      </Table.Tr>

      <ViewInvoiceModal onClose={closeViewModal} open={isViewModalOpen} payment={payment} />
    </>
  );
}
