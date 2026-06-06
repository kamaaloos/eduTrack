/** @type {import('expo/config').ExpoConfig} */
module.exports = ({ config }) => ({
  ...config,
  plugins: config.plugins.map((plugin) => {
    const name = Array.isArray(plugin) ? plugin[0] : plugin;
    if (name === "./plugins/withAdiRegistration") {
      return [
        "./plugins/withAdiRegistration",
        { token: process.env.ADI_REGISTRATION_TOKEN },
      ];
    }
    return plugin;
  }),
});
