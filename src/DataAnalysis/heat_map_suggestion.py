import pandas as pd
import os
import numpy as np
import time
import cv2
import json


def get_frame_from_video(video_path, time_in_ms):
    # Open the video file
    cap = cv2.VideoCapture(video_path)

    # Check if video opened successfully
    if not cap.isOpened():
        print("Error opening video file")

    fps = cap.get(cv2.CAP_PROP_FPS)

    # Set the frame position
    target = int(time_in_ms / (1000 / fps))
    cap.set(cv2.CAP_PROP_POS_FRAMES, target)
    print(f"fps: {fps} frame: {int(time_in_ms / (1000 / fps))}")

    # Read the frame
    ret, frame = cap.read()
    if ret:
        # Save the frame as an image
        return frame, target
    else:
        print("Error reading frame")


def find_mkv_files(directory):
    mkv_files = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".mkv"):
                mkv_files.append(file)
    return mkv_files


def calculate_duration(element_position, suggestion_removal):
    # Convert the 'time' column to datetime
    element_position['time'] = pd.to_datetime(element_position['time'])
    suggestion_removal['time'] = pd.to_datetime(suggestion_removal['time'])

    # Initialize a new column for time difference
    element_position['time_diff'] = None

    # Create a dictionary for faster lookup
    suggestion_dict = {i: json.loads(x)['suggestions'] for i, x in enumerate(suggestion_removal['data'])}

    # Iterate over the element_position DataFrame
    for i, row in element_position.iterrows():
        # Find the matching suggestion_removal event
        suggestion = json.loads(row['data'])['suggestion']
        matching_indices = [index for index, suggestions in suggestion_dict.items() if suggestion in suggestions]

        # If a matching suggestion_removal event is found
        for index in matching_indices:
            if suggestion_removal.iloc[index]['time'] > row['time']:
                # Calculate the time difference in milliseconds
                time_diff = (suggestion_removal.iloc[index]['time'] - row['time']).total_seconds() * 1000000

                # Append the time difference to the element_position event
                element_position.at[i, 'time_diff'] = time_diff
                break
    return element_position


def generate_heat_map(participant_id, condition_id, input_path, output_path, radius=10):
    print(f"Participant {participant_id} Condition {condition_id}")
    name = 'system_time_stamp_ms'
    if participant_id > 918:
        name = 'system_time_stamp_micro'

    gaze_data = pd.read_csv(os.path.join(input_path, str(participant_id), str(condition_id), 'gaze_data.csv'))
    start_time = gaze_data[name].iloc[0]

    print(f"start time {start_time}")

    # Read the CSV file
    generics = pd.read_csv(os.path.join(input_path, 'generic_interactions.csv'))

    # Filter the data
    element_position = generics[
        (generics['participant_id'] == participant_id) &
        (generics['condition_id'] == condition_id) &
        (generics['event'] == 'element_position')
        ]
    suggestion_removal = generics[
        (generics['participant_id'] == participant_id) &
        (generics['condition_id'] == condition_id) &
        (generics['event'] == 'suggestions_removed')
        ]

    element_position = calculate_duration(element_position, suggestion_removal)

    closed_time_frames = 0
    for i, row in element_position.iterrows():
        if row['time_diff'] is None:
            continue

        closed_time_frames += 1
        dt = row['time']

        dt = int(time.mktime(dt.timetuple()) * 1000000 + dt.microsecond) + 2 * 60 * 60 * 1000000  # two hour offset
        rel_event_time_start = dt - start_time
        rel_event_time_end = rel_event_time_start + row['time_diff']

        sample = rel_event_time_start + (rel_event_time_end - rel_event_time_start) * 0.9

        print(
            f"Star: frame {int(rel_event_time_start / 1000000 * 30)} or {round(rel_event_time_start / 1000000, 2)} seconds")
        print(
            f"End: frame {int(rel_event_time_end / 1000000 * 30)} or {round(rel_event_time_end / 1000000, 2)} seconds")
        print(
            f"Sample: frame {int((rel_event_time_start + rel_event_time_end) / 2 / 1000000 * 30)} or {round(sample / 1000000, 2)} seconds")

        videos = find_mkv_files(os.path.join(input_path, str(participant_id), str(condition_id)))

        if len(videos) == 0:
            print(f"No video found for participant {participant_id} condition {condition_id}")
            return
        elif len(videos) > 1:
            print(f"More than one video found for participant {participant_id} condition {condition_id}")
            return

        frame, target = get_frame_from_video(
            os.path.join(input_path, str(participant_id), str(condition_id), videos[0]),
            sample / 1000)

        frame_height, frame_width = frame.shape[:2]

        heatmap_data = np.zeros((frame_height, frame_width))
        # Filter the eye tracking data based on the time interval
        interval_data = gaze_data[(gaze_data['system_time_stamp_micro'] >= dt) & (
                    gaze_data['system_time_stamp_micro'] <= dt + row['time_diff'])]
        # Drop rows with NaNs in the gaze point columns
        interval_data = interval_data.dropna(
            subset=['left_gaze_point_on_display_area_0', 'left_gaze_point_on_display_area_1',
                    'right_gaze_point_on_display_area_0', 'right_gaze_point_on_display_area_1'])

        # Iterate over the eye tracking data in the interval
        for _, data_point in interval_data.iterrows():
            # Calculate the average gaze point
            x = int(((data_point['left_gaze_point_on_display_area_0'] + data_point[
                'right_gaze_point_on_display_area_0']) / 2) * frame_width)
            y = int(((data_point['left_gaze_point_on_display_area_1'] + data_point[
                'right_gaze_point_on_display_area_1']) / 2) * frame_height)

            # Draw a circle on the heatmap data at the gaze point
            cv2.circle(heatmap_data, (x, y), radius, (255, 255, 255), -1)

        # Normalize the heatmap data to range 0-255 if possible
        if heatmap_data.max() > heatmap_data.min():
            heatmap_data = ((heatmap_data - heatmap_data.min()) * (
                    255 / (heatmap_data.max() - heatmap_data.min()))).astype(np.uint8)

            # Generate the heatmap
            heatmap = cv2.applyColorMap(heatmap_data, cv2.COLORMAP_JET)
            # Convert the original frame to float
            frame_float = frame.astype(float)

            # Blend the heatmap and the frame
            blended = cv2.addWeighted(frame_float, 0.7, heatmap.astype(float), 0.3, 0)

            # Convert the blended image back to uint8
            blended = blended.astype(np.uint8)
        else:
            blended = frame

        data = json.loads(row['data'])
        bbox = data['bounding_box']
        screen = data['window']['screen']

        # Normalize the bounding box coordinates
        x = int(bbox['x'] * frame_width / screen['width'])
        y = int(bbox['y'] * frame_height / screen['height'])
        w = int(bbox['width'] * frame_width / screen['width'])
        h = int(bbox['height'] * frame_height / screen['height'])

        # Draw the rectangle on the blended image
        cv2.rectangle(blended, (x, y), (x + w, y + h), (0, 255, 0), 2)  # Green rectangle with thickness of 2

        # Add a note to the image
        note = f"Timeframe: {round(row['time_diff'] / 1000, 1)} ms"
        cv2.putText(blended, note, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)

        output_dir = os.path.join(output_path, str(participant_id), str(condition_id))
        os.makedirs(output_dir, exist_ok=True)
        cv2.imwrite(os.path.join(output_dir, f"frame_{target}.jpg"), blended)

    print(
        f"Closed time frames: {closed_time_frames} out of {len(element_position)}, {closed_time_frames / len(element_position) * 100}%")


if __name__ == "__main__":
    generate_heat_map(920, 30, "raw_data", "results")
