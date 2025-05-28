import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

const COCO_CLASSES = [
    'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
    'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat',
    'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack',
    'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
    'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
    'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
    'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair',
    'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse',
    'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
    'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
];

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type Detection = {
  box: { x: number; y: number; w: number; h: number };
  class_id: number;
  confidence: number;
};

function DetectionBoxes({ detections }: { detections: Detection[] }) {
  console.log(detections)
  return <Svg style={styles.detectionBox} viewBox={`0 0 ${screenWidth} ${screenHeight}`}>
    {detections.map((det, index) => (
      <React.Fragment key={index}>
        <Rect
          x={det.box.x}
          y={det.box.y}
          width={det.box.w}
          height={det.box.h}
          stroke="red"
          strokeWidth="2"
          fill="transparent"
        />
        <SvgText
          x={det.box.x + 5}
          y={det.box.y + 15}
          fill="red"
          fontSize="12"
          fontWeight="bold"
          stroke="black" // For better visibility
          strokeWidth="0.5"
        >
          {`${COCO_CLASSES[det.class_id]} (${det.confidence.toFixed(2)})`}
        </SvgText>
      </React.Fragment>
    ))}
  </Svg>
}

export default function App() {
  const cameraRef = useRef<CameraView | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [detections, setDetections] = useState<Detection[]>([]);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function base64ToBlob(base64String: string, mimeType: string): Blob {
    // Remove the Base64 prefix (e.g., "data:image/png;base64,")
    const base64Data = base64String.split(',')[1];

    // Decode the Base64 string into binary data
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);

    // Create a Blob object from the binary data
    return new Blob([byteArray], { type: mimeType });
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        shutterSound: false, // Disable shutter sound
        quality: 0.5, // Set image quality (0 to 1)
        exif: false, // Disable exif data storage
        base64: true, // Return image data in Base64 format
      });

      // Example usage:
      const base64String = photo.base64;
      const mimeType = base64String?.split(';')[0].split(':')[1];

      // @ts-ignore
      const blob = base64ToBlob(base64String, mimeType);

      const formData = new FormData();
      formData.append('file', blob);

      try {
        const response = await fetch('http://20.174.8.136:80/predict/', {
          method: 'POST',
          headers: {
            'accept': 'application/json', // Do not set Content-Type manually
          },
          body: formData,
        });

        const result = await response.json();
        setDetections(result.detections);

      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  return (
    <>
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing={facing}
        ref={cameraRef}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Text style={styles.text}>Take Picture</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
    <DetectionBoxes detections={detections}></DetectionBoxes>
    </>
  );
}

const styles = StyleSheet.create({
  detectionBox: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
