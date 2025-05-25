import os
import shutil
import json

IMAGE_FILENAME_WIDTH = 12

TRAIN_ANNOTATION_PATH = "data/annotations/instances_train2017.json"
VAL_ANNOTATION_PATH = "data/annotations/instances_val2017.json"

TRAIN_PATH = "data/images/train2017"
VAL_PATH = "data/images/val2017"
TEST_PATH = "data/images/test2017"

def extract_coco_annotation_data(annotation_filepath: str):
    image_data = {}

    with open(annotation_filepath) as f:
        data = json.load(f)
        annotations = data['annotations']
        categories = {category["id"]: (category["name"], category["supercategory"]) for category in data["categories"]}

    for annotation in annotations:
        image_id = annotation['image_id']
        category_id = annotation['category_id']
        bbox = annotation['bbox']
        segmentation = annotation['segmentation']

        image_data.setdefault(image_id, list())
        image_data[image_id].append((category_id, bbox, segmentation))

    return categories, image_data

def dict_subset(original: dict, size: int):
    sub = {}
    count = 0
    for image_id, val in original.items():
        sub[image_id] = val

        count += 1
        if count == size:
            break

    return sub

categories, image_data = extract_coco_annotation_data(TRAIN_ANNOTATION_PATH)
_, val_img_data = extract_coco_annotation_data(VAL_ANNOTATION_PATH)
categories_tuple = tuple(categories.keys())

def remap_category_id(original_id):
    return categories_tuple.index(original_id)

def normalize_bbox(bbox, image_width, image_height):
    x, y, width, height = bbox
    x_center = (x + width / 2) / image_width
    y_center = (y + height / 2) / image_height
    width /= image_width
    height /= image_height
    return x_center, y_center, width, height

def normalize_segmentation(segmentation, image_width, image_height):
    normalized_segmentation = []
    for polygon in segmentation:  # Handle multiple polygons if present
        normalized_polygon = []
        for i in range(0, len(polygon), 2):  # Iterate over x, y pairs
            x = float(polygon[i]) / image_width
            y = float(polygon[i + 1]) / image_height
            print(x, y)
            normalized_polygon.extend([x, y])
        normalized_segmentation.append(normalized_polygon)
    return normalized_segmentation

def create_label_files(image_dict, output_dir, image_width, image_height):
    os.makedirs(output_dir, exist_ok=True)
    for image_id, objects in image_dict.items():
        filename = str(image_id).zfill(IMAGE_FILENAME_WIDTH) + ".txt"
        filepath = os.path.join(output_dir, filename)
        with open(filepath, "w") as f:
            for category_id, bbox, segmentation in objects:
                # x_center, y_center, width, height = normalize_bbox(bbox, image_width, image_height)
                normalized_segmentation = normalize_segmentation(segmentation, image_width, image_height)
                
                segmented_str = ""
                for polygon in normalized_segmentation:
                    for num in polygon:
                        segmented_str += str(num)
                        segmented_str += " "

                f.write(f"{remap_category_id(category_id)} {segmented_str}\n")

def copy_images(image_dict, src_dir, dst_dir):
    os.makedirs(dst_dir, exist_ok=True)
    for image_id in image_dict.keys():
        filename = str(image_id).zfill(IMAGE_FILENAME_WIDTH) + ".jpg"
        src_path = os.path.join(src_dir, filename)
        dst_path = os.path.join(dst_dir, filename)
        if os.path.exists(src_path):
            shutil.copy2(src_path, dst_path)

if __name__ == "__main__":
    TRAIN_SIZE = 6000
    VAL_SIZE = 300

    sub_train = dict_subset(image_data, TRAIN_SIZE)
    sub_val = dict_subset(val_img_data, VAL_SIZE)

    image_height = 480
    image_width = 640

    # Create folder structure
    os.makedirs("data_sub/labels/train", exist_ok=True)
    os.makedirs("data_sub/labels/val", exist_ok=True)
    os.makedirs("data_sub/train", exist_ok=True)
    os.makedirs("data_sub/val", exist_ok=True)

    # Write label files
    create_label_files(sub_train, "data_sub/labels/train", image_width, image_height)
    create_label_files(sub_val, "data_sub/labels/val", image_width, image_height)

    # Copy images
    copy_images(sub_train, TRAIN_PATH, "data_sub/train")
    copy_images(sub_val, VAL_PATH, "data_sub/val")
