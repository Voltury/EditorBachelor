import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Utils from "./utils";

import FileServerConnection from "./FileServerConnection";

export default class Manager extends Plugin {
    constructor(editor) {
        super(editor);

        this.editor = editor;
        this.conditionId = null;
        this.paricipantId = null;
        this.studyAlignConnection = false;
        this.is_logging = false;

        this.keydownHandler = this.keydownHandler.bind(this);
        this.mouseEnterHandler = this.mouseEnterHandler.bind(this);
        this.mouseLeaveHandler = this.mouseLeaveHandler.bind(this);
        this.suggestionsRemovedHandler = this.suggestionsRemovedHandler.bind(this);
        this.suggestionsDisplayedHandler = this.suggestionsDisplayedHandler.bind(this);
        this.suggestionInsertedHandler = this.suggestionInsertedHandler.bind(this);
        this.taskSelectedHandler = this.taskSelectedHandler.bind(this);
        this.modalHandler = this.modalHandler.bind(this);
        this.elementPositionHandler = this.elementPositionHandler.bind(this);
        this.recordingStatusHandler = this.recordingStatusHandler.bind(this);
    }
    static get pluginName() {
        return 'Manager';
    }

    init() {
        // if this fails the website will display waiting modal
        this.fileServerConnection = new FileServerConnection(this.editor);

        // setup Study Align
        try {
            this.handleSal();
            this.fileServerConnection.set_study_align_connection(true);
            this.studyAlignConnection = true;
        }
        catch (e) {
            // the value for the connection is set to false by default no need to notify the remote control
            console.log("Failed to Evaluate Parameters for study align");
        }
        this.fileServerConnection.register_study_id(this.study_id !== 0 ? this.study_id : -1);
        this.fileServerConnection.register_condition_id(this.conditionId !== 0 ? this.conditionId : -1);
        this.fileServerConnection.register_participant_id(this.paricipantId !== 0 ? this.paricipantId : -1);

        this.editor.editing.view.document.on('dragstart', ( evt, data ) => {
            evt.stop();
            data.preventDefault();
        }, { priority: 'high' });

        this.editor.on(Utils.RecordingStatus, this.recordingStatusHandler);
    }

    setup_listeners() {
        console.log("Start setting up listeners")

        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('onmouseenter', this.mouseEnterHandler);
        document.addEventListener('onmouseleave', this.mouseLeaveHandler);
        this.editor.on(Utils.SuggestionsRemoved, this.suggestionsRemovedHandler);
        this.editor.on(Utils.SuggestionsDisplayed, this.suggestionsDisplayedHandler);
        this.editor.on(Utils.SuggestionInserted, this.suggestionInsertedHandler);
        this.editor.on(Utils.TaskSelected, this.taskSelectedHandler);
        this.editor.on(Utils.ModalChanged, this.modalHandler);
        this.editor.on(Utils.ElementPosition, this.elementPositionHandler);

        this.is_logging = true;
        this.fileServerConnection.set_prototype_logging(true);
        console.log("Listeners setup");
        this.editor.fire(Utils.RecordingStatus, {status: true})
    }

    remove_listeners() {
        console.log("Start removing listeners")

        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('onmouseenter', this.mouseEnterHandler);
        document.removeEventListener('onmouseleave', this.mouseLeaveHandler);
        this.editor.off(Utils.SuggestionsRemoved, this.suggestionsRemovedHandler);
        this.editor.off(Utils.SuggestionsDisplayed, this.suggestionsDisplayedHandler);
        this.editor.off(Utils.SuggestionInserted, this.suggestionInsertedHandler);
        this.editor.off(Utils.ModalChanged, this.modalHandler);
        this.editor.off(Utils.ElementPosition, this.elementPositionHandler)

        this.is_logging = false;
        this.fileServerConnection.set_prototype_logging(false);
        console.log("Listeners removed");
        this.editor.fire(Utils.RecordingStatus, {status: false})
    }


    handleSal(){
        const url = new URL(window.location.href);

        this.conditionId = Number(url.searchParams.get("condition_id"));
        const loggerKey = url.searchParams.get("logger_key"); // needed for logging
        this.participantToken = url.searchParams.get("participant_token");
        this.paricipantId = Number(url.searchParams.get("participant_id"));
        this.study_id = Number(url.searchParams.get("study_id"));

        if(!(this.conditionId !== 0 && loggerKey && this.participantToken && this.paricipantId !== 0)){
            throw new Error("Missing parameters for StudyAlign");
        }

        this.sal = new studyAlignLib("https://hciaitools.uni-bayreuth.de/study-align-sec", this.study_id); // params: backend_url and studyId
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

    keydownHandler(event) {
        const currentDate = new Date();
        const timestamp = currentDate.getTime();

        let metaData = {
            "isFocused": this.editor.editing.view.document.isFocused,
            "text": null,
            "before_cursor": null,
            "after_cursor": null
        };

        if (this.editor.editing.view.document.isFocused) {
            metaData.text = this.editor.getData();
            metaData.before_cursor = Utils._getTextBeforeCursor(this.editor, 20);
            metaData.after_cursor = Utils._getTextAfterCursor(this.editor, 20);
        }

        this.fileServerConnection.event("keydown", event, timestamp);

        if (this.studyAlignConnection) {
            this.sal.logKeyboardInteraction(this.conditionId, 'keydown', event, timestamp, metaData)
                .catch(error => {
                    console.log(error);
                });
        }
    }

    mouseEnterHandler(event) {
        const currentDate = new Date();
        const timestamp = currentDate.getTime();

        this.fileServerConnection.event("onmouseenter", event, timestamp);

        if (this.studyAlignConnection) {
            this.sal.logMouseInteraction(this.conditionId, 'onmouseenter', event, timestamp)
                .catch(error => {
                    console.log(error);
                });
        }
    }

    mouseLeaveHandler(event) {
        const currentDate = new Date();
        const timestamp = currentDate.getTime();

        this.fileServerConnection.event("onmouseleave", event, timestamp);
        if (this.studyAlignConnection) {
            this.sal.logMouseInteraction(this.conditionId, 'onmouseleave', event, timestamp)
                .catch(error => {
                    console.log(error);
                });
        }
    }

    suggestionsRemovedHandler(event, data) {
        const currentDate = new Date();
        const timestamp = currentDate.getTime();

        this.fileServerConnection.event(Utils.SuggestionsRemoved, data, timestamp);

        if (this.studyAlignConnection) {
            this.sal.logGenericInteraction(this.conditionId, Utils.SuggestionsRemoved, data, timestamp)
                .catch(error => {
                    console.log(error);
                });
        }
    }

    suggestionsDisplayedHandler(event, data) {
        const currentDate = new Date();
        const timestamp = currentDate.getTime();

        this.fileServerConnection.event(Utils.SuggestionsDisplayed, data, timestamp);

        if (this.studyAlignConnection) {
            this.sal.logGenericInteraction(this.conditionId, Utils.SuggestionsDisplayed, data, timestamp)
                .catch(error => {
                    console.log(error);
                });
        }
    }

    suggestionInsertedHandler(event, data) {
        const currentDate = new Date();
        const timestamp = currentDate.getTime();

        this.fileServerConnection.event(Utils.SuggestionInserted, data, timestamp);

        if (this.studyAlignConnection) {
            this.sal.logGenericInteraction(this.conditionId, Utils.SuggestionInserted, data, timestamp)
                .catch(error => {
                    console.log(error);
                });
        }
    }

    taskSelectedHandler(event, data) {
        const currentDate = new Date();
        const timestamp = currentDate.getTime();

        this.fileServerConnection.event(Utils.TaskSelected, data, timestamp);

        if (this.studyAlignConnection) {
            this.sal.logGenericInteraction(this.conditionId, Utils.TaskSelected, data, timestamp)
                .catch(error => {
                    console.log(error);
                });
        }
    }

    modalHandler(event, data){
        const currentDate = new Date();
        const timestamp = currentDate.getTime();

        this.fileServerConnection.event(Utils.ModalChanged, data, timestamp);

        if (this.studyAlignConnection) {
            this.sal.logGenericInteraction(this.conditionId, Utils.ModalChanged, data, timestamp)
                .catch(error => {
                    console.log(error);
                });
        }
    }

    elementPositionHandler(event, data){
        const currentDate = new Date();
        const timestamp = currentDate.getTime();

        const window = data.window;

        data.window = {
            innerHeight: window.innerHeight,
            innerWidth: window.innerWidth,
            outerHeight: window.outerHeight,
            outerWidth: window.outerWidth,
            pageXOffset: window.pageXOffset,
            pageYOffset: window.pageYOffset,
            screen: {
                availHeight: window.screen.availHeight,
                availWidth: window.screen.availWidth,
                height: window.screen.height,
                width: window.screen.width,
                availLeft: window.screen.availLeft,
                availTop: window.screen.availTop,
                left: window.screen.left,
                top: window.screen.top
            }
        };

        this.fileServerConnection.event(Utils.ElementPosition, data, timestamp);

        if (this.studyAlignConnection) {
            this.sal.logGenericInteraction(this.conditionId, Utils.ElementPosition, data, timestamp)
                .catch(error => {
                    console.log(error);
                });
        }
    }

    recordingStatusHandler(event, data){
        const currentDate = new Date();
        const timestamp = currentDate.getTime();

        this.fileServerConnection.event(Utils.RecordingStatus, data, timestamp);

        if (this.studyAlignConnection) {
            this.sal.logGenericInteraction(this.conditionId, Utils.RecordingStatus, data, timestamp)
                .catch(error => {
                    console.log(error);
                });
        }
    }
}
