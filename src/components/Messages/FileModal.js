import React, { Component } from "react";
import { Modal, Input, Button, Icon } from "semantic-ui-react";
import mime from "mime-types";

class FileModal extends Component {
  state = {
    file: null,
    authorized: ["image/jpeg", "image/png"]
  };
  handleChange = event => {
    const file = event.target.files[0];
    if (file) {
      this.setState({
        file: file
      });
    }
  };

  isAuthorized = filename =>
    this.state.authorized.includes(mime.lookup(filename));

  clearFile = () => this.setState({ file: null });

  sendFile = () => {
    const { file } = this.state;
    const { closeModal, uploadFile } = this.props;
    if (file != null) {
      if (this.isAuthorized(file.name)) {
        const metadata = { contentType: mime.lookup(file.name) };
        uploadFile(file, metadata);
        closeModal();
        this.clearFile();
      }
    }
  };
  render() {
    const { modal, closeModal } = this.props;

    return (
      <Modal basic open={modal} onClose={closeModal}>
        <Modal.Header>Select an image file</Modal.Header>
        <Modal.Content>
          <Input
            fluid
            label="File types: jpg, png"
            name="file"
            type="file"
            onChange={this.handleChange}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.sendFile} color="green" inverted>
            <Icon name="checkmark" /> Send
          </Button>
          <Button color="red" inverted onClick={closeModal}>
            <Icon name="remove" /> Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default FileModal;
