import seaborn as sns
import os
import time
import json
import pandas as pd
from bs4 import BeautifulSoup
import difflib
from spellchecker import SpellChecker
import matplotlib.pyplot as plt
import cv2
import numpy as np
from scipy.ndimage import gaussian_filter
import concurrent.futures
from skimage.draw import disk
from PIL import Image


def plot_pupil_dialation(args):
    participant_id, condition_id, poly_degree, raw_data_dir, results_dir = args
    participant_dir = os.path.join(raw_data_dir, participant_id)
    condition_dir = os.path.join(participant_dir, condition_id)

    # Load the gaze data
    gaze_data = pd.read_csv(os.path.join(condition_dir, "gaze_data.csv"))

    # Identify gaps in the data
    gaps = gaze_data["left_pupil_diameter"].isnull()

    b = gaps.shift(1, fill_value=False).infer_objects(copy=False)

    gap_starts = (gaps & ~b).to_numpy().nonzero()[0]
    gap_ends = (~gaps & b).to_numpy().nonzero()[0]

    if gaps[-1] & ~b[-1]:
        gap_starts = gap_starts[:-1]
    # TODO: sometimes gap_ends is one bigger than gap_starts, this might be caused due to the very first value and the
    # shift

    # Calculate the largest gap
    gap_lengths = gap_ends - gap_starts
    max_gap_index = gap_lengths.argmax()
    max_gap_start, max_gap_end = gap_starts[max_gap_index], gap_ends[max_gap_index]
    max_gap_length = gap_lengths[max_gap_index]

    # Perform the rest of your analysis here...

    # Add the max gap to the plot title
    plt.title(f"Left Pupil Diameter Over Time for Participant {participant_id}, Condition {condition_id}\n"
              f"Largest gap in eyetracking data: {max_gap_length} frames")

    # Mark the largest gap in the graph
    plt.axvspan(
        (gaze_data["system_time_stamp_micro"][max_gap_start] - gaze_data["system_time_stamp_micro"][0]) / (
                    1000 * 1000 * 60),
        (gaze_data["system_time_stamp_micro"][max_gap_end] - gaze_data["system_time_stamp_micro"][0]) / (
                    1000 * 1000 * 60),
        color='red', alpha=0.5)

    # Plot of the left pupil diameter over time
    time = (gaze_data["system_time_stamp_micro"] - gaze_data["system_time_stamp_micro"][0]) / (1000 * 1000 * 60)
    pupil_diameter = gaze_data["left_pupil_diameter"]

    # Remove NaN values
    valid_indices = ~np.isnan(time) & ~np.isnan(pupil_diameter)
    time = time[valid_indices]
    pupil_diameter = pupil_diameter[valid_indices]

    # Fit a polynomial of degree poly_degree to the data
    coefficients = np.polyfit(time, pupil_diameter, poly_degree)
    trendline = np.poly1d(coefficients)

    plt.plot(time, pupil_diameter, label="Data", linewidth=0.5)  # Adjust line width here
    plt.plot(time, trendline(time), label="Trendline", color="red", linewidth=0.5)  # Adjust line width here
    plt.xlabel("Time (min)")
    plt.ylabel("Left Pupil Diameter")
    plt.legend()
    plt.savefig(os.path.join(results_dir, f"{participant_id}_{condition_id}_left_pupil_diameter.svg"),
                format='svg')  # Save as SVG
    plt.close()


def create_suggestion_heatmap(args):
    participant_id, condition_id, raw_data_dir, results_dir = args
    # Load the gaze data
    gaze_data = pd.read_csv(os.path.join(raw_data_dir, participant_id, condition_id, "gaze_data.csv"))

    coordinates = gaze_data[["left_gaze_point_on_display_area_0",
                             "left_gaze_point_on_display_area_1",
                             "right_gaze_point_on_display_area_0",
                             "right_gaze_point_on_display_area_1"]]

    # Filter rows where both coordinates of either eye are NaN
    filtered_data = coordinates[
        ~(
                (coordinates["left_gaze_point_on_display_area_0"].isna() & coordinates[
                    "left_gaze_point_on_display_area_1"].isna()) |
                (coordinates["right_gaze_point_on_display_area_0"].isna() & coordinates[
                    "right_gaze_point_on_display_area_1"].isna())
        )
    ]

    # Clamp the values between 0 and 1
    filtered_data = filtered_data.clip(lower=0, upper=1)

    # Create new columns for average gaze points
    filtered_data['avg_gaze_point_on_display_area_0'] = np.nan
    filtered_data['avg_gaze_point_on_display_area_1'] = np.nan

    # If both eyes have valid data, average the coordinates
    mask_both_valid = (~filtered_data["left_gaze_point_on_display_area_0"].isna() & ~filtered_data[
        "left_gaze_point_on_display_area_1"].isna() &
                       ~filtered_data["right_gaze_point_on_display_area_0"].isna() & ~filtered_data[
                "right_gaze_point_on_display_area_1"].isna())
    filtered_data.loc[mask_both_valid, 'avg_gaze_point_on_display_area_0'] = filtered_data.loc[
        mask_both_valid, ['left_gaze_point_on_display_area_0', 'right_gaze_point_on_display_area_0']].mean(axis=1)
    filtered_data.loc[mask_both_valid, 'avg_gaze_point_on_display_area_1'] = filtered_data.loc[
        mask_both_valid, ['left_gaze_point_on_display_area_1', 'right_gaze_point_on_display_area_1']].mean(axis=1)

    # If only left eye has valid data, use its coordinates
    mask_left_valid = (~filtered_data["left_gaze_point_on_display_area_0"].isna() & ~filtered_data[
        "left_gaze_point_on_display_area_1"].isna())
    filtered_data.loc[mask_left_valid, 'avg_gaze_point_on_display_area_0'] = filtered_data.loc[
        mask_left_valid, 'left_gaze_point_on_display_area_0']
    filtered_data.loc[mask_left_valid, 'avg_gaze_point_on_display_area_1'] = filtered_data.loc[
        mask_left_valid, 'left_gaze_point_on_display_area_1']

    # If only right eye has valid data, use its coordinates
    mask_right_valid = (~filtered_data["right_gaze_point_on_display_area_0"].isna() & ~filtered_data[
        "right_gaze_point_on_display_area_1"].isna())
    filtered_data.loc[mask_right_valid, 'avg_gaze_point_on_display_area_0'] = filtered_data.loc[
        mask_right_valid, 'right_gaze_point_on_display_area_0']
    filtered_data.loc[mask_right_valid, 'avg_gaze_point_on_display_area_1'] = filtered_data.loc[
        mask_right_valid, 'right_gaze_point_on_display_area_1']

    # Create a 2D histogram of the average gaze points
    heatmap_data, xedges, yedges = np.histogram2d(filtered_data['avg_gaze_point_on_display_area_0'],
                                                  filtered_data['avg_gaze_point_on_display_area_1'],
                                                  bins=[np.linspace(0, 1, 100), np.linspace(0, 1, 100)])

    # Plot the heatmap
    plt.figure(figsize=(10, 8))
    sns.heatmap(heatmap_data.T, cmap='hot', xticklabels=False, yticklabels=False)
    # Add the IDs to the title
    plt.title(f'Heatmap of Gaze Points for Participant {participant_id}, Condition {condition_id}')

    # Save the heatmap to a specific directory
    output_dir = os.path.join(results_dir, participant_id, condition_id)
    os.makedirs(output_dir, exist_ok=True)
    plt.savefig(os.path.join(output_dir, 'heatmap.png'))

    plt.close()


def get_frame_from_video(video_path, time_in_ms):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("Error opening video file")
        return None, None

    fps = cap.get(cv2.CAP_PROP_FPS)
    target = int(time_in_ms / (1000 / fps))
    cap.set(cv2.CAP_PROP_POS_FRAMES, target)

    ret, frame = cap.read()
    if not ret:
        print("Error reading frame")
        return None, None

    return frame, target


def find_mkv_files(directory):
    return [file for root, dirs, files in os.walk(directory) for file in files if file.endswith(".mkv")]


def calculate_duration_since_position_event(generic_interactions, participant_id, condition_id):
    pd.options.mode.chained_assignment = None  # default='warn'
    element_position = generic_interactions[
        (generic_interactions['participant_id'] == participant_id) &
        (generic_interactions['condition_id'] == condition_id) &
        (generic_interactions['event'] == 'element_position')
        ]
    suggestion_removal = generic_interactions[
        (generic_interactions['participant_id'] == participant_id) &
        (generic_interactions['condition_id'] == condition_id) &
        (generic_interactions['event'] == 'suggestions_removed')
        ]

    element_position['time'] = pd.to_datetime(element_position['time'])
    suggestion_removal['time'] = pd.to_datetime(suggestion_removal['time'])

    element_position['time_diff'] = None
    suggestion_dict = {i: json.loads(x)['suggestions'] for i, x in enumerate(suggestion_removal['data'])}

    for i, row in element_position.iterrows():
        suggestion = json.loads(row['data'])['suggestion']
        matching_indices = [index for index, suggestions in suggestion_dict.items() if suggestion in suggestions]

        for index in matching_indices:
            if suggestion_removal.iloc[index]['time'] > row['time']:
                time_diff = (suggestion_removal.iloc[index]['time'] - row['time']).total_seconds() * 1000000
                element_position.at[i, 'time_diff'] = time_diff
                break

    pd.options.mode.chained_assignment = 'warn'
    return element_position


def generate_heat_map_suggestion(participant_id, condition_id, input_path, output_path, radius=10):
    gaze_data = pd.read_csv(os.path.join(input_path, str(participant_id), str(condition_id), 'gaze_data.csv'))
    start_time = gaze_data['system_time_stamp_micro'].iloc[0]

    element_position = calculate_duration_since_position_event(
        pd.read_csv(os.path.join(input_path, 'generic_interactions.csv')),
        participant_id, condition_id)

    videos = find_mkv_files(os.path.join(input_path, str(participant_id), str(condition_id)))
    if len(videos) != 1:
        print(f"Expected one video for participant {participant_id} condition {condition_id}, found {len(videos)}")
        return

    for i, row in element_position.iterrows():
        if row['time_diff'] is None:
            continue

        dt = int(time.mktime(row['time'].timetuple()) * 1000000 + row['time'].microsecond) + 2 * 60 * 60 * 1000000
        rel_event_time_start = dt - start_time
        rel_event_time_end = rel_event_time_start + row['time_diff']
        sample = rel_event_time_start + (rel_event_time_end - rel_event_time_start) * 0.9

        frame, target = get_frame_from_video(
            os.path.join(input_path, str(participant_id), str(condition_id), videos[0]),
            sample / 1000
        )
        if frame is None:
            continue

        frame_height, frame_width = frame.shape[:2]
        heatmap_data = np.zeros((frame_height, frame_width))

        interval_data = gaze_data[(gaze_data['system_time_stamp_micro'] >= dt) & (
                gaze_data['system_time_stamp_micro'] <= dt + row['time_diff'])]
        interval_data = interval_data.dropna(
            subset=['left_gaze_point_on_display_area_0', 'left_gaze_point_on_display_area_1',
                    'right_gaze_point_on_display_area_0', 'right_gaze_point_on_display_area_1'])

        for _, data_point in interval_data.iterrows():
            x = int(((data_point['left_gaze_point_on_display_area_0'] + data_point[
                'right_gaze_point_on_display_area_0']) / 2) * frame_width)
            y = int(((data_point['left_gaze_point_on_display_area_1'] + data_point[
                'right_gaze_point_on_display_area_1']) / 2) * frame_height)
            cv2.circle(heatmap_data, (x, y), radius, (255, 255, 255), -1)

        if heatmap_data.max() > heatmap_data.min():
            heatmap_data = ((heatmap_data - heatmap_data.min()) * (
                    255 / (heatmap_data.max() - heatmap_data.min()))).astype(np.uint8)
            heatmap = cv2.applyColorMap(heatmap_data, cv2.COLORMAP_JET)
            frame_float = frame.astype(float)
            blended = cv2.addWeighted(frame_float, 0.7, heatmap.astype(float), 0.3, 0).astype(np.uint8)
        else:
            blended = frame

        data = json.loads(row['data'])
        bbox = data['bounding_box']
        screen = data['window']['screen']

        x = int(bbox['x'] * frame_width / screen['width'])
        y = int(bbox['y'] * frame_height / screen['height'])
        w = int(bbox['width'] * frame_width / screen['width'])
        h = int(bbox['height'] * frame_height / screen['height'])

        cv2.rectangle(blended, (x, y), (x + w, y + h), (0, 255, 0), 2)
        note = f"Timeframe: {round(row['time_diff'] / 1000, 1)} ms"
        cv2.putText(blended, note, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)

        output_dir = os.path.join(output_path, str(participant_id), str(condition_id))
        os.makedirs(output_dir, exist_ok=True)
        cv2.imwrite(os.path.join(output_dir, f"frame_{target}.jpg"), blended)
    return f"{participant_id}_{condition_id}"


def generate_all_heat_map_suggestion(participant_ids, condition_ids, input_path, output_path):
    with concurrent.futures.ProcessPoolExecutor() as executor:
        futures = [executor.submit(generate_heat_map_suggestion, participant_id, condition_id, input_path, output_path)
                   for participant_id in participant_ids for condition_id in condition_ids]
        for future in concurrent.futures.as_completed(futures):
            print(f"Completed heatmap for {future.result()}")


def generate_heat_map_total(participant_id, condition_id, input_path, output_path, width=1920, height=1080, radius=10):
    path = os.path.join(input_path, str(participant_id), str(condition_id), 'gaze_data.csv')

    # Read the CSV file into a pandas DataFrame
    gaze_data = pd.read_csv(path)

    # Select the four important columns
    gaze_data = gaze_data[['left_gaze_point_on_display_area_0', 'left_gaze_point_on_display_area_1',
                           'right_gaze_point_on_display_area_0', 'right_gaze_point_on_display_area_1']]

    # Remove rows with NaN values
    gaze_data.dropna(inplace=True)

    # Average the coordinates for the left and right eye
    avg_x = ((gaze_data['left_gaze_point_on_display_area_0'] + gaze_data[
        'right_gaze_point_on_display_area_0']) / 2 * width).astype(int)
    avg_y = ((gaze_data['left_gaze_point_on_display_area_1'] + gaze_data[
        'right_gaze_point_on_display_area_1']) / 2 * height).astype(int)

    # Create an empty heatmap as a dense numpy array
    heatmap = np.zeros((height, width), dtype=np.float32)

    # Add a circular region around each gaze point to the heatmap
    for x, y in zip(avg_x, avg_y):
        rr, cc = disk((y, x), radius, shape=heatmap.shape)
        heatmap[rr, cc] += 1

    # Apply Gaussian blur
    heatmap = gaussian_filter(heatmap, sigma=radius)

    # Normalize the heatmap if it's not all zeros
    if np.max(heatmap) > 0:
        heatmap /= np.max(heatmap)

    # Save the heatmap as an image
    if np.any(heatmap):
        heatmap = (heatmap * 255).astype(np.uint8)
        img = Image.fromarray(heatmap)
        img.save(os.path.join(output_path, 'heatmaps', f'{participant_id}_{condition_id}_heatmap.png'))

    return f"{participant_id}_{condition_id}"


def generate_heatmaps_for_participants_and_conditions(participant_ids, condition_ids, input_path, output_path):
    with concurrent.futures.ProcessPoolExecutor() as executor:
        futures = [executor.submit(generate_heat_map_total, participant_id, condition_id, input_path, output_path)
                   for participant_id in participant_ids for condition_id in condition_ids]
        for future in concurrent.futures.as_completed(futures):
            print(f"Completed heatmap for {future.result()}")


def typing_speed_analysis(keyboard_interactions, output_path, generate_box_plots=False):
    # Read the CSV data
    data = pd.read_csv(keyboard_interactions)
    data.dropna(inplace=True)

    # Convert 'metaData' from JSON string to dictionary
    data['metaData'] = data['metaData'].apply(json.loads)

    # Extract 'text' from 'metaData'
    data['text'] = data['metaData'].apply(lambda x: x.get('text'))

    # Filter out rows where the 'text' is the same as the previous one
    data = data[data['text'] == data['text'].shift()]

    # Convert 'time' to datetime and sort by it
    data['time'] = pd.to_datetime(data['time'])
    data = data.sort_values('time')

    # Calculate typing speed for each condition
    # somehow apply didn't work

    conditions = sorted(data['condition_id'].unique())
    typing_speeds = {}
    pd.options.mode.chained_assignment = None  # default='warn'
    for condition in conditions:
        condition_data = data[data['condition_id'] == condition]

        # Break down the typing speed calculation
        grouped_data = condition_data.groupby('participant_id')
        for name, group in grouped_data:
            num_keystrokes = len(group)
            time_diff = (group['time'].max() - group['time'].min()).total_seconds()
            typing_speed = num_keystrokes / time_diff if time_diff > 0 else 0

            if condition in typing_speeds:
                typing_speeds[condition].append(typing_speed)
            else:
                typing_speeds[condition] = [typing_speed]

    pd.options.mode.chained_assignment = 'warn'

    if generate_box_plots:
        plt.figure(figsize=(10, 6))
        # Sort the dictionary by keys (condition_id)
        sorted_typing_speeds = dict(sorted(typing_speeds.items()))
        for condition_id, speeds in sorted_typing_speeds.items():
            plt.boxplot(speeds, vert=False, positions=[condition_id], widths=0.6)
        plt.title('Box-Whisker Plot of Typing Speeds for All Conditions')
        plt.xlabel('Typing Speed (keystrokes per second)')
        plt.yticks(list(sorted_typing_speeds.keys()), list(sorted_typing_speeds.keys()))
        os.makedirs(output_path, exist_ok=True)
        plt.savefig(os.path.join(output_path, 'box_plot_typing_speed_all_conditions.png'), format='png')

    mean = {condition_id: np.mean(speeds) for condition_id, speeds in typing_speeds.items()}
    median = {condition_id: np.median(speeds) for condition_id, speeds in typing_speeds.items()}
    std = {condition_id: np.std(speeds) for condition_id, speeds in typing_speeds.items()}
    print(f"Mean: {mean}\nMedian: {median}\nStandard Deviation: {std}")
    print(typing_speeds)


def find_suggestions_in_text(full_text, suggestions):
    full_text = full_text.lower()
    suggestions = [suggestion.lower() for suggestion in suggestions]
    # Initialize a dictionary to hold the suggestions and their matches
    suggestion_matches = {}

    # Iterate over each suggestion
    for suggestion in suggestions:
        # Initialize a SequenceMatcher object
        sm = difflib.SequenceMatcher(None, full_text, suggestion)

        # Find the blocks of matching subsequences
        for match in sm.get_matching_blocks():
            # If the length of the match is greater than half the length of the suggestion, consider it a match
            if match.size > 10:
                # Get the matching substring from the full text
                matching_substring = full_text[match.a: match.a + match.size]

                # Check if the suggestion already has a match
                done = False
                if suggestion in suggestion_matches:
                    for i, existing_match in enumerate(suggestion_matches[suggestion]):
                        # check if the existing match is part of the new match
                        if existing_match['match'] in matching_substring:
                            suggestion_matches[suggestion][i] = {
                                'match': matching_substring,
                                'start': match.a,
                                'end': match.a + match.size
                            }
                            done = True
                            break

                        elif matching_substring in existing_match['match']:
                            done = True
                            break
                    if not done:
                        # If the suggestion already has a match but does not contain or is not contained in an existing
                        # one, add it
                        suggestion_matches[suggestion].append({
                            'match': matching_substring,
                            'start': match.a,
                            'end': match.a + match.size
                        })
                else:
                    # If the suggestion does not have a match yet, add the new match
                    suggestion_matches[suggestion] = [{
                        'match': matching_substring,
                        'start': match.a,
                        'end': match.a + match.size
                    }]

    return suggestion_matches


def write_latex_highlighted_text_to_file(full_text: str, suggestion_matches, filename: str) -> None:
    # Flatten the matches and sort them by their start position
    matches = sorted(
        [(match_info['start'], match_info['end'], suggestion) for suggestion, matches in suggestion_matches.items() for
         match_info in matches],
        key=lambda x: x[0]
    )

    # Initialize the LaTeX text
    latex_text = "\\begin{figure}[H]\n\\centering\n\\begin{mybox}\n"

    # Initialize the last end position
    last_end = 0

    # Iterate over the matches
    for start, end, suggestion in matches:
        # Add the non-highlighted text
        latex_text += full_text[last_end:start].replace("\n", " ")

        # Add the highlighted text
        latex_text += "\\colorbox{yellow}{" + full_text[start:end].replace("\n", " ") + "}"

        # Update the last end position
        last_end = end

    # Add the remaining non-highlighted text
    latex_text += full_text[last_end:].replace("\n", " ")

    # Close the mybox and figure environments
    latex_text += "\n\\end{mybox}\n\\caption{User document with AI suggestion highlighted}\n\\label{fig:document_hightlighted}\n\\end{figure}"

    os.makedirs(os.path.dirname(filename), exist_ok=True)
    # Write the LaTeX text to the specified file
    with open(filename, 'w') as f:
        f.write(latex_text)


def calculate_ai_part(generic_interactions, input_path, output_path, generate_tex=False, generate_box_plots=False):
    df = pd.read_csv(generic_interactions)
    participant_ids = df['participant_id'].unique()
    condition_ids = df['condition_id'].unique()

    def extract_suggestions(data):
        return json.loads(data)['selected']

    ai_text_percentages = {}

    for participant_id in participant_ids:
        participant_id = int(participant_id)
        for condition_id in condition_ids:
            # skipp the baseline condition
            if condition_id == 29:
                continue

            condition_id = int(condition_id)

            pd.options.mode.chained_assignment = None  # default='warn'
            used_suggestions = df[
                (df['participant_id'] == participant_id) &
                (df['condition_id'] == condition_id) &
                (df['event'] == 'suggestion_inserted')
                ]
            used_suggestions['data'] = used_suggestions['data'].apply(extract_suggestions)
            pd.options.mode.chained_assignment = 'warn'

            with open(os.path.join(input_path, str(participant_id), str(condition_id), 'document.html'), 'r') as f:
                contents = f.read()

            text = BeautifulSoup(contents, 'html.parser').text
            matches = find_suggestions_in_text(text, used_suggestions['data'].tolist())
            if generate_tex:
                write_latex_highlighted_text_to_file(text,
                                                     matches,
                                                     os.path.join(output_path, str(participant_id), str(condition_id),
                                                                  'document.tex'))

            if condition_id in ai_text_percentages:
                ai_text_percentages[condition_id].append(
                    sum([len(match['match']) for matches in matches.values() for match in matches]) / len(text))
            else:
                ai_text_percentages[condition_id] = [
                    sum([len(match['match']) for matches in matches.values() for match in matches]) / len(text)]

    if generate_box_plots:
        plt.figure(figsize=(10, 6))
        # Sort the dictionary by keys (condition_id)
        sorted_ai_text_percentages = dict(sorted(ai_text_percentages.items()))
        for condition_id, text_percentages in sorted_ai_text_percentages.items():
            plt.boxplot(text_percentages, vert=False, positions=[condition_id], widths=0.6)
        plt.title('Box-Whisker Plot of AI Text Suggestions for All Conditions')
        plt.xlabel('Percentage of AI Text Suggestions')
        plt.yticks(list(sorted_ai_text_percentages.keys()), list(sorted_ai_text_percentages.keys()))
        os.makedirs(output_path, exist_ok=True)
        plt.savefig(os.path.join(output_path, 'box_plot_ai_text_percentage_all_conditions.png'), format='png')

    mean = {condition_id: np.mean(text_percentages) for condition_id, text_percentages in ai_text_percentages.items()}
    median = {condition_id: np.median(text_percentages) for condition_id, text_percentages in ai_text_percentages.items()}
    std = {condition_id: np.std(text_percentages) for condition_id, text_percentages in ai_text_percentages.items()}
    print(f"Mean: {mean}\nMedian: {median}\nStandard Deviation: {std}")

    print(ai_text_percentages)

    return ai_text_percentages


def spelling_error_rate(input_path, output_path, generate_box_plots=False):
    error_rates = {}
    for participant_id in os.listdir(input_path):
        if not os.path.isdir(os.path.join(input_path, participant_id)):
            continue
        for condition_id in os.listdir(os.path.join(input_path, participant_id)):
            if not os.path.isdir(os.path.join(input_path, participant_id, condition_id)):
                continue

            with open(os.path.join(input_path, participant_id, condition_id, 'document.html'), 'r') as f:
                contents = f.read()

            text = BeautifulSoup(contents, 'html.parser').text

            spell = SpellChecker()
            words = spell.split_words(text)
            errors = spell.unknown(words)

            condition_id = int(condition_id)
            if condition_id in error_rates:
                error_rates[condition_id].append(len(errors) / len(words))
            else:
                error_rates[condition_id] = [len(errors) / len(words)]

    if generate_box_plots:
        plt.figure(figsize=(10, 6))
        # Sort the dictionary by keys (condition_id)
        sorted_error_rates = dict(sorted(error_rates.items()))
        for condition_id, rates in sorted_error_rates.items():
            plt.boxplot(rates, vert=False, positions=[condition_id], widths=0.6)
        plt.title('Box-Whisker Plot of Spelling Error Rates for All Conditions')
        plt.xlabel('Spelling Error Rate')
        plt.yticks(list(sorted_error_rates.keys()), list(sorted_error_rates.keys()))
        os.makedirs(output_path, exist_ok=True)
        plt.savefig(os.path.join(output_path, 'box_plot_spelling_error_rate_all_conditions.png'), format='png')

    mean = {condition_id: np.mean(rates) for condition_id, rates in error_rates.items()}
    median = {condition_id: np.median(rates) for condition_id, rates in error_rates.items()}
    std = {condition_id: np.std(rates) for condition_id, rates in error_rates.items()}
    print(f"Mean: {mean}\nMedian: {median}\nStandard Deviation: {std}")
    return error_rates


def calculate_idle_time(input_path, output_path, generate_box_plots=False, lower_threshold=2.0, upper_threshold=30.0):
    df = pd.read_csv(os.path.join(input_path, 'keyboard_interactions.csv'))
    participant_ids = df['participant_id'].unique()
    condition_ids = df['condition_id'].unique()

    idle_times = {}
    for participant_id in participant_ids:
        participant_id = int(participant_id)
        for condition_id in condition_ids:
            condition_id = int(condition_id)
            condition_data = df[(df['participant_id'] == participant_id) & (df['condition_id'] == condition_id)]

            pd.options.mode.chained_assignment = None  # default='warn'
            condition_data['time'] = pd.to_datetime(condition_data['time'])
            pd.options.mode.chained_assignment = 'warn'

            condition_data = condition_data.sort_values('time')
            idle_time = (condition_data['time'].shift(-1) - condition_data['time']).dt.total_seconds()
            idle_time = idle_time.dropna()
            # Apply thresholding
            idle_time = idle_time[(lower_threshold < idle_time) & (idle_time < upper_threshold)]
            if condition_id in idle_times:
                idle_times[condition_id].extend(idle_time.tolist())
            else:
                idle_times[condition_id] = idle_time.tolist()

    if generate_box_plots:
        plt.figure(figsize=(10, 6))
        # Sort the dictionary by keys (condition_id)
        sorted_idle_times = dict(sorted(idle_times.items()))
        for condition_id, times in sorted_idle_times.items():
            plt.boxplot(times, vert=False, positions=[condition_id], widths=0.6)
        plt.title('Box-Whisker Plot of Idle Times for All Conditions')
        plt.xlabel('Idle Time (seconds)')
        plt.yticks(list(sorted_idle_times.keys()), list(sorted_idle_times.keys()))
        os.makedirs(output_path, exist_ok=True)
        plt.savefig(os.path.join(output_path, 'box_plot_idle_time_all_conditions.png'), format='png')

    mean = {condition_id: np.mean(times) for condition_id, times in idle_times.items()}
    median = {condition_id: np.median(times) for condition_id, times in idle_times.items()}
    var = {condition_id: np.var(times) for condition_id, times in idle_times.items()}

    print(f"Mean: {mean}\nMedian: {median}\nVariance: {var}")


def calculate_duration_since_display(generic_interactions, participant_id, condition_id):
    suggestions_displayed = generic_interactions[
        (generic_interactions['participant_id'] == participant_id) &
        (generic_interactions['condition_id'] == condition_id) &
        (generic_interactions['event'] == 'suggestions_displayed')
        ]
    suggestion_removal = generic_interactions[
        (generic_interactions['participant_id'] == participant_id) &
        (generic_interactions['condition_id'] == condition_id) &
        (generic_interactions['event'] == 'suggestions_removed')
        ]

    suggestions_displayed['time'] = pd.to_datetime(suggestions_displayed['time'])
    suggestion_removal['time'] = pd.to_datetime(suggestion_removal['time'])

    suggestions_displayed['time_diff'] = None
    suggestion_dict = {i: json.loads(x)['suggestions'] for i, x in enumerate(suggestion_removal['data'])}

    for i, row in suggestions_displayed.iterrows():
        removed_suggestions = json.loads(row['data'])['suggestions']
        matching_indices = [index for index, suggestions in suggestion_dict.items() if
                            removed_suggestions == suggestions]

        for index in matching_indices:
            if suggestion_removal.iloc[index]['time'] > row['time']:
                time_diff = (suggestion_removal.iloc[index]['time'] - row['time']).total_seconds() * 1000000
                suggestions_displayed.at[i, 'time_diff'] = time_diff
                break

    return suggestions_displayed


def time_to_first_fixation_and_duration(input_path, output_path, generate_box_plots=False, max_time_first_fixation=5000,
                                        max_fixation_duration=20000):
    generics = pd.read_csv(os.path.join(input_path, 'generic_interactions.csv'))
    participant_ids = generics['participant_id'].unique()
    condition_ids = generics['condition_id'].unique()

    first_fixations = {}
    fixation_duration = {}

    for participant in participant_ids:
        # the first two don't have the position of the displayed suggestion
        if participant in [912, 913]:
            continue
        for condition in condition_ids:
            # Skip the baseline condition
            if condition == 29 or not os.path.exists(os.path.join(input_path, str(participant), str(condition))):
                continue

            eye_tracking = pd.read_csv(os.path.join(input_path, str(participant), str(condition), 'gaze_data.csv'))
            element_position = calculate_duration_since_position_event(generics, participant, condition).dropna()
            suggestions_displayed = element_position.sort_values(by='time', ascending=True)

            for i, row in suggestions_displayed.iterrows():
                screen = json.loads(row['data'])['window']['screen']
                start = pd.to_datetime(row['time']).value // 10 ** 3
                end = start + row['time_diff']

                eye_tracking_relevant = eye_tracking[eye_tracking['system_time_stamp_micro'].between(start, end)]

                bbox = json.loads(row['data'])['bounding_box']

                points_inside = eye_tracking_relevant[
                    (eye_tracking_relevant['left_gaze_point_on_display_area_0'] * screen['width'] > bbox['x']) &
                    (eye_tracking_relevant['left_gaze_point_on_display_area_0'] * screen['width'] < bbox['x'] + bbox[
                        'width']) &
                    (eye_tracking_relevant['left_gaze_point_on_display_area_1'] * screen['height'] > bbox['y']) &
                    (eye_tracking_relevant['left_gaze_point_on_display_area_1'] * screen['height'] < bbox['y'] + bbox[
                        'height'])
                    ]

                # Differences over the max_time_ms are considered outliers
                if len(points_inside) > 0 and (
                        points_inside['system_time_stamp_micro'].min() - start) / 1000 < max_time_first_fixation:
                    if condition in first_fixations:
                        first_fixations[condition].append(
                            (points_inside['system_time_stamp_micro'].min() - start) / 1000)
                    else:
                        first_fixations[condition] = [(points_inside['system_time_stamp_micro'].min() - start) / 1000]

                    # avg_period = row['time_diff'] / len(eye_tracking_relevant)
                    avg_period = 4000

                    if avg_period * len(eye_tracking_relevant) / 1000 > max_fixation_duration:
                        continue

                    if condition in fixation_duration:
                        fixation_duration[condition].append(avg_period * len(eye_tracking_relevant) / 1000000)
                    else:
                        fixation_duration[condition] = [avg_period * len(eye_tracking_relevant) / 1000000]

    if generate_box_plots:
        plt.figure(figsize=(10, 6))
        # Sort the dictionary by keys (condition_id)
        sorted_first_fixations = dict(sorted(first_fixations.items()))
        for condition_id, times in sorted_first_fixations.items():
            plt.boxplot(times, vert=False, positions=[condition_id], widths=0.6)
        plt.title('Box-Whisker Plot of Time to First Fixation for All Conditions')
        plt.xlabel('Time to First Fixation (ms)')
        plt.yticks(list(sorted_first_fixations.keys()), list(sorted_first_fixations.keys()))
        os.makedirs(output_path, exist_ok=True)
        plt.savefig(os.path.join(output_path, 'box_plot_time_to_first_fixation_all_conditions.png'), format='png')

        plt.figure(figsize=(10, 6))
        sorted_fixation_duration = dict(sorted(fixation_duration.items()))
        for condition_id, durations in sorted_fixation_duration.items():
            plt.boxplot(durations, vert=False, positions=[condition_id], widths=0.6)
        plt.title('Box-Whisker Plot of Fixation Duration for All Conditions')
        plt.xlabel('Fixation Duration (seconds)')
        plt.yticks(list(sorted_fixation_duration.keys()), list(sorted_fixation_duration.keys()))
        os.makedirs(output_path, exist_ok=True)
        plt.savefig(os.path.join(output_path, 'box_plot_fixation_duration_all_conditions.png'), format='png')

    mean_first_fixations = {condition_id: np.mean(times) for condition_id, times in first_fixations.items()}
    median_first_fixations = {condition_id: np.median(times) for condition_id, times in first_fixations.items()}
    standard_deviation_first_fixations = {condition_id: np.std(times) for condition_id, times in
                                          first_fixations.items()}
    print(
        f"Mean Time to First Fixation: {mean_first_fixations}\nMedian Time to First Fixation: {median_first_fixations}\n"
        f"Standard Deviation Time to First Fixation: {standard_deviation_first_fixations}")

    mean_fixation_duration = {condition_id: np.mean(durations) for condition_id, durations in fixation_duration.items()}
    median_fixation_duration = {condition_id: np.median(durations) for condition_id, durations in
                                fixation_duration.items()}
    standard_deviation_fixation_duration = {condition_id: np.std(durations) for condition_id, durations in
                                            fixation_duration.items()}
    print(f"Mean Fixation Duration: {mean_fixation_duration}\nMedian Fixation Duration: {median_fixation_duration}\n"
          f"Standard Deviation Fixation Duration: {standard_deviation_fixation_duration}")


def calcualte_text_lengts(participant_ids, condition_ids, input_path, output_path, generate_box_plots=False):
    lengths = {}
    for p in participant_ids:
        for c in condition_ids:
            if not os.path.exists(f'{input_path}/{p}/{c}/document.html'):
                print(f'Participant {p}, Condition {c}: No document found')
                continue

            with open(f'raw_data/{p}/{c}/document.html', 'r') as f:
                text = BeautifulSoup(f.read(), 'html.parser').text
                text = text.replace('\n', ' ')
            if c in lengths:
                lengths[c].append(len(text))
            else:
                lengths[c] = [len(text)]

    if generate_box_plots:
        plt.figure(figsize=(10, 6))
        sorted_lengths = dict(sorted(lengths.items()))
        for condition_id, text_lengths in sorted_lengths.items():
            plt.boxplot(text_lengths, vert=False, positions=[condition_id], widths=0.6)
        plt.title('Box-Whisker Plot of Text Lengths for All Conditions')
        plt.xlabel('Text Length')
        plt.yticks(list(sorted_lengths.keys()), list(sorted_lengths.keys()))
        os.makedirs(output_path, exist_ok=True)
        plt.savefig(f'{output_path}/box_plot_text_lengths_all_conditions.png', format='png')

    mean = {condition_id: np.mean(lengths) for condition_id, lengths in lengths.items()}
    median = {condition_id: np.median(lengths) for condition_id, lengths in lengths.items()}
    std = {condition_id: np.std(lengths) for condition_id, lengths in lengths.items()}

    print(f"Mean: {mean}\nMedian: {median}\nStandard Deviation: {std}")


if __name__ == '__main__':
    participants = [912, 913, 914, 915, 916, 917, 918, 919, 920, 921]
    conditions = [29, 30, 31, 32]
    time_to_first_fixation_and_duration('raw_data', 'results', generate_box_plots=True)
