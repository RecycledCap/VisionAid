from ultralytics import YOLO

MODEL_PATH = "coco_yolo11n/experiment2/weights/best.pt"

# Load the YOLO11 model
model = YOLO(MODEL_PATH)

# Export the model to ONNX format
model.export(format="onnx")  # creates 'yolo11n.onnx'

# Load the exported ONNX model
onnx_model = YOLO("coco_yolo11n/experiment2/weights/best.onnx")

# Run inference
results = onnx_model("https://ultralytics.com/images/bus.jpg")