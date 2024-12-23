import { ActionIcon, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link } from "@remix-run/react";
import { FileIcon, PencilIcon, Trash2Icon } from "lucide-react";
import type { GetAllBooks, GetAllBooksByLibraryId } from "~/lib/book.server";
import { DeleteBookModal } from "~/routes/resources+/delete-book";
import { RentBookDrawer } from "~/routes/resources+/rent-book";
import { ViewPDFModal } from "~/routes/resources+/view-pdf";

type CustomerBookCardProps = {
  book: GetAllBooksByLibraryId[number] | GetAllBooks[number];
  showLibrary?: boolean;
  isBookPurchased?: boolean;
  isBookRented?: boolean;
  showPurchaseOrRentButton?: boolean;
};

export function CustomerBookCard({ book, isBookPurchased, isBookRented }: CustomerBookCardProps) {
  const [isViewPDFModalOpen, handleViewPDFModal] = useDisclosure(false);
  const [isDeleteModalOpen, handleDeleteModal] = useDisclosure(false);
  const [isRentBookModalOpen, handleRentBookModal] = useDisclosure(false);

  return (
    <div className="p-5">
      <div className="flex flex-col h-[400px] w-[350px] bg-gray-50 rounded-lg shadow-lg">
        <div className="aspect-square h-[40%]">
          <img
            className="object-cover w-full h-full rounded-sm"
            src={book.imageUrl}
            alt={book.title}
          />
        </div>
        <div className="flex-1 p-2 w-full">
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between w-full">
              <span className="text-lg font-semibold px-3">{book.title}</span>
              <div className="flex items-center justify-center gap-3">
                <ActionIcon
                  color="blue"
                  onClick={() => {
                    handleViewPDFModal.open();
                  }}
                >
                  <FileIcon size={16} />
                </ActionIcon>
              </div>
            </div>
            <div className="px-3 mt-1">
              <span className="text-gray-900 text-sm">ISBN</span> {""}
              <span className="font-semibold">{book.isbn}</span>
            </div>
            <div className="px-3">
              <span className="text-gray-900 text-sm">written by</span> {""}
              <span className="font-semibold">{book.author}</span>
            </div>
            <div className="px-3">
              <span className="text-gray-900 text-sm">genre</span> {""}
              <span className="font-semibold">{book.genre?.name}</span>
            </div>
            <div className="px-3">
              <span className="text-gray-900 text-sm">price</span> {""}
              <span className="font-semibold">${book.purchaseAmount}</span>
            </div>
            <div className="px-3">
              <span className="text-gray-900 text-sm">Library</span> {""}
              <span className="font-semibold">{book.library?.name}</span>
            </div>

            <div className="p-2 flex flex-col items-center justify-center gap-2 w-full">
              {isBookPurchased ? (
                <p className="italic">Already Purchased</p>
              ) : (
                <>
                  {isBookRented && <p className="italic">Already Rented</p>}

                  {(!isBookRented || (isBookRented && !isBookPurchased)) && (
                    <Link to={`/books/${book.id}/purchase`} className="w-full">
                      <Button
                        color="blue"
                        disabled={isBookPurchased}
                        size="compact-sm"
                        variant="light"
                        className="w-full"
                      >
                        Purchase
                      </Button>
                    </Link>
                  )}

                  {!isBookRented && (
                    <Button
                      color="dark"
                      disabled={isBookPurchased}
                      onClick={handleRentBookModal.open}
                      size="compact-sm"
                      variant="light"
                      className="w-full"
                    >
                      Rent
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <ViewPDFModal
        onClose={handleViewPDFModal.close}
        open={isViewPDFModalOpen}
        pdfLink={book.pdfLink}
        title={book.title}
      />
      <DeleteBookModal book={book} onClose={handleDeleteModal.close} open={isDeleteModalOpen} />

      <RentBookDrawer book={book} onClose={handleRentBookModal.close} open={isRentBookModalOpen} />
    </div>
  );
}

type AdminBookCardProps = {
  book: GetAllBooks[number];
};

export function AdminBookCard({ book }: AdminBookCardProps) {
  const [isViewPDFModalOpen, handleViewPDFModal] = useDisclosure(false);

  return (
    <div className="p-5">
      <div className="flex flex-col h-[350px] w-[350px] bg-gray-50 rounded-lg shadow-lg">
        <div className="aspect-square h-[45%]">
          <img
            className="object-cover w-full h-full rounded-sm"
            src={book.imageUrl}
            alt={book.title}
          />
        </div>
        <div className="flex-1 p-2 w-full">
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between w-full">
              <span className="text-lg font-semibold px-3">{book.title}</span>
              <div className="flex items-center justify-center gap-3">
                <ActionIcon
                  color="blue"
                  onClick={() => {
                    handleViewPDFModal.open();
                  }}
                >
                  <FileIcon size={16} />
                </ActionIcon>
              </div>
            </div>
            <div className="px-3 mt-1">
              <span className="text-gray-900 text-sm">ISBN</span> {""}
              <span className="font-semibold">{book.isbn}</span>
            </div>
            <div className="px-3">
              <span className="text-gray-900 text-sm">written by</span> {""}
              <span className="font-semibold">{book.author}</span>
            </div>
            <div className="px-3">
              <span className="text-gray-900 text-sm">genre</span> {""}
              <span className="font-semibold">{book.genre?.name}</span>
            </div>
            <div className="px-3">
              <span className="text-gray-900 text-sm">price</span> {""}
              <span className="font-semibold">${book.purchaseAmount}</span>
            </div>

            <div className="px-3">
              <span className="text-gray-900 text-sm">Library</span> {""}
              <span className="font-semibold">{book.library?.name}</span>
            </div>
          </div>
        </div>
      </div>
      <ViewPDFModal
        onClose={handleViewPDFModal.close}
        open={isViewPDFModalOpen}
        pdfLink={book.pdfLink}
        title={book.title}
      />
    </div>
  );
}

type LibrarianBookCardProps = {
  book: GetAllBooksByLibraryId[number];
};

export function LibrarianBookCard({ book }: LibrarianBookCardProps) {
  const [isViewPDFModalOpen, handleViewPDFModal] = useDisclosure(false);
  const [isDeleteModalOpen, handleDeleteModal] = useDisclosure(false);

  return (
    <div className="p-5">
      <div className="flex flex-col h-[350px] w-[350px] bg-gray-50 rounded-lg shadow-lg">
        <div className="aspect-square h-[50%]">
          <img
            className="object-cover w-full h-full rounded-sm"
            src={book.imageUrl}
            alt={book.title}
          />
        </div>
        <div className="flex-1 p-2 w-full">
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between w-full">
              <span className="text-lg font-semibold px-3">{book.title}</span>
              <div className="flex items-center justify-center gap-3">
                <ActionIcon
                  color="blue"
                  onClick={() => {
                    handleViewPDFModal.open();
                  }}
                >
                  <FileIcon size={16} />
                </ActionIcon>

                <ActionIcon color="red">
                  <Link to={`/librarian/books/${book.id}/edit`}>
                    <PencilIcon size={16} />
                  </Link>
                </ActionIcon>

                <ActionIcon
                  color="blue"
                  onClick={() => {
                    handleDeleteModal.open();
                  }}
                >
                  <Trash2Icon size={16} />
                </ActionIcon>
              </div>
            </div>
            <div className="px-3 mt-1">
              <span className="text-gray-900 text-sm">ISBN</span> {""}
              <span className="font-semibold">{book.isbn}</span>
            </div>
            <div className="px-3">
              <span className="text-gray-900 text-sm">written by</span> {""}
              <span className="font-semibold">{book.author}</span>
            </div>
            <div className="px-3">
              <span className="text-gray-900 text-sm">genre</span> {""}
              <span className="font-semibold">{book.genre?.name}</span>
            </div>
            <div className="px-3">
              <span className="text-gray-900 text-sm">price</span> {""}
              <span className="font-semibold">${book.purchaseAmount}</span>
            </div>
          </div>
        </div>
      </div>
      <ViewPDFModal
        onClose={handleViewPDFModal.close}
        open={isViewPDFModalOpen}
        pdfLink={book.pdfLink}
        title={book.title}
      />
      <DeleteBookModal book={book} onClose={handleDeleteModal.close} open={isDeleteModalOpen} />
    </div>
  );
}
