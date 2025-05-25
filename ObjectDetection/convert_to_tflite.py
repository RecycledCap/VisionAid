from ultralytics import YOLO

MODEL_PATH = "coco_yolo11n/experiment2/weights/best.pt"

# Load the YOLO11 model
model = YOLO(MODEL_PATH)

# Export the model to TFLite format
model.export(format="tflite")  # creates 'yolo11n_float32.tflite'