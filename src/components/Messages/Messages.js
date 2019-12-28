import React, { Component } from "react";
import { Segment, CommentGroup } from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import Message from "./Message";
import firebase from "../../firebase";
import { connect } from "react-redux";

class Messages extends Component {
  state = {
    messages: [],
    messagesRef: firebase.database().ref("messages"),
    messsagesLoading: true
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { currentUser, currentChannel } = nextProps;
    if (currentUser && currentChannel) {
      this.addListener(currentChannel.id);
    }
  }

  addListener = channelId => {
    this.addMessageListener(channelId);
  };

  addMessageListener = channelId => {
    let loadedMessages = [];
    this.state.messagesRef.child(channelId).on("child_added", snap => {
      loadedMessages.push(snap.val());
      this.setState({
        messages: loadedMessages,
        messsagesLoading: false
      });
    });
  };

  displayMessages = messages => {
    return (
      messages.length > 0 &&
      messages.map(message => (
        <Message
          key={message.timestamp}
          timestamp={message.timestamp}
          message={message}
          user={this.props.currentUser}
        />
      ))
    );
  };

  render() {
    const { messagesRef, messages, messsagesLoading } = this.state;
    return (
      <React.Fragment>
        <MessagesHeader />
        <Segment>
          <CommentGroup className="messages">
            {messsagesLoading ? "" : this.displayMessages(messages)}
          </CommentGroup>
        </Segment>
        <MessageForm messagesRef={messagesRef} />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    currentUser: state.user.currentUser,
    currentChannel: state.channel.currentChannel
  };
};

export default connect(mapStateToProps)(Messages);
