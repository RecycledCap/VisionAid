from ultralytics import YOLO

# --- Configuration ---
DATA_CONFIG = "coco_sub.yaml"
# DATA_CONFIG = "coco.yaml" # Uncomment for full COCO training

# Model: yolov11n.pt is a good starting point for a nano model
MODEL_NAME = "yolo11n.pt" # Or "yolov11n-cls.pt" for classification, etc.
                           # Or start fresh with "yolov11n.yaml" if you don't want pretraining

# Training Hyperparameters
EPOCHS = 25  # Total number of training epochs
IMG_SIZE = 640 # Input image size
BATCH_SIZE = 16 # Experiment with this: 8, 16, 32, 64 depending on your M1 Pro's memory.
                # Higher might be faster if memory allows.
WORKERS = 8    # Number of data loading workers. Experiment: 4, 8, 12.
PATIENCE = 5   # Epochs to wait for no improvement before early stopping
DEVICE = "mps"  # For M1/M2 Macs
DROPOUT = 0.01  # Dropout rate (0.0 means no dropout)
SAVE_PERIOD = 1 # Save checkpoint every N epochs. Set to 1 to save after each epoch.
PROJECT_NAME = "coco_subset_yolo11n" # Project directory for saving runs
RUN_NAME = "experiment1" # Specific name for this training run

# --- Main Training Script ---
if __name__ == '__main__':
    # Load a model
    # You can load a pre-trained model (.pt) or a model configuration (.yaml)
    try:
        model = YOLO(MODEL_NAME)
        print(f"Successfully loaded model: {MODEL_NAME}")
    except Exception as e:
        print(f"Error loading model {MODEL_NAME}: {e}")
        print("Attempting to load YAML configuration instead if applicable.")
        # If MODEL_NAME was like "yolov11n.yaml", this would be the primary way.
        # For .pt files, this fallback might not be what you intend unless you also have a .yaml
        try:
            model = YOLO("yolov11n.yaml").load(MODEL_NAME) # Build from YAML and load weights
            print(f"Successfully built from YAML and loaded weights from {MODEL_NAME}")
        except Exception as e_yaml:
            print(f"Error building from YAML or loading weights for {MODEL_NAME}: {e_yaml}")
            print("Please ensure your model file or YAML is correct and accessible.")
            exit()

    print(f"\n--- Starting YOLOv11n Training ---")
    print(f"Dataset: {DATA_CONFIG}")
    print(f"Epochs: {EPOCHS}")
    print(f"Image Size: {IMG_SIZE}")
    print(f"Batch Size: {BATCH_SIZE}")
    print(f"Workers: {WORKERS}")
    print(f"Device: {DEVICE}")
    print(f"Patience for Early Stopping: {PATIENCE}")
    print(f"Dropout: {DROPOUT}")
    print(f"Save Period: {SAVE_PERIOD}")
    print(f"Project: {PROJECT_NAME}")
    print(f"Run Name: {RUN_NAME}")
    print("-------------------------------------\n")

    # Train the model
    try:
        results = model.train(
            data=DATA_CONFIG,
            epochs=EPOCHS,
            imgsz=IMG_SIZE,
            # batch=BATCH_SIZE,
            # workers=WORKERS,
            patience=PATIENCE,
            device=DEVICE,
            dropout=DROPOUT,
            save_period=SAVE_PERIOD,
            project=PROJECT_NAME,
            name=RUN_NAME,
            # Other useful parameters you might consider:
            # resume=True  # Set to True to resume from 'last.pt' in the run directory
            # optimizer='AdamW', # Default is 'auto' which often picks SGD or AdamW
            # lr0=0.01,      # Initial learning rate
            # lrf=0.01,      # Final learning rate (lr0 * lrf)
            # seed=0,        # For reproducibility
            # val=True,      # Perform validation every 'save_period' epochs (default True)
        )
        print("\n--- Training Complete ---")
        print(f"Results and checkpoints saved in: runs/train/{PROJECT_NAME}/{RUN_NAME}")

    except Exception as e:
        print(f"\n--- An error occurred during training ---")
        print(e)
        print("Check your parameters, dataset path, and system resources.")
        print("If you interrupted the training, checkpoints might be saved in:")
        print(f"runs/train/{PROJECT_NAME}/{RUN_NAME}/weights/ (last.pt, best.pt)")

    # (Optional) Validate the model after training
    # print("\n--- Validating Trained Model ---")
    # if DATA_CONFIG == "coco128.yaml":
    #     print("Validation on coco128.yaml. For full COCO, ensure coco.yaml is configured.")
    # metrics = model.val() # uses the best.pt by default
    # print("Validation Metrics:", metrics)

    # (Optional) Export the model to ONNX or other formats
    # print("\n--- Exporting Model to ONNX ---")
    # try:
    #     # Export the model to ONNX format
    #     # The path to best.pt will be something like:
    #     # runs/train/your_project_name/your_run_name/weights/best.pt
    #     path = model.export(format="onnx", imgsz=IMG_SIZE, opset=12) # opset for compatibility
    #     print(f"Model exported to ONNX format at: {path}")
    # except Exception as e:
    #     print(f"Error exporting model: {e}")
