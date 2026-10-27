import React from 'react';
import { StyleSheet, StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MapRadarView } from './src/features/map/MapRadarView';
import { DriverBottomSheet } from './src/features/bottomSheet/DriverBottomSheet';
import { COLORS } from './src/theme/colors';

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <View style={styles.container}>
          {/* Layer 1: 60FPS Interactive Map Radar */}
          <MapRadarView />

          {/* Layer 2: Draggable Category & Driver Bottom Sheet */}
          <DriverBottomSheet />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default App;
