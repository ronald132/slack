import React, { Component } from "react";
import { Segment, Input, Button } from "semantic-ui-react";
import { connect } from "react-redux";
import firebase from "../../firebase";
import FileModal from "./FileModal";
import uuidv4 from "uuid/v4";
import ProgressBar from "./ProgressBar";

class MessageForm extends Component {
  state = {
    storageRef: firebase.storage().ref(),
    uploadTask: null,
    uploadState: "",
    percentUploaded: 0,
    message: "",
    loading: false,
    errors: [],
    modal: false,
    messagesRef: firebase.database().ref("messages")
  };

  openModal = () => this.setState({ modal: true });
  closeModal = () => this.setState({ modal: false });

  handleOnChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };

  uploadFile = (file, metadata) => {
    const channel = this.props.currentChannel;
    if (channel) {
      const pathToUpload = channel.id;
      const filePath = `images/${uuidv4()}.jpg`;
      this.setState(
        {
          uploadState: "uploading",
          uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
        },
        () => {
          this.state.uploadTask.on(
            "state_changed",
            snap => {
              const percentUploaded = Math.round(
                (snap.bytesTransferred / snap.totalBytes) * 100
              );
              this.setState({
                percentUploaded: percentUploaded
              });
            },
            err => {
              console.log(err);
              this.setState({
                errors: this.state.errors.concat(err),
                uploadState: "error",
                uploadTask: null
              });
            },
            () => {
              this.state.uploadTask.snapshot.ref
                .getDownloadURL()
                .then(downloadUrl => {
                  this.sendFileMessage(
                    downloadUrl,
                    this.state.messagesRef,
                    pathToUpload
                  );
                })
                .catch(err => {
                  this.setState({
                    errors: this.state.errors.concat(err),
                    uploadState: "error",
                    uploadTask: null
                  });
                });
            }
          );
        }
      );
    }
  };

  sendFileMessage = (fileUrl, ref, pathToUpload) => {
    ref
      .child(pathToUpload)
      .push()
      .set(this.createMessage(fileUrl))
      .then(() => {
        this.setState({
          uploadState: "done"
        });
      })
      .catch(err => {
        this.setState({
          errors: this.state.errors.concat(err),
          uploadState: "error",
          uploadTask: null
        });
      });
  };
  createMessage = (fileUrl = null) => {
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: this.props.currentUser.uid,
        name: this.props.currentUser.displayName,
        avatar: this.props.currentUser.photoURL
      }
    };
    if (fileUrl !== null) {
      message["image"] = fileUrl;
    } else {
      message["content"] = this.state.message;
    }

    return message;
  };
  sendMessage = () => {
    const { messagesRef, currentChannel } = this.props;
    const { message } = this.state;
    if (message) {
      this.setState({
        loading: true
      });
      messagesRef
        .child(currentChannel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({
            loading: false,
            message: "",
            errors: []
          });
        })
        .catch(err => {
          console.error(err);
          this.setState({
            loading: false,
            errors: this.state.errors.concat(err)
          });
        });
    } else {
      this.setState({
        errors: this.state.errors.concat({ message: "Add a message" })
      });
    }
  };
  render() {
    const {
      errors,
      message,
      loading,
      modal,
      uploadState,
      percentUploaded
    } = this.state;
    return (
      <Segment className="message__form">
        <Input
          fluid
          name="message"
          onChange={this.handleOnChange}
          value={message}
          style={{ marginBottom: "0.7em" }}
          label={<Button icon="add" />}
          labelPosition="left"
          placeholder="Write your message"
          className={errors.length > 0 ? "error" : ""}
        ></Input>
        <Button.Group icon widths="2">
          <Button
            disabled={loading}
            onClick={this.sendMessage}
            color="orange"
            content="Add Reply"
            labelPosition="left"
            icon="edit"
          ></Button>
          <Button
            onClick={this.openModal}
            color="teal"
            content="Upload Media"
            labelPosition="left"
            icon="cloud"
          ></Button>
        </Button.Group>
        <FileModal
          modal={modal}
          closeModal={this.closeModal}
          uploadFile={this.uploadFile}
        />
        <ProgressBar
          uploadState={uploadState}
          percentUploaded={percentUploaded}
        />
      </Segment>
    );
  }
}

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel
});
export default connect(mapStateToProps)(MessageForm);
