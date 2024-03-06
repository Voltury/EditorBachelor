import json
import pandas as pd


def convert_txt_to_csv(text_path, csv_path):
    # Open the text file
    with open(text_path, 'r') as reading:
        x = None
        data = []
        for line in reading:
            x = line.replace("'", "\"").replace("(", "[").replace(")", "]").replace('nan', 'null')
            y = json.loads(x)

            keys = list(y.keys())
            for key in keys:
                value = y[key]
                if type(value) is list:
                    temp = value
                    del y[key]
                    for i in range(len(temp)):
                        y[f"{key}_{i}"] = value[i]
            data.append(y)

        df = pd.DataFrame.from_dict(data)
        df.to_csv(csv_path, index=False)


# convert_txt_to_csv('815_baseline_gaze_data_0.txt', '815_baseline_gaze_data_0.csv')
df = pd.read_csv('815_baseline_gaze_data_0.csv')

df = df['system_time_stamp'].diff()-(1000000/120.0)
print(df.mean(), df.var())
print(df.nlargest(5))
print(df[20])
