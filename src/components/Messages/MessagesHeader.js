import React, { Component } from "react";
import { Segment, Header, Icon, Input } from "semantic-ui-react";

class MessagesHeader extends Component {
  render() {
    return (
      <Segment clearing>
        <Header
          fluide="true"
          as="h2"
          floated="left"
          style={{ marginBottom: 0 }}
        >
          <span>
            Channel
            <Icon name="star outline" color="black" />
          </span>
          <Header.Subheader>2 Users</Header.Subheader>
        </Header>
        <Header floated="right">
          <Input
            size="mini"
            icon="search"
            name="searchTerm"
            placeholders="Search Messages"
          />
        </Header>
      </Segment>
    );
  }
}
export default MessagesHeader;
