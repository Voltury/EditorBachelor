import tobii_research as tr
import threading
import queue
import pandas as pd
import os
import time

class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

found_eyetrackers = tr.find_all_eyetrackers()

if not found_eyetrackers:
    print(f"{bcolors.FAIL}No tracker found{bcolors.ENDC}")
else:
    eyetracker = found_eyetrackers[0]
    print("Address: " + eyetracker.address)
    print("Model: " + eyetracker.model)
    print("Name (It's OK if this is empty): " + eyetracker.device_name)
    print("Serial number: " + eyetracker.serial_number)

    max_entries_per_bundle = 1000
    data_list = []
    data_queue = queue.Queue()
    writer = None


def gaze_data_callback(gaze_data):
    system_time_stamp_micro = int(time.time_ns() // 1e3)
    global data_list, data_queue

    del gaze_data['system_time_stamp']
    del gaze_data['device_time_stamp']
    gaze_data['system_time_stamp_ms'] = system_time_stamp_micro

    data_list.append(gaze_data)
    if len(data_list) == max_entries_per_bundle:
        data_queue.put(data_list.copy())
        data_list = []


def start_recording(participant_id, condition):
    global writer

    # Start the data writer thread
    writer = threading.Thread(target=data_writer, args=(participant_id, condition))
    writer.start()

    eyetracker.subscribe_to(tr.EYETRACKER_GAZE_DATA, gaze_data_callback, as_dictionary=True)


def stop_recording():
    print("Stopping recording")
    global writer
    eyetracker.unsubscribe_from(tr.EYETRACKER_GAZE_DATA, gaze_data_callback)
    if data_list:
        data_queue.put(data_list)
    data_queue.put(None)
    # Wait for the writer thread to finish
    writer.join()


def data_writer(participant_id, condition):
    path = f"./data/{participant_id}/{condition}/gaze_data.csv"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    header = not os.path.exists(path)
    with open(path, 'ab') as f:
        while True:
            data = data_queue.get()
            if data is None:
                break

            temp = []
            for element in data:
                temp.append(element)
                keys = list(temp[-1].keys())
                for key in keys:
                    value = temp[-1][key]
                    if type(value) is tuple:
                        del temp[-1][key]
                        for i in range(len(value)):
                            temp[-1][f"{key}_{i}"] = value[i]

            df = pd.DataFrame.from_dict(temp)
            data = df.to_csv(index=False, header=header).encode()
            f.write(data)
            header = False
            f.flush()
            os.fsync(f.fileno())



if __name__ == "__main__":
    start_recording(0, "test")
    time.sleep(4)
    stop_recording()
    print("Done")
