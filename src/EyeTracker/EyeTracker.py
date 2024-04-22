import tobii_research as tr
import queue
import pandas as pd
import os
import time
import threading


class EyeTracker:
    """
    Class to handle the eye tracker. It connects to the first found eye tracker and subscribes to the gaze data.
    @param tracker_callback: Callback function that is called every callback_intervall ms
    @param callback_intervall: Intervall in ms in which the tracker_callback is called
    """
    def __init__(self, tracker_callback, callback_intervall=100):
        self.found_eye_trackers = tr.find_all_eyetrackers()
        self.eyetracker = self.found_eye_trackers[0] if self.found_eye_trackers else None
        self.max_entries_per_bundle = 1000
        self.data_list = []
        self.data_queue = queue.Queue()
        self.writer = None
        self.tracker_callback = tracker_callback
        self.callback_intervall = callback_intervall
        self.last_callback = time.time_ns()

    def gaze_data_callback(self, gaze_data):
        if int((time.time_ns() - self.last_callback) / 1e6) > self.callback_intervall:
            #self.tracker_callback([gaze_data['left_gaze_point_on_display_area_0'], gaze_data['right_gaze_point_on_display_area_0']])
            self.last_callback = time.time_ns()

        system_time_stamp_micro = int(time.time_ns() // 1e3)
        del gaze_data['system_time_stamp']
        del gaze_data['device_time_stamp']
        gaze_data['system_time_stamp_ms'] = system_time_stamp_micro
        self.data_list.append(gaze_data)
        if len(self.data_list) == self.max_entries_per_bundle:
            self.data_queue.put(self.data_list.copy())
            self.data_list = []

    def start_recording(self, participant_id, condition):
        if not self.found_eye_trackers:
            return False

        self.writer = threading.Thread(target=self.data_writer, args=(participant_id, condition))
        self.writer.start()
        self.eyetracker.subscribe_to(tr.EYETRACKER_GAZE_DATA, self.gaze_data_callback, as_dictionary=True)
        return True

    def stop_recording(self):
        if not self.found_eye_trackers:
            return False
        print("Stopping recording")
        self.eyetracker.unsubscribe_from(tr.EYETRACKER_GAZE_DATA, self.gaze_data_callback)
        if self.data_list:
            self.data_queue.put(self.data_list)
        self.data_queue.put(None)
        self.writer.join()
        return True

    def data_writer(self, participant_id, condition):
        print("Starting data writer")

        path = f"./../data/{participant_id}/{condition}/gaze_data.csv"
        os.makedirs(os.path.dirname(path), exist_ok=True)
        header = not os.path.exists(path)
        with open(path, 'ab') as f:
            while True:
                data = self.data_queue.get()
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
        print("Data writer stopped")

    def eye_tracker_connected(self) -> bool:
        self.found_eye_trackers = tr.find_all_eyetrackers()
        return self.found_eye_trackers


if __name__ == "__main__":
    eye_tracker = EyeTracker()
    eye_tracker.start_recording(0, "test")
    time.sleep(4)
    eye_tracker.stop_recording()
    print("Done")
