export default class TextSuggestion {
    static timer = null;
    static abortController = new AbortController();
    static requestsOngoing = false;
    static instruct = "https://btn6x16.inf.uni-bayreuth.de/zephyr-7b-beta/api/v1/predict";
    static continuation = "https://btn6x16.inf.uni-bayreuth.de/mistral-7b/api/v1/predict";

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
     * @param prompt The context that is being passed to the language model
     * @param suggestionCount The number of suggestions to generate
     * @param check Function to check if suggestion is appropriate for current position
     * @param callback Function that should be called upon receiving a response.
     *        This function has to take a list of strings as parameters.
     * @param delay_in_ms The delay in milliseconds before the request is sent.
     * @param model The model to use for generating the suggestion
     * @param kwargs Additional parameters for the model
     */
    static generateSuggestion(prompt,
                              suggestionCount = 1,
                              check,
                              callback,
                              delay_in_ms = 1000,
                              model = TextSuggestion.instruct, kwargs = {
            "repetition_penalty": 1.2,
            "max_new_tokens": 20,
            "use_cache": true,
            "do_sample": true,
            "length_penalty": -1
        }) {
        // If a timer is already running, clear it.
        this.clearTimer();
        if (!check()) return;

        // Start a new timer that calls the server after 200ms.
        this.timer = setTimeout(() => {
            this._makeRequest(prompt, suggestionCount, callback, model, kwargs);
        }, delay_in_ms);
    }

    static async _makeRequest(prompt, suggestionCount, callback, model, kwargs) {
        this.requestsOngoing = true;

        /*
        const response = []
        for(let i = 0; i < suggestionCount; i++) {
            response.push("This is a test suggestion " + i);
        }
        callback(response);
        return;

         */

        const api_key = "alpacas#are#curly#llamas";
        const signal = this.abortController.signal;

        // Create an array to hold all the fetch promises
        let fetchPromises = [];
        const data = JSON.stringify({
            "input": prompt,
            "kwargs": kwargs
        });

        for(let i = 0; i < suggestionCount; i++) {
            // Create a new fetch request for each request and add it to the array
            let fetchPromise = fetch(model, {
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