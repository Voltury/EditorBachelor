import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Utils from "./utils";

import FileServer from "./FileServer";

export default class Manager extends Plugin {
    constructor(editor) {
        super(editor);

        this.editor = editor;
        this.conditionId = null;
        this.paricipantId = null;
        this.studyAlignConnection = false;
    }
    static get pluginName() {
        return 'Manager';
    }

    init() {
        // if this fails the website will display waiting modal
        this.fileServer = new FileServer(this.editor);

        // setup Study Align
        try {
            this.handleSal();
            this.fileServer.set_study_align_connection(true);
            this.studyAlignConnection = true;
        }
        catch (e) {
            // the value for the connection is set to false by default no need to notify the remote control
            console.log("Failed to Evaluate Parameters for study align");
        }
        this.fileServer.register_condition_id(this.conditionId ? this.conditionId : -1);
        this.fileServer.register_participant_id(this.paricipantId ? this.paricipantId : -1);
    }

    setup_listeners() {
        console.log(this.conditionId);
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

            this.fileServer.event("keydown", event, timestamp);

            if(this.studyAlignConnection){
                this.sal.logKeyboardInteraction(this.conditionId, 'keydown', event, timestamp, metaData)
                    .catch(error => {
                        console.log(error);
                    });
            }
        });


        document.addEventListener('onmouseenter', event => {
            const currentDate = new Date();
            const timestamp = currentDate.getTime();

            this.fileServer.event("onmouseenter", event, timestamp);

            if(this.studyAlignConnection) {
                this.sal.logMouseInteraction(this.conditionId, 'onmouseenter', event, timestamp)
                    .catch(error => {
                        console.log(error);
                    });
            }
        })

        document.addEventListener('onmouseleave', event => {
            const currentDate = new Date();
            const timestamp = currentDate.getTime();

            this.fileServer.event("onmouseleave", event, timestamp);
            if(this.studyAlignConnection) {
                this.sal.logMouseInteraction(this.conditionId, 'onmouseleave', event, timestamp)
                    .catch(error => {
                        console.log(error);
                    });
            }
        })

        this.editor.on(Utils.SuggestionsRemoved, (event, data) => {
            const currentDate = new Date();
            const timestamp = currentDate.getTime();

            this.fileServer.event(Utils.SuggestionsRemoved, data, timestamp);

            if(this.studyAlignConnection) {
                this.sal.logGenericInteraction(this.conditionId, Utils.SuggestionsRemoved, data, timestamp)
                    .catch(error => {
                        console.log(error);
                    });
            }
        });

        this.editor.on(Utils.SuggestionsDisplayed, (event, data) => {
            const currentDate = new Date();
            const timestamp = currentDate.getTime();

            this.fileServer.event(Utils.SuggestionsDisplayed, data, timestamp);

            if(this.studyAlignConnection) {
                this.sal.logGenericInteraction(this.conditionId, Utils.SuggestionsDisplayed, data, timestamp)
                    .catch(error => {
                        console.log(error);
                    });
            }
        });

        this.editor.on(Utils.SuggestionInserted, (event, data) => {
            const currentDate = new Date();
            const timestamp = currentDate.getTime();

            this.fileServer.event(Utils.SuggestionInserted, data, timestamp);

            if(this.studyAlignConnection) {
                this.sal.logGenericInteraction(this.conditionId, Utils.SuggestionInserted, data, timestamp)
                    .catch(error => {
                        console.log(error);
                    });
            }
        });

        this.editor.on(Utils.TaskSelected, (event, data) => {
            const currentDate = new Date();
            const timestamp = currentDate.getTime();

            this.fileServer.event(Utils.TaskSelected, data, timestamp);

            if(this.studyAlignConnection) {
                this.sal.logGenericInteraction(this.conditionId, Utils.TaskSelected, data, timestamp)
                    .catch(error => {
                        console.log(error);
                    });
            }
        });

        this.fileServer.set_prototype_logging(true);
        console.log("Listeners setup")
    }

    handleSal(){
        const url = new URL(window.location.href);
        this.conditionId = url.searchParams.get("condition_id");
        const loggerKey = url.searchParams.get("logger_key"); // needed for logging
        this.participantToken = url.searchParams.get("participant_token");
        this.paricipantId = url.searchParams.get("participant_id");

        if(!(this.conditionId && loggerKey && this.participantToken && this.paricipantId)){
            throw new Error("Missing parameters for StudyAlign");
        }

        this.sal = new studyAlignLib("https://hciaitools.uni-bayreuth.de/study-align-sec", 32); // params: backend_url and studyId
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
