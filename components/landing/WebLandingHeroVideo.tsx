import { Ionicons } from "@expo/vector-icons";
import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  View,
} from "react-native";
import { useLanguage } from "../../src/context/languageContext";
import { getWebPromoVideoSources } from "../../src/constants/promoVideos";
import { webLandingStyles as styles } from "./webLandingStyles";

export function WebLandingHeroVideo() {
  const { t } = useTranslation();
  const { language, isRtl } = useLanguage();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [buffering, setBuffering] = useState(true);
  const sources = getWebPromoVideoSources(language);
  const [videoSrc, setVideoSrc] = useState(sources.primary);

  const ariaLabel = useMemo(() => t("landing.promoVideoAria"), [t]);

  const attachVideo = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
  }, []);

  useEffect(() => {
    const next = getWebPromoVideoSources(language);
    setVideoSrc(next.primary);
    setBuffering(true);
  }, [language]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const markBuffering = () => setBuffering(true);
    const markPlaying = () => setBuffering(false);

    video.addEventListener("waiting", markBuffering);
    video.addEventListener("playing", markPlaying);
    video.addEventListener("canplay", markPlaying);

    return () => {
      video.removeEventListener("waiting", markBuffering);
      video.removeEventListener("playing", markPlaying);
      video.removeEventListener("canplay", markPlaying);
    };
  }, [videoSrc]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !muted;
    if (!nextMuted) {
      const time = video.currentTime;
      video.pause();
      video.muted = false;
      video.volume = 1;
      video.currentTime = time;
      void video.play();
    } else {
      video.muted = true;
    }
    setMuted(nextMuted);
  }, [muted]);

  const onVideoError = useCallback(() => {
    const { primary, fallback } = getWebPromoVideoSources(language);
    if (videoSrc === primary) {
      setVideoSrc(fallback);
      setBuffering(true);
    }
  }, [language, videoSrc]);

  if (Platform.OS !== "web") {
    return null;
  }

  return (
    <View style={styles.heroVideoWrap}>
      {createElement("video", {
        key: videoSrc,
        ref: attachVideo,
        src: videoSrc,
        autoPlay: true,
        muted,
        loop: true,
        playsInline: true,
        preload: "auto",
        "aria-label": ariaLabel,
        onError: onVideoError,
        style: {
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          backgroundColor: "#0F172A",
        },
      })}

      {buffering ? (
        <View style={styles.heroVideoBuffering} pointerEvents="none">
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : null}

      <Pressable
        style={[
          styles.heroVideoMuteBtn,
          isRtl ? styles.heroVideoMuteBtnRtl : styles.heroVideoMuteBtnLtr,
        ]}
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
    </View>
  );
}
