import { Ionicons } from "@expo/vector-icons";
import type { VideoPlayer } from "expo-video";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useLanguage } from "../../src/context/languageContext";

const PROMO_VIDEO_EN = require("../../assets/edutrack-web.mp4");
const PROMO_VIDEO_AR = require("../../assets/edutrack-ar-web.mp4");

type VideoSource = typeof PROMO_VIDEO_EN;

type OnboardingWelcomeVideoProps = {
  /** When false, keep buffering off-screen until the welcome slide is shown. */
  visible?: boolean;
};

function safePlayerCall(player: VideoPlayer, fn: (instance: VideoPlayer) => void) {
  try {
    fn(player);
  } catch {
    // Player native object can be released during unmount, HMR, or source swap.
  }
}

type VideoPlayerSurfaceProps = {
  source: VideoSource;
  visible: boolean;
  muted: boolean;
  onFrameReady: () => void;
};

/**
 * Owns the expo-video player and view together so release/unmount stay in sync.
 */
function VideoPlayerSurface({
  source,
  visible,
  muted,
  onFrameReady,
}: VideoPlayerSurfaceProps) {
  const player = useVideoPlayer(source, (instance) => {
    instance.loop = true;
    instance.muted = true;
    instance.volume = 1;
    instance.bufferOptions = {
      preferredForwardBufferDuration: 8,
      minBufferForPlayback: 1,
    };
  });

  const [status, setStatus] = useState(player.status);

  useEffect(() => {
    const subscription = player.addListener("statusChange", ({ status: next }) => {
      setStatus(next);
    });
    return () => subscription.remove();
  }, [player]);

  useEffect(() => {
    safePlayerCall(player, (instance) => {
      instance.muted = muted;
    });
  }, [player, muted]);

  useEffect(() => {
    safePlayerCall(player, (instance) => {
      if (!visible) {
        instance.pause();
        return;
      }
      if (status === "readyToPlay" && !instance.playing) {
        instance.play();
      }
    });
  }, [visible, status, player]);

  useEffect(
    () => () => {
      safePlayerCall(player, (instance) => {
        instance.pause();
      });
    },
    [player],
  );

  if (!visible) {
    return <View style={styles.videoPlaceholder} />;
  }

  return (
    <VideoView
      player={player}
      style={styles.video}
      contentFit="cover"
      nativeControls={false}
      onFirstFrameRender={onFrameReady}
    />
  );
}

export function OnboardingWelcomeVideo({
  visible = true,
}: OnboardingWelcomeVideoProps) {
  const { t } = useTranslation();
  const { language, isRtl } = useLanguage();
  const [muted, setMuted] = useState(true);
  const [frameReady, setFrameReady] = useState(false);
  const source = language === "ar" ? PROMO_VIDEO_AR : PROMO_VIDEO_EN;

  useEffect(() => {
    setFrameReady(false);
  }, [language]);

  if (Platform.OS === "web") {
    return null;
  }

  const showSpinner = visible && !frameReady;

  const toggleMute = () => {
    setMuted((current) => !current);
  };

  return (
    <View
      style={[styles.wrap, !visible && styles.preloadOnly]}
      pointerEvents={visible ? "auto" : "none"}
    >
      <VideoPlayerSurface
        key={language}
        source={source}
        visible={visible}
        muted={muted}
        onFrameReady={() => setFrameReady(true)}
      />

      {showSpinner ? (
        <View style={styles.buffering} pointerEvents="none">
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : null}

      {visible ? (
        <Pressable
          style={[styles.muteBtn, isRtl ? styles.muteBtnRtl : styles.muteBtnLtr]}
          onPress={toggleMute}
          accessibilityRole="button"
          accessibilityLabel={
            muted ? t("onboarding.unmuteVideo") : t("onboarding.muteVideo")
          }
        >
          <Ionicons
            name={muted ? "volume-mute" : "volume-high"}
            size={18}
            color="#FFFFFF"
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    maxWidth: 320,
    aspectRatio: 16 / 9,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 24,
    backgroundColor: "#0F172A",
    borderWidth: 3,
    borderColor: "rgba(30, 58, 138, 0.12)",
  },
  preloadOnly: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
    marginBottom: 0,
    top: -1000,
    left: 0,
  },
  videoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#0F172A",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  buffering: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  muteBtn: {
    position: "absolute",
    bottom: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  muteBtnLtr: {
    right: 10,
  },
  muteBtnRtl: {
    left: 10,
  },
});
