import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Utils from "./utils";

import FileServer from "./FileServer";

export default class Manager extends Plugin {
    constructor(editor) {
        super(editor);

        this.editor = editor;
        this.conditionId = null;
        this.paricipantId = null;
    }
    static get pluginName() {
        return 'Manager';
    }

    init() {
        // setup Study Align
        this.handleSal();

        this.trackerCommunicator = new FileServer(this.editor);
        this.trackerCommunicator.register_condition_id(this.conditionId);
        this.trackerCommunicator.register_participant_id(this.paricipantId);
    }

    setup_listeners() {
        console.log(this.conditionId);
        if(!this.conditionId) return;

        console.log("Start setting up listeners")

        document.addEventListener('keydown', event => {
            const currentDate = new Date();
            const timestamp = currentDate.getTime();

            let metaData = {"isFocused": this.editor.editing.view.document.isFocused, "text": null, "before_cursor": null, "after_cursor": null};

            if (this.editor.editing.view.document.isFocused) {
                metaData.text = this.editor.getData();
                metaData.before_cursor = Utils._getTextBeforeCursor(this.editor, 20);
                metaData.after_cursor = Utils._getTextAfterCursor(this.editor, 20);
            }

            this.sal.logKeyboardInteraction(this.conditionId, 'keydown', event, timestamp, metaData)
                .catch(error => {
                    console.log(error);
                });
        });
        this.editor.on(Utils.SuggestionsRemoved, (event, data) => {
            const currentDate = new Date();
            const timestamp = currentDate.getTime();

            this.sal.logGenericInteraction(this.conditionId, Utils.SuggestionsRemoved, data, timestamp)
                .catch(error => {
                    console.log(error);
                });
        });
        this.editor.on(Utils.SuggestionsDisplayed, (event, data) => {
            const currentDate = new Date();
            const timestamp = currentDate.getTime();

            this.sal.logGenericInteraction(this.conditionId, Utils.SuggestionsDisplayed, data, timestamp)
                .catch(error => {
                    console.log(error);
                });
        });
        this.editor.on(Utils.SuggestionInserted, (event, data) => {
            const currentDate = new Date();
            const timestamp = currentDate.getTime();

            this.sal.logGenericInteraction(this.conditionId, Utils.SuggestionInserted, data, timestamp)
                .catch(error => {
                    console.log(error);
                });
        });
        this.editor.on(Utils.TaskSelected, (event, data) => {
            const currentDate = new Date();
            const timestamp = currentDate.getTime();

            this.sal.logGenericInteraction(this.conditionId, Utils.TaskSelected, data, timestamp)
                .catch(error => {
                    console.log(error);
                });
        });

        console.log("Listeners setup")
    }

    handleSal(){
        const url = new URL(window.location.href);
        this.conditionId = url.searchParams.get("condition_id");
        const loggerKey = url.searchParams.get("logger_key"); // needed for logging
        this.participantToken = url.searchParams.get("participant_token");
        this.paricipantId = url.searchParams.get("participant_id");

        if (!this.participantToken) {
            console.log("No participant Token");
            //this.socket.close(4000, "No participant Token");
            return;
        }

        console.log(this.conditionId)
        console.log(loggerKey)

        this.sal = new studyAlignLib("https://hciaitools.uni-bayreuth.de/study-align-sec", 32); // params: backend_url and studyId
        console.log(this.sal)
        this.sal.setLoggerKey(loggerKey);
    }

    async saveToProceed(participantToken) {
        try {
            console.log("Message studyAlign with Token: " + participantToken);
            await this.sal.updateNavigator(participantToken, "condition", "done");
        } catch (e) {
            console.warn(e)
            console.warn("StudyAlign Navigator could not be updated");
        }
    }
}
