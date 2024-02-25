export default class TextSuggestion {
    static delayInMs = 1000;
    static timer = null;
    static xhrs = []; // Array to hold all active XMLHttpRequests

    /**
     * Clears the internal timer and cancels ongoing requests
     */
    static clearTimer() {
        // reset timer
        if (this.timer) {
            clearTimeout(this.timer);
        }
        // If a request is already in progress, abort it.
        for(let i = 0; i < this.xhrs.length; i++) {
            if (this.xhrs[i]) {
                this.xhrs[i].abort();
            }
        }
        // Clear the array of XMLHttpRequests
        this.xhrs = [];
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

    static _makeRequest(prompt, suggestionCount, max_new_tokens, callback) {
        /*
       // Mocking the response
       var responses = [];
       for(var i = 0; i < suggestionCount; i++) {
           responses.push("Suggestion " + Math.floor(Math.random() * 100));
       }
       callback(responses);
       return;

       */

        // The actual request
        const url = "https://btn6x16.inf.uni-bayreuth.de/mistral-7b-instruct/api/v1/predict";
        const api_key = "alpacas#are#curly#llamas";

        var responses = [];

        for(let i = 0; i < suggestionCount; i++) {
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

            // Create a new XMLHttpRequest for each request
            let xhr = new XMLHttpRequest();
            this.xhrs.push(xhr); // Add the new XMLHttpRequest to the array

            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("X-API-Key", api_key);

            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    // Remove the XMLHttpRequest from the array
                    const index = TextSuggestion.xhrs.indexOf(xhr);
                    if (index > -1) {
                        TextSuggestion.xhrs.splice(index, 1);
                    }

                    if (this.status === 200) {
                        const json = JSON.parse(this.responseText);
                        responses.push(json.prediction.toString());
                    } else {
                        console.log(this.responseText);
                    }
                    if (responses.length === suggestionCount) {
                        callback(responses);
                    }
                }
            };


            xhr.send(data);
        }
    }
}