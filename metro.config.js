const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// FFmpeg ve crypto için gerekli node modüllerini ekleyin
config.resolver.extraNodeModules = {
  crypto: require.resolve('react-native-crypto'),
  buffer: require.resolve('@craftzdog/react-native-buffer'),
  stream: require.resolve('stream-browserify'),
};

module.exports = withNativeWind(config, { input: './global.css' });