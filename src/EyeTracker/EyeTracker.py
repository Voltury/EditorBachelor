import tobii_research as tr
import threading
import queue

found_eyetrackers = tr.find_all_eyetrackers()
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
    global data_list, data_queue

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
    global writer
    eyetracker.unsubscribe_from(tr.EYETRACKER_GAZE_DATA, gaze_data_callback)
    if data_list:
        data_queue.put(data_list)
    data_queue.put(None)
    # Wait for the writer thread to finish
    writer.join()


def data_writer(participant_id, condition):
    element_count = 0
    while True:
        data = data_queue.get()
        if data is None:
            break
        file_path = f"{participant_id}_{condition}_gaze_data_{element_count}.txt"
        with open(file_path, 'a') as file:
            for item in data:
                file.write(f"{item}\n")
        element_count += 1
        print(f"Saved data to {file_path}")
