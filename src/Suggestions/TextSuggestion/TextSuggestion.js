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
     * @param prompt The context that is being passed to the language model
     * @param suggestionCount Number of suggestions to generate
     * @param max_new_tokens Maximum length of the answer in tokens
     * @param check Function to check if suggestion is appropriate for current position
     * @param callback Function that should be called upon receiving a response.
     * This function has to take a single string as parameters.
     */
    static generateSuggestion(prompt, suggestionCount, max_new_tokens, check, callback) {
        // If a timer is already running, clear it.
        this.clearTimer();
        if (!check()) return;

        // Start a new timer that calls the server after 200ms.
        this.timer = setTimeout(() => {
            this._makeRequest(prompt, suggestionCount, max_new_tokens, callback);
        }, this.delayInMs);
    }

    static async _makeRequest(prompt, suggestionCount, max_new_tokens, callback) {
        this.requestsOngoing = true;
        // The actual request
        const url = "https://btn6x16.inf.uni-bayreuth.de/mistral-7b-instruct/api/v1/predict";
        const api_key = "alpacas#are#curly#llamas";

        const signal = this.abortController.signal;

        // Create an array to hold all the fetch promises
        let fetchPromises = [];
        const data = JSON.stringify({
            "input": prompt, // get editor data as input
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
                    console.log("HTTP error " + response.status);
                    return;
                }

                const json = await response.json();
                results.push(json.prediction.toString());
            }
            // Call the callback with the results
            this.requestsOngoing = false;
            callback(results);
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Fetch aborted');
            } else {
                throw error;
            }
        }
    }
}