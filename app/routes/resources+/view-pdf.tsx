import { Modal, ScrollArea } from "@mantine/core";

import { useCallbackOnRouteChange } from "~/utils/hooks/use-callback-on-route-change";

// const VIEW_PDF_ROUTE = '/resources/view-pdf'

interface IViewPDF {
  onClose: () => void;
  open: boolean;
  pdfLink: string;
  title: string;
}

export const ViewPDFModal = ({ open, onClose, pdfLink, title }: IViewPDF) => {
  const onModalClose = () => {
    onClose();
  };

  useCallbackOnRouteChange(() => onModalClose());

  return (
    <>
      <Modal
        closeOnClickOutside={false}
        onClose={() => onModalClose()}
        opened={open}
        scrollAreaComponent={ScrollArea.Autosize}
        size="80%"
        title={title}
      >
        <iframe className="h-[80vh] w-full" src={pdfLink} title={title} />
      </Modal>
    </>
  );
};
