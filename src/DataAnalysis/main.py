import json
import os

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
import multiprocessing as mp


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
        (gaze_data["system_time_stamp_ms"][max_gap_start] - gaze_data["system_time_stamp_ms"][0]) / (1000 * 1000 * 60),
        (gaze_data["system_time_stamp_ms"][max_gap_end] - gaze_data["system_time_stamp_ms"][0]) / (1000 * 1000 * 60),
        color='red', alpha=0.5)

    # Plot of the left pupil diameter over time
    time = (gaze_data["system_time_stamp_ms"] - gaze_data["system_time_stamp_ms"][0]) / (1000 * 1000 * 60)
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


def create_heatmap(args):
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


if __name__ == '__main__':

    # Define the directory containing the raw data
    raw_data_dir = "raw_data"

    # Define the directory for the results
    results_dir = "results"
    if not os.path.exists(results_dir):
        os.makedirs(results_dir)

    # Set the degree of the polynomial
    poly_degree = 5  # Change this to set the degree of the polynomial

    # Get list of participant IDs
    participant_ids = [pid for pid in os.listdir(raw_data_dir) if os.path.isdir(os.path.join(raw_data_dir, pid))]

    heatmap_inputs = []
    for participant_id in participant_ids:
        with open(os.path.join(raw_data_dir, participant_id, "tasks.json")) as f:
            tasks = json.load(f)

        for condition_id in tasks.keys():
            if condition_id.isnumeric():
                heatmap_inputs.append((participant_id, condition_id, raw_data_dir, results_dir))

    with mp.Pool(mp.cpu_count()) as pool:
        pool.map(create_heatmap, heatmap_inputs)
