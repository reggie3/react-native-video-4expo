import React from 'react';
import { Text, Button, Container } from 'native-base';
import { withNavigation } from 'react-navigation';
import Header from './Header';

const random_rgba = () => {
  var o = Math.round,
    r = Math.random,
    s = 255;
  return (
    'rgba(' +
    o(r() * s) +
    ',' +
    o(r() * s) +
    ',' +
    o(r() * s) +
    ',' +
    r().toFixed(1) +
    ')'
  );
};
const BACKGROUND_COLOR = random_rgba();

class IntroScreen extends React.Component {
  render() {
    return (
      <Container
        style={{
          backgroundColor: `${BACKGROUND_COLOR}`
        }}
      >
        <Header />

        <Button
          style={{ margin: 10 }}
          onPress={() => {
            this.props.navigation.navigate('RecordVideoScreen');
          }}
        >
          <Text>Go to RecordVideoScreen</Text>
        </Button>
      </Container>
    );
  }
}

export default withNavigation(IntroScreen);
