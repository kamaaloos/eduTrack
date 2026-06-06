const appJson = require("./app.json");

/** @type {import('expo/config').ExpoConfig} */
module.exports = () => ({
  expo: {
    ...appJson.expo,
    plugins: appJson.expo.plugins.map((plugin) => {
      const name = Array.isArray(plugin) ? plugin[0] : plugin;
      if (name === "./plugins/withAdiRegistration") {
        return [
          "./plugins/withAdiRegistration",
          { token: process.env.ADI_REGISTRATION_TOKEN },
        ];
      }
      return plugin;
    }),
  },
});
