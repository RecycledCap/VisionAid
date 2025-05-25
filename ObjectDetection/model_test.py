import os
from ultralytics import YOLO

model = YOLO("coco_yolo11n/experiment2/weights/best.pt")

# Get a list of test images
test_images_dir = "data/images/test2017"
test_images = [os.path.join(test_images_dir, fname) for fname in os.listdir(test_images_dir) if fname.lower().endswith(('.jpg', '.jpeg', '.png'))]

# Run inference and display results for a few images
for img_path in test_images[5:10]:
    results = model(img_path)
    results[0].show()  # Display image with labels

# # Evaluate model accuracy on the test set
# metrics = model.val(data="coco8.yaml", split="test")
# print(metrics)