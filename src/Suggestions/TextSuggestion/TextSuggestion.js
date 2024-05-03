import FileServerConnection from "../../FileServerConnection";

export default class TextSuggestion {
    static timer = null;
    static last_time_clear = 0;
    static last_generation_call = 0;
    static suggestion_callback = null;
    static file_server = null;

    static clearTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.last_time_clear = Date.now();
    }

    /**
     * Generates a suggestion using the OpenAI API.
     * @param prompt - The context that is being passed to the language model.
     * @param suggestionCount - The number of suggestions to generate.
     * @param check - Function to check if suggestion is appropriate for current position.
     * @param callback - Function that should be called upon receiving a response. If an error occurs this function will not be called.
     * @param delay_in_ms - The delay in milliseconds before the request is sent.
     * @param kwargs - Additional parameters for the model.
     */
    static generateSuggestion(prompt,
                              suggestionCount = 1,
                              check,
                              callback,
                              delay_in_ms = 500,
                              kwargs = {
                                  temperature: 0.5,
                                  max_tokens: 10
                              }) {
        this.clearTimer();
        if (!check()) return;

        if (!this.file_server) this.file_server = new FileServerConnection(editor);

        this.suggestion_callback = callback;

        this.timer = setTimeout(() => {
            this.file_server.request_suggestions(prompt, suggestionCount, this.suggestion_response.bind(this), kwargs);
            this.last_generation_call = this.last_time_clear;
        }, delay_in_ms);
    }

    static async suggestion_response(suggestions) {
        // Check if the timer has been cleared while the request was still running
        if(this.last_time_clear !== this.last_generation_call){
            return;
        }
        this.suggestion_callback(suggestions);
    }
}