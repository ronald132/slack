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
    messsagesLoading: true,
    previousChannel: null,
    numUniqueUsers: "",
    searchLoading: false,
    searchTerm: "",
    searchResults: []
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { currentUser, currentChannel } = nextProps;
    if (currentUser && currentChannel) {
      if (this.state.previousChannel != null) {
        this.removeListener(this.state.previousChannel.id);
        this.clearRender();
      }
      this.setState(
        {
          previousChannel: currentChannel
        },
        () => {
          this.addListener(currentChannel.id);
        }
      );
    }
  }

  handleSearchMessages = () => {
    const channelMessages = [...this.state.messages]; // to ensure we don't mutate the original messages array
    const regex = new RegExp(this.state.searchTerm, "gi");
    const searchResults = channelMessages.reduce((acc, message) => {
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ) {
        acc.push(message);
      }
      return acc;
    }, []);
    this.setState({
      searchResults
    });
    setTimeout(
      () =>
        this.setState({
          searchLoading: false
        }),
      1000
    );
  };

  handleSearchChange = event => {
    this.setState(
      {
        searchTerm: event.target.value,
        searchLoading: true
      },
      () => this.handleSearchMessages()
    );
  };

  displayChannelName = () =>
    this.props.currentChannel ? `#${this.props.currentChannel.name}` : "";

  addListener = channelId => {
    this.addMessageListener(channelId);
  };

  removeListener = channelId => {
    this.removeMessageListener(channelId);
  };

  removeMessageListener = channelId => {
    this.state.messagesRef.child(channelId).off();
  };

  addMessageListener = channelId => {
    let loadedMessages = [];
    this.setState({
      messages: loadedMessages
    });
    this.state.messagesRef.child(channelId).on("child_added", snap => {
      loadedMessages.push(snap.val());
      this.setState({
        messages: loadedMessages,
        messsagesLoading: false
      });
      this.countUniqueUsers(loadedMessages);
    });
  };

  countUniqueUsers = messages => {
    const uniqueUsers = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name);
      }
      return acc;
    }, []);

    const plural = uniqueUsers.length > 1;

    const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`;

    this.setState({
      numUniqueUsers: numUniqueUsers
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

  clearRender = () => {
    this.setState({
      messages: [],
      numUniqueUsers: ""
    });
  };

  render() {
    const {
      messagesRef,
      messages,
      messsagesLoading,
      numUniqueUsers,
      searchTerm,
      searchResults,
      searchLoading
    } = this.state;
    return (
      <React.Fragment>
        <MessagesHeader
          handleSearchChange={this.handleSearchChange}
          channelName={this.displayChannelName()}
          numUniqueUsers={numUniqueUsers}
          searchLoading={searchLoading}
        />
        <Segment>
          <CommentGroup className="messages">
            {messsagesLoading
              ? ""
              : searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
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
