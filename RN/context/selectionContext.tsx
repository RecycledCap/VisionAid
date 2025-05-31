import * as SecureStore from "expo-secure-store";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

export const COCO_CLASSES = [
  "person",
  "bicycle",
  "car",
  "motorcycle",
  "airplane",
  "bus",
  "train",
  "truck",
  "boat",
  "traffic light",
  "fire hydrant",
  "stop sign",
  "parking meter",
  "bench",
  "bird",
  "cat",
  "dog",
  "horse",
  "sheep",
  "cow",
  "elephant",
  "bear",
  "zebra",
  "giraffe",
  "backpack",
  "umbrella",
  "handbag",
  "tie",
  "suitcase",
  "frisbee",
  "skis",
  "snowboard",
  "sports ball",
  "kite",
  "baseball bat",
  "baseball glove",
  "skateboard",
  "surfboard",
  "tennis racket",
  "bottle",
  "wine glass",
  "cup",
  "fork",
  "knife",
  "spoon",
  "bowl",
  "banana",
  "apple",
  "sandwich",
  "orange",
  "broccoli",
  "carrot",
  "hot dog",
  "pizza",
  "donut",
  "cake",
  "chair",
  "couch",
  "potted plant",
  "bed",
  "dining table",
  "toilet",
  "tv",
  "laptop",
  "mouse",
  "remote",
  "keyboard",
  "cell phone",
  "microwave",
  "oven",
  "toaster",
  "sink",
  "refrigerator",
  "book",
  "clock",
  "vase",
  "scissors",
  "teddy bear",
  "hair drier",
  "toothbrush",
] as const;

export const hazardObjects = [
  // "bottle", test
  "bicycle",
  "car",
  "motorcycle",
  "bus",
  "train",
  "truck",
  "boat",
  "traffic light",
  "fire hydrant",
  "stop sign"
];

export type ObjectType = (typeof COCO_CLASSES)[number];

export type SelectionContextType = {
  selection: ObjectType[];
  updateSelection: (newSelection: ObjectType[]) => void;
};

export const SelectionContext = createContext<SelectionContextType>({
  selection: [...COCO_CLASSES],
  updateSelection: () => {},
});

export const SelectionProvider = ({ children }: { children: ReactNode }) => {
  const [selection, setSelection] = useState<ObjectType[]>([...COCO_CLASSES]);

  useEffect(() => {
    const loadSeleciton = async () => {
      let tmpSelectionStr = await SecureStore.getItemAsync("selection");
      if (!tmpSelectionStr)
        tmpSelectionStr = ""
      updateSelection(tmpSelectionStr.split(";") as ObjectType[]);
    };
    loadSeleciton();
  }, []);

  const updateSelection = (newSelection: ObjectType[]) => {
    // Optional: ensure only valid items are included
    const filtered = newSelection.filter((item) =>
      COCO_CLASSES.includes(item)
    ) as ObjectType[];

    setSelection(filtered);
  };

  useEffect(() => {
      const saveSelection = async () => {
        await SecureStore.setItemAsync("selection", `${selection.join(";")}`);
      };
      saveSelection();
    }, [selection]);

  return (
    <SelectionContext.Provider value={{ selection, updateSelection }}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => useContext(SelectionContext);
