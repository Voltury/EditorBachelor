import ModalPlugin from "../../Modal/Modal";

export default class TextSuggestion {
    static delayInMs = 1000;
    static timer = null;
    static abortController = new AbortController();
    static requestsOngoing = false;

    /**
     * Clears the internal timer and cancels ongoing requests
     */
    static clearTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        if(this.requestsOngoing){
            // cancel all ongoing requests
            this.abortController.abort();
            this.requestsOngoing = false;
            this.abortController = new AbortController();
        }
    }

    /**
     * @param editor The editor instance
     * @param prompt The context that is being passed to the language model
     * @param suggestionCount Number of suggestions to generate
     * @param max_new_tokens Maximum length of the answer in tokens
     * @param check Function to check if suggestion is appropriate for current position
     * @param callback Function that should be called upon receiving a response.
     * This function has to take a single string as parameters.
     */
    static generateSuggestion(editor, prompt, suggestionCount, max_new_tokens, check, callback) {
        // If a timer is already running, clear it.
        this.clearTimer();
        if (!check()) return;

        // Start a new timer that calls the server after 200ms.
        this.timer = setTimeout(() => {
            this._makeRequest(editor, prompt, suggestionCount, max_new_tokens, callback);
        }, this.delayInMs);
    }

    static async _makeRequest(editor, prompt, suggestionCount, max_new_tokens, callback) {
        this.requestsOngoing = true;


        const response = []
        for(let i = 0; i < suggestionCount; i++) {
            response.push("This is a test suggestion " + i);
        }
        callback(response);
        return;



        const task = editor.plugins.get(ModalPlugin.pluginName).get_current_task();
        if(!task){
            this.requestsOngoing = false;
            return;
        }

        // The actual request
        const url = "https://btn6x16.inf.uni-bayreuth.de/mistral-7b/api/v1/predict";
        const api_key = "alpacas#are#curly#llamas";

        const signal = this.abortController.signal;

        // Create an array to hold all the fetch promises
        let fetchPromises = [];
        const data = JSON.stringify({
            "input": `${task}\n${prompt}`, // get editor data as input
            "kwargs": {
                "repetition_penalty": 1.2,
                "max_new_tokens": max_new_tokens,
                "use_cache": true,
                "do_sample": true,
                "length_penalty": -1
            }
        });

        for(let i = 0; i < suggestionCount; i++) {
            // Create a new fetch request for each request and add it to the array
            let fetchPromise = fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': api_key
                },
                body: data,
                signal // Pass the AbortSignal to the fetch call
            });

            fetchPromises.push(fetchPromise);
        }

        try {
            // Wait for all fetch promises to resolve
            let responses = await Promise.all(fetchPromises);

            // Process each response
            let results = [];
            for(let response of responses) {
                if (!response.ok) {
                    console.warn("HTTP error " + response.status);
                    return;
                }

                const json = await response.json();
                let suggestion = this.cleanup_suggestion(json.prediction.toString());

                // Only add non-empty suggestions to the results
                if(suggestion.trim() !== '') {
                    results.push(suggestion);
                }
            }

            // Call the callback with the results only if there are any
            this.requestsOngoing = false;
            if(results.length > 0) {
                callback(results);
            }
            else {
                console.warn("Suggestion request ended with no results.");
            }

        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error("Error during fetch: " + error)
            }
            this.requestsOngoing = false;
        }
    }

    static cleanup_suggestion(suggestion) {
        // Cut off the rest after the last dot that is in the last 30% of the suggestion.
        let cutoffIndex = suggestion.lastIndexOf('.');
        if (cutoffIndex !== -1 && cutoffIndex >= Math.floor(suggestion.length * 0.7)) {
            suggestion = suggestion.substring(0, cutoffIndex + 1);
        } else {
            // If no dot is found in the last 70%, cut off after the last space in the suggestion.
            cutoffIndex = suggestion.lastIndexOf(' ');
            if (cutoffIndex !== -1) {
                suggestion = suggestion.substring(0, cutoffIndex);
            }
        }
        return suggestion;
    }
}