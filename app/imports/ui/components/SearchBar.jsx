import _ from 'lodash';
import React, { Component } from 'react';
import { Search, Grid } from 'semantic-ui-react';
import { Foods } from '/imports/api/food/food';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Redirect } from 'react-router';

class SearchBar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value: '',
      results: [],
      renderResults: false,
    };
  }

  componentWillMount() {
    this.resetComponent();
  }

  resetComponent = () => this.setState({ isLoading: false, results: [], value: '' });

  handleResultSelect = () => {
    this.setState({ renderResults: true });
  };

  handleSearchChange = (e, { value }) => { {
      this.setState({ isLoading: true, value });
    }

    setTimeout(() => {
      if (this.state.value.length < 1) return this.resetComponent();

      const re = new RegExp(_.escapeRegExp(this.state.value), 'i');
      const isMatch = result => re.test(result.food);

      this.setState({
        isLoading: false,
        results: _.filter(this.props.foods, isMatch),
      });
    }, 300);
  };

  render() {
    const { isLoading, value, results } = this.state;

    if (this.state.renderResults) {
      return <Redirect to={{
        pathname: '/results',
        state: { referrer: results },
      }}/>;
    }

    return (
        <Grid>
          <Grid.Column>
            <Search className='search-bar'
                    fluid
                    placeholder='Search for your food'
                    input={{ fluid: 'true', transparent: 'true', icon: 'search', iconPosition: 'left' }}
                    loading={isLoading}
                    onResultSelect={this.handleResultSelect}
                    onSearchChange={_.debounce(this.handleSearchChange, 500, {
                      leading: true,
                    })}
                    results={results}
                    value={value}
                    {...this.props}
            />
          </Grid.Column>
        </Grid>

        /* renders back end database stuff, good for visualizing the data.
        <Grid.Column width={10}>
          <Segment>
            <Header>State</Header>
            <pre style={{ overflowX: 'auto' }}>
              {JSON.stringify(this.state, null, 2)}
            </pre>
            <Header>Options</Header>
            <pre style={{ overflowX: 'auto' }}>
              {JSON.stringify(source, null, 2)}
            </pre>
          </Segment>
        </Grid.Column>
      </Grid>
      */

    );
  }
}

/** Require an array of Food documents in the props. */
SearchBar.propTypes = {
  foods: PropTypes.object.isRequired,
  ready: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  // Get access to Food documents.
  const subscription = Meteor.subscribe('Food');
  return {
    foods: Foods.find({}).fetch(),
    ready: subscription.ready(),
  };
})(SearchBar);
