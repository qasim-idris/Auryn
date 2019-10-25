import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface ErrorProps {
  message: string;
}

export const Error: React.FunctionComponent<ErrorProps> = ({ message }) => (
  <View style={styles.container}>
    <Text style={styles.text}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderColor: 'black',
    borderWidth: 3,
    backgroundColor: '#143672',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  text: {
    fontSize: 36,
    color: 'white',
  },
});
