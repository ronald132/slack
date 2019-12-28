import React, { Component } from "react";
import { Menu, Icon, Modal, Form, Input, Button } from "semantic-ui-react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import * as actions from "../../actions";

class Channels extends Component {
  state = {
    channels: [],
    modal: false,
    channelName: "",
    channelDetails: "",
    channelsRef: firebase.database().ref("channels"),
    firstLoad: true
  };

  handleSubmit = event => {
    event.preventDefault();

    if (this.isFormValid(this.state)) {
      this.addChannel();
    }
  };

  addChannel = () => {
    const { channelsRef, channelName, channelDetails } = this.state;
    const key = channelsRef.push().key;

    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: this.props.currentUser.displayName,
        avatar: this.props.currentUser.photoURL
      }
    };

    channelsRef
      .child(key)
      .set(newChannel)
      .then(() => {
        this.setState({
          channelName: "",
          channelDetails: ""
        });
        this.closeModal();
        console.log("channel added");
      })
      .catch(err => {
        console.log(err);
      });
  };

  isFormValid = ({ channelName, channelDetails }) =>
    channelName && channelDetails;

  openModal = () => {
    this.setState({
      modal: true
    });
  };

  closeModal = () => {
    this.setState({
      modal: false
    });
  };
  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  setFirstChannel = () => {
    if (this.state.firstLoad && this.state.channels.length > 0) {
      this.props.dispatch(actions.setCurrentChannel(this.state.channels[0]));
    }
    this.setState({
      firstLoad: false
    });
  };

  removeListeners = () => {
    this.state.channelsRef.off();
  };

  addListeners = () => {
    let loadedChannels = [];
    this.state.channelsRef.on("child_added", snap => {
      loadedChannels.push(snap.val());
      this.setState(
        {
          channels: loadedChannels
        },
        () => this.setFirstChannel()
      );
    });
  };

  changeChannel = channel => {
    this.props.dispatch(actions.setCurrentChannel(channel));
  };

  displayChannels = channels => {
    return (
      channels.length > 0 &&
      channels.map(channel => (
        <Menu.Item
          key={channel.id}
          onClick={() => this.changeChannel(channel)}
          name={channel.name}
          style={{ opacity: 0.7 }}
          active={
            this.props.currentChannel &&
            channel.id === this.props.currentChannel.id
          }
        >
          # {channel.name}
        </Menu.Item>
      ))
    );
  };

  render() {
    const { channels, modal } = this.state;

    return (
      <React.Fragment>
        <Menu.Menu style={{ paddingBottom: "2em" }}>
          <Menu.Item>
            <span>
              <Icon name="exchange" />
              CHANNELS
            </span>{" "}
            ({channels.length}) <Icon name="add" onClick={this.openModal} />
          </Menu.Item>
          {this.displayChannels(channels)}
        </Menu.Menu>
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Add a Channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Name of channel"
                  name="channelName"
                  onChange={this.handleChange}
                />
              </Form.Field>
              <Form.Field>
                <Input
                  fluid
                  label="About the channel"
                  name="channelDetails"
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSubmit}>
              <Icon name="checkmark" /> Add
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel
});

export default connect(mapStateToProps)(Channels);
