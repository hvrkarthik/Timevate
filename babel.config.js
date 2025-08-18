module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'expo-router/babel',
        {
          root: './app'
        }
      ],
      'react-native-reanimated/plugin' // THIS MUST BE THE LAST PLUGIN
    ],
  };
};