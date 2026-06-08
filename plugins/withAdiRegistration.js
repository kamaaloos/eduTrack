const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Copies adi-registration.properties into the native Android assets folder
 * for Google Play / Android developer verification proof-of-ownership uploads.
 */
function withAdiRegistration(config, props = {}) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const sourcePath = path.join(projectRoot, "assets", "adi-registration.properties");
      const token = (props.token || process.env.ADI_REGISTRATION_TOKEN || "").trim();
      const buildProfile = (process.env.EAS_BUILD_PROFILE || "").trim();
      const requireAdi = buildProfile === "production";

      let contents;
      if (token) {
        contents = token.endsWith("\n") ? token : `${token}\n`;
      } else if (fs.existsSync(sourcePath)) {
        contents = fs.readFileSync(sourcePath, "utf8");
        if (!contents.trim()) {
          throw new Error(
            "assets/adi-registration.properties is empty. Paste the snippet from Google Play Console."
          );
        }
      } else if (!requireAdi) {
        // Preview/dev/internal APKs do not need Google ADI proof-of-ownership.
        return config;
      } else {
        throw new Error(
          "Missing ADI registration token. Create assets/adi-registration.properties locally, set ADI_REGISTRATION_TOKEN on EAS (production environment), or pass { token } to ./plugins/withAdiRegistration."
        );
      }

      const assetsDir = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "assets"
      );
      fs.mkdirSync(assetsDir, { recursive: true });
      fs.writeFileSync(path.join(assetsDir, "adi-registration.properties"), contents);

      return config;
    },
  ]);
}

module.exports = withAdiRegistration;
