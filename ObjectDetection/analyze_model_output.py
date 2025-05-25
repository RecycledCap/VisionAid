import onnx
import onnxruntime as ort
import numpy as np

def analyze_yolo_model(model_path):
    print("🔍 ANALYZING YOLO MODEL")
    print("=" * 50)
    
    try:
        # Load ONNX model
        model = onnx.load(model_path)
        session = ort.InferenceSession(model_path)
        print(f"✅ Model loaded successfully: {model_path}")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return None
    
    # Get input details
    inputs = session.get_inputs()
    print(f"\n📥 INPUT INFO:")
    for i, inp in enumerate(inputs):
        print(f"  Input {i}: {inp.name}")
        print(f"    Shape: {inp.shape}")
        print(f"    Type: {inp.type}")
    
    # Get output details
    outputs = session.get_outputs()
    print(f"\n📤 OUTPUT INFO:")
    for i, out in enumerate(outputs):
        print(f"  Output {i}: {out.name}")
        print(f"    Shape: {out.shape}")
        print(f"    Type: {out.type}")
    
    # Test with dummy 640x640 input
    print(f"\n🧪 TESTING WITH 640x640 INPUT:")
    try:
        input_name = inputs[0].name
        # Create dummy input: [batch=1, channels=3, height=640, width=640]
        dummy_input = np.random.randn(1, 3, 640, 640).astype(np.float32)
        print(f"  Input shape: {dummy_input.shape}")
        
        # Run inference
        results = session.run(None, {input_name: dummy_input})
        print(f"  ✅ Inference successful!")
        print(f"  Number of outputs: {len(results)}")
        
        for i, result in enumerate(results):
            print(f"\n  Output {i}:")
            print(f"    Shape: {result.shape}")
            print(f"    Data type: {result.dtype}")
            print(f"    Value range: [{result.min():.6f}, {result.max():.6f}]")
            
            # Analyze common YOLO formats
            if len(result.shape) == 3:
                batch, features, anchors = result.shape
                print(f"    📊 Analysis:")
                print(f"      Batch size: {batch}")
                print(f"      Features per detection: {features}")
                print(f"      Number of anchors: {anchors}")
                
                if features == 84:
                    print(f"      🎯 Likely format: [x, y, w, h] + 80 class scores")
                elif features == 85:
                    print(f"      🎯 Likely format: [x, y, w, h, confidence] + 80 class scores")
                elif features >= 5:
                    num_classes = features - 4
                    print(f"      🎯 Likely format: [x, y, w, h] + {num_classes} class scores")
                else:
                    print(f"      ❓ Unknown format")
            
            # Show sample values
            flat = result.flatten()
            print(f"    Sample values: {flat[:10]}")
    
    except Exception as e:
        print(f"  ❌ Inference failed: {e}")
    
    print(f"\n📋 SUMMARY:")
    print(f"Input: {inputs[0].shape} -> Output: {outputs[0].shape}")
    return {
        'input_shape': inputs[0].shape,
        'output_shape': outputs[0].shape,
        'input_name': inputs[0].name,
        'output_name': outputs[0].name
    }

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 2:
        print("Usage: python analyze_model.py path/to/your/model.onnx")
        sys.exit(1)
    
    model_path = sys.argv[1]
    analyze_yolo_model(model_path)