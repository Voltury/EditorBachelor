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

    def __init__(self, tracker_callback, callback_intervall=200):
        all_trackers = tr.find_all_eyetrackers()
        self.eyetracker = all_trackers[0] if all_trackers else None
        self.frequency = self.eyetracker.get_gaze_output_frequency() if self.eyetracker else None
        self.max_entries_per_bundle = 1000
        self.data_list = []
        self.data_queue = queue.Queue()
        self.writer_thread = None
        self.server_thread = None
        self.tracker_callback = tracker_callback
        self.callback_interval_ms = callback_intervall
        self.server_queue = queue.Queue()
        self.last_callback = time.perf_counter() * 1000

        print(f"Chosen tracker: {self.eyetracker.device_name} from {[tracker.device_name for tracker in all_trackers]}")

    def gaze_data_callback(self, gaze_data):
        """
        Callback function that is called when new gaze data is available. It collects a certain amount of data and
        then puts that bundle in the data_queue. It also requests notification of the CommunicationServer about the new
        data periodically by putting the data in the server_queue.
        @param gaze_data: Dictionary containing the gaze data (configurable with the tobii_research library)
        """
        current_time = time.perf_counter() * 1000  # Convert to milliseconds

        if current_time - self.last_callback > self.callback_interval_ms:
            self.last_callback = current_time
            try:
                self.server_queue.put(
                    [[gaze_data['left_gaze_point_on_display_area'][0], gaze_data['left_gaze_point_on_display_area'][1]],
                     [gaze_data['right_gaze_point_on_display_area'][0],
                      gaze_data['right_gaze_point_on_display_area'][1]]]
                )
            except Exception as e:
                print(f"Exception when putting data in queue: {e}")

        # Time timestamps used by tobii lack a reference point and are only supposed to be used for synchronisation,
        # so we use the system time to create a reliable timestamp
        system_time_stamp_micro = int(time.time_ns() // 1e3)
        del gaze_data['system_time_stamp']
        del gaze_data['device_time_stamp']
        gaze_data['system_time_stamp_ms'] = system_time_stamp_micro

        self.data_list.append(gaze_data)
        if len(self.data_list) == self.max_entries_per_bundle:
            self.data_queue.put(self.data_list.copy())
            self.data_list = []

    def start_recording(self, participant_id, condition):
        """
        Starts the recording of the eye tracker. It subscribes to the gaze data and starts the data writer, which writes
        the data to a csv file. It also starts the server communication, which sends the data to the CommunicationServer.
        :param participant_id: The id of the participant (from StudyAlign)
        :param condition: The condition id (from StudyAlign)
        :return: True if the recording was started successfully, False otherwise
        """
        if not self.eyetracker:
            return False

        self.writer_thread = threading.Thread(target=self.data_writer, args=(participant_id, condition))
        self.writer_thread.start()

        self.server_thread = threading.Thread(target=self.server_communication)
        self.server_thread.start()

        self.eyetracker.subscribe_to(tr.EYETRACKER_GAZE_DATA, self.gaze_data_callback, as_dictionary=True)
        print("EyeTracker recording started")
        return True

    def stop_recording(self):
        """
        Stops the recording of the eye tracker. It unsubscribes from the gaze data and notifies the data writer and the
        server communication (just for the eye tracking data) to stop. It waits for both threads to finish.
        :return: True if the recording was stopped successfully, False otherwise
        """
        if not self.eyetracker:
            return False
        self.eyetracker.unsubscribe_from(tr.EYETRACKER_GAZE_DATA, self.gaze_data_callback)
        if self.data_list:
            self.data_queue.put(self.data_list)
        self.data_queue.put(None)
        self.server_queue.put(None)
        self.writer_thread.join()
        self.server_thread.join()

        print("EyeTracker recording stopped")
        return True

    def data_writer(self, participant_id, condition):
        """
        Writes the data to a csv file. It writes the data in the data_queue to a csv file in the data folder. The file
        is named gaze_data.csv and is located (by default) in the folder of the participant and the condition.
        :param participant_id: The id of the participant (from StudyAlign)
        :param condition: The condition id (from StudyAlign)
        :return: None
        """
        print("Data writer started")

        path = f"./data/{participant_id}/{condition}/gaze_data.csv"
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
        """
        Checks if an eye tracker is connected and assigns it to the eyetracker attribute.
        It also assigns the frequency of the eye tracker to the frequency attribute.
        :return: True if an eye tracker is connected, False otherwise
        """
        all_trackers = tr.find_all_eyetrackers()

        if all_trackers:
            self.eyetracker = all_trackers[0]
            self.frequency = self.eyetracker.get_gaze_output_frequency()
            return True
        return False

    def server_communication(self):
        """
        Allows the EyeTracker to send message to the CommunicationServer. It collects the data from the server_queue and
        calls the tracker_callback with the data as argument. It is important to note that the called function is not
        asynchronous and has to be handled accordingly.
        :return: None
        """
        print("Started sending eyetracking samples to the CommunicationServer")
        while True:
            data = self.server_queue.get()
            if data is None:
                print("Stopped sending eyetracking samples to the CommunicationServer")
                break

            future = self.tracker_callback(data)
            try:
                # Wait for the callback to finish
                future.result()
            except Exception as e:
                print(f"Error in callback: {e}")


if __name__ == "__main__":
    eye_tracker = EyeTracker(lambda: print("Callback"))
    eye_tracker.start_recording(0, "test")
    time.sleep(4)
    eye_tracker.stop_recording()
    print("Done")
