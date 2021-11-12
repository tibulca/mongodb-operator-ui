import { Modal, Box } from "@mui/material";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

type NodeClusterModalProps = {
  show: boolean;
  onClose: () => void;
};

const NodeClusterModal = (props: NodeClusterModalProps) => {
  return (
    <Modal
      open={props.show}
      onClose={props.onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      style={{ overflow: "scroll" }}
    >
      <Box sx={style}></Box>
    </Modal>
  );
};

export default NodeClusterModal;
