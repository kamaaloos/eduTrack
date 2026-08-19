/** @type {import('expo/config').ExpoConfig} */
module.exports = ({ config }) => {
  const brand = (process.env.EXPO_PUBLIC_APP_BRAND || "edutrack").trim().toLowerCase();
  const isDugsi = brand === "dugsi";
  const displayName =
    process.env.EXPO_PUBLIC_APP_DISPLAY_NAME?.trim() ||
    (isDugsi ? "Dugsi" : "eduTrack");
  const scheme =
    process.env.EXPO_PUBLIC_APP_SCHEME?.trim() ||
    (isDugsi ? "dugsi" : "edutrack");
  const androidPackage =
    process.env.EXPO_PUBLIC_ANDROID_PACKAGE?.trim() ||
    (isDugsi ? "com.maylesoft.dugsi" : "com.maylesoft.edutrack");
  const iosBundleId =
    process.env.EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER?.trim() ||
    (isDugsi ? "com.maylesoft.dugsi" : "com.maylesoft.edutrack");
  const pushChannel = isDugsi ? "dugsi-alerts" : "edutrack-alerts";
  const iconPath = isDugsi
    ? "./assets/images/dugsi-icon.png"
    : "./assets/images/icon.png";
  const logoPath = isDugsi
    ? "./assets/images/dugsi-logo.png"
    : "./assets/images/edutrack-logo.png";
  const splashPath = isDugsi
    ? "./assets/images/dugsi-splash-screen.png"
    : "./assets/images/edutrack-splash-screen.png";
  const splashBackground = isDugsi ? "#D6E6F5" : "#FFFFFF";

  return {
    ...config,
    name: displayName,
    icon: iconPath,
    // EAS projectId is bound to this slug (eduTrack). White-label builds change
    // display name, package, and scheme — not the Expo slug.
    slug: config.slug,
    scheme,
    ios: {
      ...config.ios,
      bundleIdentifier: iosBundleId,
    },
    web: {
      ...config.web,
      favicon: iconPath,
    },
    android: {
      ...config.android,
      package: androidPackage,
      adaptiveIcon: {
        ...config.android?.adaptiveIcon,
        foregroundImage: logoPath,
      },
    },
    plugins: [
      ...config.plugins.map((plugin) => {
      const name = Array.isArray(plugin) ? plugin[0] : plugin;
      if (name === "./plugins/withAdiRegistration") {
        return [
          "./plugins/withAdiRegistration",
          { token: process.env.ADI_REGISTRATION_TOKEN },
        ];
      }
      if (name === "expo-image-picker") {
        return [
          "expo-image-picker",
          {
            photosPermission: `Allow ${displayName} to access your photos to set your profile picture.`,
          },
        ];
      }
      if (name === "expo-camera") {
        return [
          "expo-camera",
          {
            cameraPermission: `Allow ${displayName} to scan your school login card QR code.`,
          },
        ];
      }
      if (name === "expo-splash-screen") {
        return [
          "expo-splash-screen",
          {
            image: splashPath,
            resizeMode: "cover",
            backgroundColor: splashBackground,
            android: {
              image: splashPath,
              resizeMode: "cover",
              backgroundColor: splashBackground,
              enableFullScreenImage_legacy: true,
            },
            ios: {
              image: splashPath,
              resizeMode: "cover",
              backgroundColor: splashBackground,
            },
          },
        ];
      }
      if (name === "expo-notifications") {
        const settings = Array.isArray(plugin) ? plugin[1] : {};
        return [
          "expo-notifications",
          {
            ...settings,
            icon: iconPath,
            defaultChannel: pushChannel,
          },
        ];
      }
      return plugin;
    }),
      [
        "expo-build-properties",
        {
          android: {
            enableMinifyInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
            extraProguardRules: [
              "-keepattributes SourceFile,LineNumberTable",
              "-keep class com.facebook.react.** { *; }",
              "-keep class com.facebook.hermes.** { *; }",
              "-keep class com.swmansion.reanimated.** { *; }",
              "-dontwarn com.facebook.react.**",
            ].join("\n"),
          },
        },
      ],
    ],
  };
};
