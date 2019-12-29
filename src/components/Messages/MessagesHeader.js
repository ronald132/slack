import React, { Component } from "react";
import { Segment, Header, Icon, Input } from "semantic-ui-react";

class MessagesHeader extends Component {
  render() {
    const {
      channelName,
      numUniqueUsers,
      handleSearchChange,
      searchLoading
    } = this.props;
    return (
      <Segment clearing>
        <Header
          fluide="true"
          as="h2"
          floated="left"
          style={{ marginBottom: 0 }}
        >
          <span>
            {channelName}
            <Icon name="star outline" color="black" />
          </span>
          <Header.Subheader>
            {numUniqueUsers ? numUniqueUsers : ""}
          </Header.Subheader>
        </Header>
        <Header floated="right">
          <Input
            loading={searchLoading}
            onChange={handleSearchChange}
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
