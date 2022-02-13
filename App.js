import React from 'react';
import {StatusBar} from 'react-native';
//Navigation
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
//Components
import MainMenu from './src/Screens/MainMenu.jsx';
import {GenerateScreen} from './src/Screens/GenerateScreen.jsx';
import ScanScreen from './src/Screens/ScanScreen.jsx';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <StatusBar backgroundColor="#27262C" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Home" component={MainMenu} />
        <Stack.Screen name="Generate" component={GenerateScreen} />
        <Stack.Screen name="Scan" component={ScanScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App
