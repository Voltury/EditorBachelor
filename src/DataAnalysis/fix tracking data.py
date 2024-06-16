import os
import pandas as pd

# Define the root directory
root_dir = 'raw_data'


def fix_all():
    # Iterate over all condition_id folders
    for participant_id in os.listdir(root_dir):
        temp = os.path.join(root_dir, participant_id)
        if not os.path.isdir(temp):
            continue

        # Iterate over all participant_id folders
        for condition_dir in os.listdir(temp):
            temp = os.path.join(root_dir, participant_id, condition_dir)

            if not os.path.isdir(temp):
                continue

            fix_one(participant_id, condition_dir)


def fix_one(participant_id, condition_id):
    # Load the gaze_data.csv file
    file_path = os.path.join(root_dir, str(participant_id), str(condition_id), 'gaze_data.csv')
    df = pd.read_csv(file_path)

    name = 'system_time_stamp_ms'
    if participant_id > 918:
        name = 'system_time_stamp_micro'
    # Calculate time differences
    df['time_diff'] = df[name].diff()

    # Find the index of the largest time difference
    max_diff_index = df['time_diff'].idxmax()
    max_diff_value = df['time_diff'].max()

    print(f"File: {file_path}")
    print(f"Largest time difference is {max_diff_value} at index {max_diff_index}")

    time_diff = round((df['system_time_stamp_ms'][max_diff_index] - df['system_time_stamp_ms'][0]) / 1000000, 4)
    print(f"Removed time in s: {time_diff}")

    # Ask the user if they want to delete the first [:index] elements
    delete = input(f"Do you want to delete the first {max_diff_index} elements? (yes/no): ")

    if delete.lower() == 'yes':
        # Drop the first [:index] elements
        df = df.drop(df.index[:max_diff_index])

        # Save the DataFrame back to the disk
        df.to_csv(file_path, index=False)
        print(f"First {max_diff_index} elements deleted and file saved back to the disk.")


def jumps_around_point_in_time(participant_id, condition_id, time, delta_microseconds):
    # Define the path to the gaze_data.csv file
    file_path = os.path.join(root_dir, str(participant_id), str(condition_id), 'gaze_data.csv')

    # Check if the file exists
    if os.path.isfile(file_path):
        # Load the gaze_data.csv file
        df = pd.read_csv(file_path)

        # Calculate time differences
        df['time_diff'] = df['system_time_stamp_ms'].diff()

        # Find the indices and values around the given time within the given range
        mask = (df['system_time_stamp_ms'] >= (time - delta_microseconds)) & (
                df['system_time_stamp_ms'] <= (time + delta_microseconds))
        result = df.loc[mask, ['time_diff', 'system_time_stamp_ms']]

        return result

    else:
        print(f"The file {file_path} does not exist.")
        return None


def fix_time_column():
    for i in range(912, 921):
        for j in range(29, 33):
            if os.path.exists(f'raw_data/{i}/{j}/gaze_data.csv'):
                df = pd.read_csv(f'raw_data/{i}/{j}/gaze_data.csv')
                change = False

                if 'system_time_stamp_ms' in df.keys():
                    df.rename(columns={'system_time_stamp_ms': 'system_time_stamp_micro'}, inplace=True)
                    change = True

                if 'time_diff' in df.keys():
                    df.drop(columns=['time_diff'], inplace=True)
                    change = True

                if change:
                    df.to_csv(f'raw_data/{i}/{j}/gaze_data.csv', index=False)


if __name__ == "__main__":
    fix_time_column()
