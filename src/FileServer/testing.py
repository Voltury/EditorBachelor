import pandas as pd

# Initialize a list to hold DataFrames
dfs = []

# Loop over the files and append them to the list
for i in range(56):
    temp_df = pd.read_csv(f'./data/822/25/gaze_data_{i}.csv')
    dfs.append(temp_df)

# Concatenate all DataFrames in the list
df = pd.concat(dfs, ignore_index=True)

# Get columns containing the words "validity", "right", and "left"
validity_columns_right = [col for col in df.columns if 'validity' in col and 'right' in col]
validity_columns_left = [col for col in df.columns if 'validity' in col and 'left' in col]
print(validity_columns_right)
print(validity_columns_left)

# Check if all values in these columns are the same for each row
df['all_same_right'] = df[validity_columns_right].apply(lambda row: len(set(row)) == 1, axis=1)
df['all_same_left'] = df[validity_columns_left].apply(lambda row: len(set(row)) == 1, axis=1)

# Print rows where not all validity columns have the same value
print(df[(df['all_same_right'] == False) | (df['all_same_left'] == False)][['all_same_right', 'all_same_left']])
