import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class Manager extends Plugin {
    static get pluginName() {
        return 'Manager';
    }

    init() {

        const url = new URL(window.location.href);

        const conditionId = url.searchParams.get("condition_id") || 1; // value from get parameter or 1 (default)
        const loggerKey = url.searchParams.get("logger_key"); // needed for logging
        const participantToken = url.searchParams.get("participant_token");

        if (!participantToken) {

            if (!participantToken) console.log("No participant Token");
            return;
        }

        console.log(conditionId)
        console.log(loggerKey)

        this.sal = new studyAlignLib("https://hciaitools.uni-bayreuth.de/study-align-sec", 32); // params: backend_url and studyId
        console.log(this.sal)
        this.sal.setLoggerKey(loggerKey);

        setTimeout(this.saveToProceed.bind(this, participantToken), 10000);
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
