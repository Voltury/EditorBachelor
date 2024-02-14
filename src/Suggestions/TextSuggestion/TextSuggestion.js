export default class TextSuggestion {
    static delayInMs = 1000;
    static timer = null;
    static xhr = new XMLHttpRequest();

    /**
     * Clears the internal timer and cancels ongoing requests
     */
    static clearTimer(){
        // reset timer
        if (this.timer) {
            clearTimeout(this.timer);
        }
        // If a request is already in progress, abort it.
        if (this.xhr) {
            this.xhr.abort();
        }
    }

    /**
     *
     * @param prompt The context that is being passed to the language model
     * @param max_new_tokens Maximum length of the answer in tokens
     * @param plugin reference of the plugin calling
     * @param check Function to check if suggestion is appropriate for current position
     * @param callback Function that should be called upon receiving a response.
     * This function has to take a single string as parameters.
     */
    static generateSuggestion(prompt, max_new_tokens, plugin, check, callback) {
        // If a timer is already running, clear it.
        this.clearTimer();
        const bound_check = check.bind(plugin)
        if(!bound_check()) return;

        // Start a new timer that calls the server after 200ms.
        this.timer = setTimeout(() => {
            this._makeRequest(prompt, max_new_tokens, plugin, callback);
        }, this.delayInMs);
    }

    /**
     *
     * @param prompt The context that is being passed to the language model
     * @param max_new_tokens Maximum length of the answer in tokens
     * @param plugin reference of the plugin calling
     * @param callback Function that should be called upon receiving a response.
     * This function has to take a single string as parameters.
     */
    static _makeRequest(prompt, max_new_tokens, plugin, callback) {
        const bound_func = callback.bind(plugin);

        bound_func("Suggestion")
        return;

        const url = "https://btn6x16.inf.uni-bayreuth.de/mistral-7b-instruct/api/v1/predict";
        const api_key = "alpacas#are#curly#llamas";

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

        this.xhr.open("POST", url, true);
        this.xhr.setRequestHeader("Content-Type", "application/json");
        this.xhr.setRequestHeader("X-API-Key", api_key);

        this.xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                const json = JSON.parse(this.responseText);
                bound_func(json.prediction.toString()); // call the callback with the prediction
                // Here you can handle the prediction as needed
            } else if (this.readyState === 4) {
                console.log(this.responseText);
            }
        };

        this.xhr.send(data);
    }
}
