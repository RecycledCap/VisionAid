import tensorflow as tf
import cv2
import numpy as np

interpreter = tf.lite.Interpreter(model_path="coco_yolo11n/experiment2/weights/best_saved_model/best_float32.tflite")
onnx_model = cv2.dnn.readNetFromONNX("coco_yolo11n/experiment2/weights/best.onnx")

def preprocess_img(image):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = cv2.resize(image, (640, 640), interpolation = cv2.INTER_LINEAR)
    image = np.expand_dims(image, axis=0).astype('float32') / 255.
    return image

def predict_onnx_model_outputs(preprocessed_img):
    onnx_model.setInput(preprocessed_img)
    outputs = onnx_model.forward()

    result = outputs[0]
    return result.transpose()

def predict_tflite_model_outputs(preprocessed_img):
    interpreter.allocate_tensors()
        
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    
    interpreter.set_tensor(input_details[0]['index'], preprocessed_img)
    interpreter.invoke()
    output_data = interpreter.get_tensor(output_details[0]['index'])

    result = output_data[0].transpose()
    return result

"""
Code below from:
https://medium.com/@zain.18j2000/how-to-use-custom-or-official-yolov8-object-detection-model-in-onnx-format-ca8f055643df
"""
def filter_Detections(results, thresh = 0.50):
    # if model is trained on 1 class only
    if len(results[0]) == 5:
        # filter out the detections with confidence > thresh
        considerable_detections = [detection for detection in results if detection[4] > thresh]
        considerable_detections = np.array(considerable_detections)
        return considerable_detections

    # if model is trained on multiple classes
    else:
        A = []
        for detection in results:

            class_id = detection[4:].argmax()
            confidence_score = detection[4:].max()

            new_detection = np.append(detection[:4],[class_id,confidence_score])

            A.append(new_detection)

        A = np.array(A)

        # filter out the detections with confidence > thresh
        considerable_detections = [detection for detection in A if detection[-1] > thresh]
        considerable_detections = np.array(considerable_detections)

        return considerable_detections
    
def NMS(boxes, conf_scores, iou_thresh = 0.55):

    #  boxes [[x1,y1, x2,y2], [x1,y1, x2,y2], ...]

    x1 = boxes[:,0]
    y1 = boxes[:,1]
    x2 = boxes[:,2]
    y2 = boxes[:,3]

    areas = (x2-x1)*(y2-y1)

    order = conf_scores.argsort()

    keep = []
    keep_confidences = []

    while len(order) > 0:
        idx = order[-1]
        A = boxes[idx]
        conf = conf_scores[idx]

        order = order[:-1]

        xx1 = np.take(x1, indices= order)
        yy1 = np.take(y1, indices= order)
        xx2 = np.take(x2, indices= order)
        yy2 = np.take(y2, indices= order)

        keep.append(A)
        keep_confidences.append(conf)

        # iou = inter/union

        xx1 = np.maximum(x1[idx], xx1)
        yy1 = np.maximum(y1[idx], yy1)
        xx2 = np.minimum(x2[idx], xx2)
        yy2 = np.minimum(y2[idx], yy2)

        w = np.maximum(xx2-xx1, 0)
        h = np.maximum(yy2-yy1, 0)

        intersection = w*h

        # union = areaA + other_areas - intesection
        other_areas = np.take(areas, indices= order)
        union = areas[idx] + other_areas - intersection

        iou = intersection/union

        boleans = iou < iou_thresh

        order = order[boleans]

        # order = [2,0,1]  boleans = [True, False, True]
        # order = [2,1]

    return keep, keep_confidences

def rescale_back(results, img_w, img_h, modelType):
    cx, cy, w, h, class_id, confidence = results[:,0], results[:,1], results[:,2], results[:,3], results[:,4], results[:,-1]
    
    if modelType == "onnx":
        cx = cx/640.0 * img_w
        cy = cy/640.0 * img_h
        w = w/640.0 * img_w
        h = h/640.0 * img_h
    elif modelType == "tflite":
        cx = cx * img_w
        cy = cy * img_h
        w = w * img_w
        h = h * img_h

    x1 = cx - w/2
    y1 = cy - h/2
    x2 = cx + w/2
    y2 = cy + h/2

    boxes = np.column_stack((x1, y1, x2, y2, class_id))
    keep, keep_confidences = NMS(boxes,confidence)
    print(np.array(keep).shape)
    return keep, keep_confidences

if __name__ == "__main__":
    imgPath = "test.jpg"
    modelType = "onnx" # or "tflite"
    # modelType = "tflite"
    
    original_image = cv2.imread(imgPath)
    image = preprocess_img(original_image)

    if modelType == "onnx":
        image = np.transpose(image, [0, 3, 1, 2]) # type: ignore
        result = predict_onnx_model_outputs(image)
    elif modelType == "tflite":
        result = predict_tflite_model_outputs(image)
    else:
        raise ValueError("Invalid Model Type provided")

    significant_results = filter_Detections(result)
    # print(significant_results)

    img_height, img_width, _ = original_image.shape
    rescaled_results, confidences = rescale_back(significant_results, img_width, img_height, modelType=modelType)

    for res, conf in zip(rescaled_results, confidences):
        print(res)
        x1,y1,x2,y2, cls_id = res
        cls_id = int(cls_id)
        x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)

        conf = "{:.2f}".format(conf)
        # draw the bounding boxes
        cv2.rectangle(original_image,(int(x1),int(y1)),(int(x2),int(y2)),(255,0,255),1)
        cv2.putText(original_image, str(cls_id)+' '+conf,(x1,y1-17),
                    cv2.FONT_HERSHEY_SCRIPT_COMPLEX,1,(255,0,255),1) 
    
        
    cv2.imshow("frame", original_image)
    cv2.waitKey()
    cv2.destroyAllWindows()