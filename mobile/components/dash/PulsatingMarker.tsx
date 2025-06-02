import { Animated } from "react-native";
import React from "react";

const PulsatingMarker = ({ children }: { children: React.ReactNode }) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 0.9,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, [scaleValue]);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleValue }],
      }}
    >
      {children}
    </Animated.View>
  );
};

export default PulsatingMarker;
