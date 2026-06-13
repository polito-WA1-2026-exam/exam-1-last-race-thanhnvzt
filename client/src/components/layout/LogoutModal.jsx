import { Button, Modal } from 'react-bootstrap';

export function LogoutModal({ show, onHide, onConfirm, loggingOut }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Logout</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to log out?</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loggingOut}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={loggingOut}>
          Logout
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
