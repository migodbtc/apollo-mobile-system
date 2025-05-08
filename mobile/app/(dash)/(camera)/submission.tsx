import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { useVideoUri } from "@/constants/contexts/VideoURIContext";
import { VideoMetadata } from "@/constants/interfaces/media";
import { Video } from "expo-av";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { useSession } from "@/constants/contexts/SessionContext";
import SERVER_LINK from "@/constants/netvar";
import axios from "axios";
import { useImageUri } from "@/constants/contexts/ImageURIContext";
import SubmissionPanel from "@/components/panels/SubmissionPanel";

const { width, height } = Dimensions.get("window");

const SubmissionPage = () => {
  const router = useRouter();
  const { sessionData, setSessionData } = useSession();
  const videoReference = useRef<Video>(null);
  const { videoUri } = useVideoUri();
  const { imageUri } = useImageUri();
  const [videoSource, setVideoSource] = useState<{ uri: string } | undefined>(
    undefined
  );

  const [vidMetaData, setVidMetaData] = useState<VideoMetadata | null>(null);
  const [imageMetaData, setImageMetaData] = useState<{ size?: number } | null>(
    null
  );

  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [address, setAddress] =
    useState<Location.LocationGeocodedAddress | null>(null);
  const [timestamp, setTimestamp] = useState<string>("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmissionSending, setIsSubmissionSending] = useState(false);

  const [isSubmissionSuccessVisible, setIsSubmissionSuccessVisible] =
    useState(false);

  const getFullName = () => {
    if (!sessionData) return "Loading...";
    const { UA_first_name, UA_middle_name, UA_last_name, UA_suffix } =
      sessionData;
    return `${UA_first_name} ${
      UA_middle_name ? UA_middle_name.charAt(0) + "." : ""
    } ${UA_last_name}${UA_suffix ? " " + UA_suffix : ""}`;
  };

  const formatAddress = (addr: Location.LocationGeocodedAddress | null) => {
    if (!addr) return "Loading address...";

    const parts = [
      addr.streetNumber,
      addr.street,
      addr.city,
      addr.region,
      addr.postalCode,
      addr.country,
    ].filter(Boolean);

    return parts.join(", ");
  };
  return (
    <SubmissionPanel
      isLoading={isLoading}
      isSubmissionSending={isSubmissionSending}
      isSubmissionSuccessVisible={isSubmissionSuccessVisible}
      setIsLoading={setIsLoading}
      setIsSubmissionSending={setIsSubmissionSending}
      setIsSubmissionSuccessVisible={setIsSubmissionSuccessVisible}
      getFullName={getFullName}
      formatAddress={formatAddress}
      address={address}
      coords={coords}
      timestamp={timestamp}
      setAddress={setAddress}
      setCoords={setCoords}
      setTimestamp={setTimestamp}
      onBackPress={() => router.back()}
      onSubmitPress={() => {}}
      onCloseSuccessModal={() => {
        setIsSubmissionSuccessVisible(false);
        router.replace("/(dash)/dashboard");
      }}
    />
  );
};

export default SubmissionPage;
