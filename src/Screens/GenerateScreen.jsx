import React from 'react';
import {
  Text,
  View,
  StyleSheet,
} from 'react-native';

const GenerateScreen = () => {

  return (
    <View style={styles.root}>
      <Text>GenerateScreen Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#302F36',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GenerateScreen
