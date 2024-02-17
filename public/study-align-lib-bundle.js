(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("studyAlignLib", [], factory);
	else if(typeof exports === 'object')
		exports["studyAlignLib"] = factory();
	else
		root["studyAlignLib"] = factory();
})(self, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/interactions.ts":
/*!*****************************!*\
  !*** ./src/interactions.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MouseInteraction": () => (/* binding */ MouseInteraction),
/* harmony export */   "DragInteraction": () => (/* binding */ DragInteraction),
/* harmony export */   "TouchInteraction": () => (/* binding */ TouchInteraction),
/* harmony export */   "KeyboardInteraction": () => (/* binding */ KeyboardInteraction),
/* harmony export */   "GenericInteraction": () => (/* binding */ GenericInteraction)
/* harmony export */ });
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! uuid */ "./node_modules/uuid/dist/esm-browser/v4.js");

class InteractionBase {
    constructor(eventType, timestamp, metaData) {
        this.uuid = (0,uuid__WEBPACK_IMPORTED_MODULE_0__.default)();
        this.event = eventType;
        this.time = timestamp;
        this.metaData = metaData;
    }
}
class MouseInteraction extends InteractionBase {
    constructor(eventType, timestamp, mouseEvent, relatedTarget = {}, metaData = {}) {
        super(eventType, timestamp, metaData);
        this.screenX = mouseEvent.screenX;
        this.screenY = mouseEvent.screenY;
        this.clientX = mouseEvent.clientX;
        this.clientY = mouseEvent.clientY;
        this.ctrlKey = mouseEvent.ctrlKey;
        this.shiftKey = mouseEvent.shiftKey;
        this.altKey = mouseEvent.altKey;
        this.metaKey = mouseEvent.metaKey;
        this.button = mouseEvent.button;
        this.relatedTarget = relatedTarget;
        this.x = mouseEvent.screenX;
        this.y = mouseEvent.screenY;
    }
}
class DragInteraction extends MouseInteraction {
    constructor(eventType, timestamp, dragEvent, relatedTarget = {}, metaData = {}) {
        super(eventType, timestamp, dragEvent, relatedTarget, metaData);
    }
}
class TouchBase {
    constructor(touch) {
        this.uuid = (0,uuid__WEBPACK_IMPORTED_MODULE_0__.default)();
        this.altitudeAngle = touch.altitudeAngle;
        this.azimuthAngle = touch.azimuthAngle;
        this.clientX = touch.clientX;
        this.clientY = touch.clientY;
        this.force = touch.force;
        this.identifier = touch.identifier;
        this.pageX = touch.pageX;
        this.pageY = touch.pageY;
        this.radiusX = touch.radiusX;
        this.radiusY = touch.radiusY;
        this.rotationAngle = touch.rotationAngle;
        this.screenX = touch.screenX;
        this.screenY = touch.screenY;
        this.target = touch.target;
        this.touchType = touch.touchType;
    }
}
class TouchInteraction extends InteractionBase {
    constructor(eventType, timestamp, touchEvent, metaData = {}) {
        super(eventType, timestamp, metaData);
        this.changedTouches = [];
        this.targetTouches = [];
        this.touches = [];
        this.altKey = touchEvent.altKey;
        this.ctrlKey = touchEvent.ctrlKey;
        this.metaKey = touchEvent.metaKey;
        this.shiftKey = touchEvent.shiftKey;
        if (touchEvent.changedTouches && touchEvent.changedTouches.length > 0) {
            for (let i = 0; i < touchEvent.changedTouches.length; i++) {
                this.changedTouches.push(new TouchBase(touchEvent.changedTouches[i]));
            }
        }
        if (touchEvent.targetTouches && touchEvent.targetTouches.length > 0) {
            for (let i = 0; i < touchEvent.targetTouches.length; i++) {
                this.targetTouches.push(new TouchBase(touchEvent.targetTouches[i]));
            }
        }
        if (touchEvent.touches && touchEvent.touches.length > 0) {
            for (let i = 0; i < touchEvent.touches.length; i++) {
                this.touches.push(new TouchBase(touchEvent.touches[i]));
            }
        }
    }
}
class KeyboardInteraction extends InteractionBase {
    constructor(eventType, timestamp, keyboardEvent, metaData = {}) {
        super(eventType, timestamp, metaData);
        this.altKey = keyboardEvent.altKey;
        this.code = keyboardEvent.code;
        this.isComposing = keyboardEvent.isComposing;
        this.key = keyboardEvent.key;
        this.location = keyboardEvent.location;
        this.metaKey = keyboardEvent.metaKey;
        this.repeat = keyboardEvent.repeat;
        this.shiftKey = keyboardEvent.shiftKey;
    }
}
class GenericInteraction extends InteractionBase {
    constructor(eventType, timestamp, genericEventData, metaData = {}) {
        super(eventType, timestamp, metaData);
        this.data = genericEventData;
    }
}


/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/regex.js":
/*!*****************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/regex.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/rng.js":
/*!***************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/rng.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ rng)
/* harmony export */ });
// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  // lazy load so that environments that need to polyfill have a chance to do so
  if (!getRandomValues) {
    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
    // find the complete implementation of crypto (msCrypto) on IE11.
    getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);

    if (!getRandomValues) {
      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
    }
  }

  return getRandomValues(rnds8);
}

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/stringify.js":
/*!*********************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/stringify.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./validate.js */ "./node_modules/uuid/dist/esm-browser/validate.js");

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */

var byteToHex = [];

for (var i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).substr(1));
}

function stringify(arr) {
  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!(0,_validate_js__WEBPACK_IMPORTED_MODULE_0__.default)(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (stringify);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/v4.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/v4.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rng.js */ "./node_modules/uuid/dist/esm-browser/rng.js");
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist/esm-browser/stringify.js");



function v4(options, buf, offset) {
  options = options || {};
  var rnds = options.random || (options.rng || _rng_js__WEBPACK_IMPORTED_MODULE_0__.default)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (var i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return (0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__.default)(rnds);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v4);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/validate.js":
/*!********************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/validate.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./regex.js */ "./node_modules/uuid/dist/esm-browser/regex.js");


function validate(uuid) {
  return typeof uuid === 'string' && _regex_js__WEBPACK_IMPORTED_MODULE_0__.default.test(uuid);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (validate);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!********************************!*\
  !*** ./src/study-align-lib.ts ***!
  \********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _interactions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./interactions */ "./src/interactions.ts");

class StudyAlignLib {
    constructor(url = "http://localhost:8080", studyId) {
        // Interaction Lists (Web Events only), needed for bulk saving
        this.mouseInteractionList = [];
        this.dragInteractionList = [];
        this.keyboardInteractionList = [];
        this.touchInteractionList = [];
        this.genericInteractionList = [];
        this.apiVersion = "v1";
        this.url = url;
        this.studyId = studyId;
        this.apiUrl = this.url + "/api/" + this.apiVersion;
    }
    getTimestamp() {
        return Date.now;
    }
    getTimestampWithOffset() {
        const date = new Date();
        date.setMinutes(date.getMinutes() + (-1 * date.getTimezoneOffset()));
        return date.getTime();
    }
    setHeaders(options, refresh = false) {
        const access_token = !refresh ? this.readTokens("access_token") : this.readTokens("refresh_token");
        options.headers["Authorization"] = "Bearer " + access_token;
        options.headers["Content-type"] = "application/json";
    }
    setLoggerHeaders(options) {
        if (this.loggerKey) {
            options.headers["Studyalign-Logger-Key"] = this.loggerKey;
        }
        options.headers["Content-type"] = "application/json";
    }
    request(options) {
        const encodeParams = (data) => {
            return Object.keys(data).map((key) => {
                return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
            }).join('&');
        };
        return new Promise((resolve, reject) => {
            let url = this.apiUrl + "/" + options.path;
            let xhr = new XMLHttpRequest();
            xhr.open(options.method, url);
            if (options.onload) {
                xhr.onload = options.onload;
            }
            else {
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve({
                            status: xhr.status,
                            body: xhr.response ? JSON.parse(xhr.response) : ""
                        });
                    }
                    else {
                        reject({
                            status: xhr.status,
                            statusText: xhr.statusText,
                            requestBody: options.body
                        });
                    }
                };
            }
            if (options.onprogress) {
                xhr.onprogress = options.onprogress;
            }
            if (options.onerror) {
                xhr.onerror = options.onerror;
            }
            else {
                xhr.onerror = () => {
                    reject({
                        status: xhr.status,
                        statusText: xhr.statusText,
                        requestBody: options.body
                    });
                };
            }
            if (options.headers) {
                Object.keys(options.headers).forEach((key) => {
                    xhr.setRequestHeader(key, options.headers[key]);
                });
            }
            if (options.method === "GET" || options.method === "DELETE") {
                let params = options.params;
                let encodedParams = "";
                if (params && typeof params === 'object') {
                    encodedParams = encodeParams(params);
                }
                xhr.send(encodedParams);
            }
            if (options.method === "POST" || options.method === "PATCH") {
                xhr.send(options.formData ? encodeParams(options.body) : JSON.stringify(options.body));
            }
        });
    }
    basicCreate(path, data) {
        let options = {
            method: "POST",
            path: path,
            headers: {}
        };
        this.setHeaders(options);
        options.body = data;
        return this.request(options);
    }
    basicRead(path) {
        const options = {
            method: "GET",
            path: path,
            headers: {}
        };
        this.setHeaders(options);
        return this.request(options);
    }
    basicUpdate(path, data) {
        let options = {
            method: "PATCH",
            path: path,
            headers: {}
        };
        this.setHeaders(options);
        options.body = data;
        return this.request(options);
    }
    basicDelete(path) {
        let options = {
            method: "DELETE",
            path: path,
            headers: {}
        };
        this.setHeaders(options);
        const yo = this.request(options);
        console.log(yo);
        return yo;
    }
    // Admin related functions
    userLogin(username, password) {
        const options = {
            method: "POST",
            path: "users/login",
            headers: {},
            body: { username: username, password: password },
            formData: true
        };
        options.headers["Content-type"] = "application/x-www-form-urlencoded";
        return this.request(options);
    }
    userMe() {
        return this.basicRead("users/me");
    }
    userRefreshToken() {
        const options = {
            method: "GET",
            path: "users/refresh",
            headers: {}
        };
        this.setHeaders(options, true);
        return this.request(options);
    }
    getUsers() {
        return this.basicRead("users");
    }
    getUser(userId) {
        return this.basicRead("users/" + userId);
    }
    createUser(user) {
        return this.basicCreate("users", user);
    }
    updateUser(userId, user) {
        return this.basicUpdate("users/" + userId, user);
    }
    deleteUser(userId) {
        return this.basicDelete("users/" + userId);
    }
    // ---- MAINLY FOR USE IN ADMIN FRONTEND ---- //
    // Studies
    getStudies() {
        return this.basicRead("studies");
    }
    createStudy(study) {
        return this.basicCreate("studies", study);
    }
    updateStudy(studyId, study) {
        return this.basicUpdate("studies/" + studyId, study);
    }
    deleteStudy(studyId) {
        return this.basicDelete("studies/" + studyId);
    }
    generateProcedureWithSteps(studyId, procedureScheme) {
        return this.basicCreate("studies/" + studyId + "/procedures", procedureScheme);
    }
    getParticipants(studyId) {
        return this.basicRead("studies/" + studyId + "/participants");
    }
    generateParticipants(studyId, amount) {
        const options = {
            method: "POST",
            path: "studies/" + studyId + "/participants",
            headers: {},
            body: { amount: amount },
            formData: true,
        };
        this.setHeaders(options);
        return this.request(options);
    }
    populateSurveyParticipants(studyId) {
        return this.basicRead("studies/" + studyId + "/survey-participants");
    }
    // Conditions
    getConditionIds(studyId) {
        const options = {
            method: "GET",
            path: "conditions/ids",
            headers: {},
            body: { study_id: studyId },
            formData: true,
        };
        this.setHeaders(options);
        return this.request(options);
    }
    getCondition(conditionId) {
        return this.basicRead("conditions/" + conditionId);
    }
    getConditions(studyId) {
        return this.basicRead("studies/" + studyId + "/conditions");
    }
    createCondition(condition) {
        return this.basicCreate("conditions", condition);
    }
    updateCondition(conditionId, condition) {
        return this.basicUpdate("conditions/" + conditionId, condition);
    }
    deleteCondition(conditionId) {
        return this.basicDelete("conditions/" + conditionId);
    }
    getTasks(studyId) {
        return this.basicRead("studies/" + studyId + "/tasks");
    }
    getTexts(studyId) {
        return this.basicRead("studies/" + studyId + "/texts");
    }
    getQuestionnaires(studyId) {
        return this.basicRead("studies/" + studyId + "/questionnaires");
    }
    getPauses(studyId) {
        return this.basicRead("studies/" + studyId + "/pauses");
    }
    // Procedures
    getProcedures(studyId) {
        const options = {
            method: "GET",
            path: "procedures",
            headers: {},
            body: { study_id: studyId },
            formData: true,
        };
        this.setHeaders(options);
        return this.request(options);
    }
    // Participants
    getParticipantsByProcedure(procedureId) {
        const options = {
            method: "GET",
            path: "participants",
            headers: {},
            body: { procedure_id: procedureId },
            formData: true,
        };
        this.setHeaders(options);
        return this.request(options);
    }
    getParticipantById(participantId) {
        return this.basicRead("participants/" + participantId);
    }
    endParticipantPause(participantToken) {
        return this.basicRead("participants/" + participantToken + "/end-pause");
    }
    //Tasks
    createTask(task) {
        return this.basicCreate("tasks", task);
    }
    getTask(taskId) {
        return this.basicRead("tasks/" + taskId);
    }
    updateTask(taskId, task) {
        return this.basicUpdate("tasks/" + taskId, task);
    }
    deleteTask(taskId) {
        return this.basicDelete("tasks/" + taskId);
    }
    //Texts
    createText(text) {
        return this.basicCreate("texts", text);
    }
    getText(textId) {
        return this.basicRead("texts/" + textId);
    }
    updateText(textId, text) {
        return this.basicUpdate("texts/" + textId, text);
    }
    deleteText(textId) {
        return this.basicDelete("texts/" + textId);
    }
    //Questionnaires
    createQuestionnaire(questionnaire) {
        return this.basicCreate("questionnaires", questionnaire);
    }
    getQuestionnaire(questionnaireId) {
        return this.basicRead("questionnaires/" + questionnaireId);
    }
    updateQuestionnaire(questionnaireId, questionnaire) {
        return this.basicUpdate("questionnaires/" + questionnaireId, questionnaire);
    }
    deleteQuestionnaire(questionnaireId) {
        return this.basicDelete("questionnaires/" + questionnaireId);
    }
    //Pauses
    createPause(pause) {
        return this.basicCreate("pauses", pause);
    }
    getPause(pauseId) {
        return this.basicRead("pauses/" + pauseId);
    }
    updatePause(pauseId, pause) {
        return this.basicUpdate("pauses/" + pauseId, pause);
    }
    deletePause(pauseId) {
        return this.basicDelete("pauses/" + pauseId);
    }
    // ---- MAINLY FOR USE IN STUDY FRONTEND ---- //
    //TODO: read condition config
    //Study Frontend related functions
    getStudy(studyId) {
        const options = {
            method: "GET",
            path: "studies/" + (studyId || this.studyId),
        };
        return this.request(options);
    }
    getStudySetupInfo(studyId) {
        return this.basicRead("studies/" + studyId + "/setup-info");
    }
    // Participation related methods
    getParticipant(participantToken) {
        const options = {
            method: "GET",
            path: "participants/token/" + participantToken,
        };
        return this.request(options);
    }
    participate(participantToken) {
        let options = {
            method: "GET",
            path: "studies/" + this.studyId + "/participate"
        };
        if (participantToken) {
            options = {
                method: "GET",
                path: "studies/" + this.studyId + "/participate/" + participantToken
            };
        }
        return this.request(options);
    }
    setLoggerKey(loggerKey) {
        this.loggerKey = loggerKey;
    }
    storeTokens(responseJson) {
        localStorage.setItem("tokens", JSON.stringify(responseJson));
    }
    updateAccessToken(responseJson) {
        const tokens = this.readTokens();
        tokens["access_token"] = responseJson["access_token"];
        this.storeTokens(tokens);
    }
    readTokens(key = null) {
        let tokens = localStorage.getItem("tokens");
        if (tokens) {
            tokens = JSON.parse(tokens);
            if (key) {
                return tokens[key];
            }
            return tokens;
        }
        return null;
    }
    deleteTokens() {
        localStorage.removeItem("tokens");
    }
    refreshToken() {
        const options = {
            method: "GET",
            path: "participants/refresh",
            headers: {}
        };
        this.setHeaders(options, true);
        return this.request(options);
    }
    me() {
        const options = {
            method: "GET",
            path: "participants/me",
            headers: {}
        };
        this.setHeaders(options);
        return this.request(options);
    }
    getProcedure(procedureId) {
        const options = {
            method: "GET",
            path: "procedures/" + procedureId,
            headers: {}
        };
        this.setHeaders(options);
        console.log(options);
        return this.request(options);
    }
    // Helper method to create bulks from interaction lists
    buildBulkList(interactionList, bulkSize = 10) {
        const bulks = [];
        while (this[interactionList].length > bulkSize) {
            bulks.push(this[interactionList].splice(0, bulkSize));
        }
        if (this[interactionList].length > 0) {
            bulks.push(this[interactionList].splice(0, this[interactionList].length));
        }
        return bulks;
    }
    // TODO: type callback correctly, starting point could be (conditionId: number, interactions: object[]) => Promise<any>
    logInteractionBulk(path, conditionId, interactionList, bulkSize, logInteractionBulkRequest) {
        const interactionBulks = this.buildBulkList(interactionList, bulkSize);
        const interactionBulkRequests = [];
        for (let i = 0; i < interactionBulks.length; i++) {
            interactionBulkRequests.push(logInteractionBulkRequest(path, conditionId, interactionBulks[i]));
        }
        return Promise.allSettled(interactionBulkRequests);
    }
    logInteractionBulkRequest(path, conditionId, interactions) {
        const options = {
            method: "POST",
            path: path,
            headers: {}
        };
        this.setLoggerHeaders(options);
        options.body = {
            condition_id: conditionId,
            interactions: interactions
        };
        return this.request(options);
    }
    logInteractionRequest(path, conditionId, interaction) {
        const options = {
            method: "POST",
            path: path,
            headers: {}
        };
        this.setLoggerHeaders(options);
        options.body = {
            condition_id: conditionId,
            interaction: interaction
        };
        return this.request(options);
    }
    // Mouse Interaction
    logMouseInteraction(conditionId, eventType, mouseEvent, timestamp, relatedTarget = {}, metaData = {}) {
        const interaction = new _interactions__WEBPACK_IMPORTED_MODULE_0__.MouseInteraction(eventType, timestamp, mouseEvent, relatedTarget, metaData);
        const path = "interaction/mouse";
        return this.logInteractionRequest(path, conditionId, interaction);
    }
    addMouseInteraction(eventType, mouseEvent, timestamp, relatedTarget = {}, metaData = {}) {
        this.mouseInteractionList.push(new _interactions__WEBPACK_IMPORTED_MODULE_0__.MouseInteraction(eventType, timestamp, mouseEvent, relatedTarget, metaData));
    }
    logMouseInteractionBulk(conditionId, bulkSize = 10) {
        const interactionType = "mouseInteractionList";
        const path = "interaction/mouse/bulk";
        return this.logInteractionBulk(path, conditionId, interactionType, bulkSize, this.logInteractionBulkRequest.bind(this));
    }
    // Drag Interaction
    logDragInteraction(conditionId, eventType, dragEvent, timestamp, relatedTarget = {}, metaData = {}) {
        const interaction = new _interactions__WEBPACK_IMPORTED_MODULE_0__.DragInteraction(eventType, timestamp, dragEvent, relatedTarget, metaData);
        const path = "interaction/drag";
        return this.logInteractionRequest(path, conditionId, interaction);
    }
    addDragInteraction(eventType, dragEvent, timestamp, relatedTarget = {}, metaData = {}) {
        this.dragInteractionList.push(new _interactions__WEBPACK_IMPORTED_MODULE_0__.DragInteraction(eventType, timestamp, dragEvent, relatedTarget, metaData));
    }
    logDragInteractionBulk(conditionId, bulkSize = 10) {
        const interactionType = "dragInteractionList";
        const path = "interaction/drag/bulk";
        return this.logInteractionBulk(path, conditionId, interactionType, bulkSize, this.logInteractionBulkRequest.bind(this));
    }
    // Keyboard Interaction
    logKeyboardInteraction(conditionId, eventType, keyboardEvent, timestamp, metaData = {}) {
        const interaction = new _interactions__WEBPACK_IMPORTED_MODULE_0__.KeyboardInteraction(eventType, timestamp, keyboardEvent, metaData);
        const path = "interaction/keyboard";
        return this.logInteractionRequest(path, conditionId, interaction);
    }
    addKeyboardInteraction(eventType, keyboardEvent, timestamp, metaData = {}) {
        this.keyboardInteractionList.push(new _interactions__WEBPACK_IMPORTED_MODULE_0__.KeyboardInteraction(eventType, timestamp, keyboardEvent, metaData));
    }
    logKeyboardInteractionBulk(conditionId, bulkSize = 10) {
        const interactionType = "keyboardInteractionList";
        const path = "interaction/keyboard/bulk";
        return this.logInteractionBulk(path, conditionId, interactionType, bulkSize, this.logInteractionBulkRequest.bind(this));
    }
    // Touch Interaction
    logTouchInteraction(conditionId, eventType, touchEvent, timestamp, metaData = {}) {
        const interaction = new _interactions__WEBPACK_IMPORTED_MODULE_0__.TouchInteraction(eventType, timestamp, touchEvent, metaData);
        const path = "interaction/touch";
        return this.logInteractionRequest(path, conditionId, interaction);
    }
    addTouchInteraction(eventType, touchEvent, timestamp, metaData = {}) {
        this.touchInteractionList.push(new _interactions__WEBPACK_IMPORTED_MODULE_0__.TouchInteraction(eventType, timestamp, touchEvent, metaData));
    }
    logTouchInteractionBulk(conditionId, bulkSize = 10) {
        const interactionType = "touchInteractionList";
        const path = "interaction/touch/bulk";
        return this.logInteractionBulk(path, conditionId, interactionType, bulkSize, this.logInteractionBulkRequest.bind(this));
    }
    // Generic Interaction
    logGenericInteraction(conditionId, eventType, genericEvent, timestamp, metaData = {}) {
        const interaction = new _interactions__WEBPACK_IMPORTED_MODULE_0__.GenericInteraction(eventType, timestamp, genericEvent, metaData);
        const path = "interaction/generic";
        return this.logInteractionRequest(path, conditionId, interaction);
    }
    addGenericInteraction(eventType, genericEvent, timestamp, metaData = {}) {
        this.genericInteractionList.push(new _interactions__WEBPACK_IMPORTED_MODULE_0__.GenericInteraction(eventType, timestamp, genericEvent, metaData));
    }
    logGenericInteractionBulk(conditionId, bulkSize = 10) {
        const interactionType = "genericInteractionList";
        const path = "interaction/generic/bulk";
        return this.logInteractionBulk(path, conditionId, interactionType, bulkSize, this.logInteractionBulkRequest.bind(this));
    }
    // Procedure related methods
    startProcedure() {
        const options = {
            method: "GET",
            path: "procedures/start",
            headers: {}
        };
        this.setHeaders(options);
        return this.request(options);
    }
    nextProcedure() {
        const options = {
            method: "GET",
            path: "procedures/next",
            headers: {}
        };
        this.setHeaders(options);
        return this.request(options);
    }
    endProcedure() {
        const options = {
            method: "GET",
            path: "procedures/end",
            headers: {}
        };
        this.setHeaders(options);
        return this.request(options);
    }
    currentProcedureStep() {
        const options = {
            method: "GET",
            path: "procedure-steps",
            headers: {}
        };
        this.setHeaders(options);
        return this.request(options);
    }
    checkSurveyResult() {
        const options = {
            method: "GET",
            path: "procedures/check-survey-result",
            headers: {}
        };
        this.setHeaders(options);
        return this.request(options);
    }
    startNavigator() {
        return new Promise((resolve, reject) => {
            // get the user token (uuid)
            this.me().then(response => {
                if (response.body) {
                    const participantToken = response.body.token;
                    const url = this.apiUrl + "/" + "procedures/navigator?participant=" + participantToken;
                    this.sse = new EventSource(url, { withCredentials: true });
                    resolve(true);
                }
                reject({
                    text: "Participant not found"
                });
            }).catch(error => {
                console.log(error);
                resolve(error);
            });
        });
    }
    closeNavigator() {
        this.sse.close();
    }
    reconnectNavigator() {
        const options = {
            method: "GET",
            path: "procedures/navigator/reconnect",
            headers: {}
        };
        this.setHeaders(options);
        return this.request(options);
    }
    getNavigator() {
        return this.sse;
    }
    updateNavigator(participantToken, source, state, extId) {
        const options = {
            method: "POST",
            path: "procedures/navigator",
            headers: {
                "Content-type": "application/json"
            }
        };
        options.body = {
            participant_token: participantToken,
            source: source,
            state: state,
            ext_id: extId
        };
        return this.request(options);
    }
}
StudyAlignLib.getParamsFromURL = () => {
    const url = new URL(window.location.href);
    const studyId = url.searchParams.get("study_id");
    const conditionId = url.searchParams.get("condition_id") || 1; // value from get parameter or 1 (default)
    const loggerKey = url.searchParams.get("logger_key"); // needed for logging
    const participantToken = url.searchParams.get("participant_token");
    return {
        studyId: studyId,
        conditionId: conditionId,
        loggerKey: loggerKey,
        participantToken: participantToken
    };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (StudyAlignLib);

})();

__webpack_exports__ = __webpack_exports__.default;
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zdHVkeUFsaWduTGliL3dlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbiIsIndlYnBhY2s6Ly9zdHVkeUFsaWduTGliLy4vc3JjL2ludGVyYWN0aW9ucy50cyIsIndlYnBhY2s6Ly9zdHVkeUFsaWduTGliLy4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci9yZWdleC5qcyIsIndlYnBhY2s6Ly9zdHVkeUFsaWduTGliLy4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci9ybmcuanMiLCJ3ZWJwYWNrOi8vc3R1ZHlBbGlnbkxpYi8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvc3RyaW5naWZ5LmpzIiwid2VicGFjazovL3N0dWR5QWxpZ25MaWIvLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3Y0LmpzIiwid2VicGFjazovL3N0dWR5QWxpZ25MaWIvLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3ZhbGlkYXRlLmpzIiwid2VicGFjazovL3N0dWR5QWxpZ25MaWIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vc3R1ZHlBbGlnbkxpYi93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vc3R1ZHlBbGlnbkxpYi93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3N0dWR5QWxpZ25MaWIvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9zdHVkeUFsaWduTGliLy4vc3JjL3N0dWR5LWFsaWduLWxpYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsTzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ1ZrQztBQUVs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QUFHLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBRW5FLE9BQU87UUFDSCxPQUFPLEVBQUUsT0FBTztRQUNoQixXQUFXLEVBQUUsV0FBVztRQUN4QixTQUFTLEVBQUUsU0FBUztRQUNwQixnQkFBZ0IsRUFBRSxnQkFBZ0I7S0FDckM7QUFDTCxDQUFDO0FBb3VCTCxpRUFBZSxhQUFhLEVBQUMiLCJmaWxlIjoic3R1ZHktYWxpZ24tbGliLWJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFwic3R1ZHlBbGlnbkxpYlwiLCBbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJzdHVkeUFsaWduTGliXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcInN0dWR5QWxpZ25MaWJcIl0gPSBmYWN0b3J5KCk7XG59KShzZWxmLCBmdW5jdGlvbigpIHtcbnJldHVybiAiLCJpbXBvcnQge3Y0IGFzIHV1aWR2NH0gZnJvbSBcInV1aWRcIjtcblxuY2xhc3MgSW50ZXJhY3Rpb25CYXNlIHtcbiAgICB1dWlkOiBzdHJpbmc7XG4gICAgZXZlbnQ6IHN0cmluZztcbiAgICB0aW1lOiBudW1iZXI7XG4gICAgbWV0YURhdGE6IG9iamVjdDtcblxuICAgIGNvbnN0cnVjdG9yKGV2ZW50VHlwZTogc3RyaW5nLCB0aW1lc3RhbXA6IG51bWJlciwgbWV0YURhdGE6IG9iamVjdCkge1xuICAgICAgICB0aGlzLnV1aWQgPSB1dWlkdjQoKTtcbiAgICAgICAgdGhpcy5ldmVudCA9IGV2ZW50VHlwZTtcbiAgICAgICAgdGhpcy50aW1lID0gdGltZXN0YW1wO1xuICAgICAgICB0aGlzLm1ldGFEYXRhID0gbWV0YURhdGE7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgTW91c2VJbnRlcmFjdGlvbiBleHRlbmRzIEludGVyYWN0aW9uQmFzZSB7XG4gICAgc2NyZWVuWDogbnVtYmVyO1xuICAgIHNjcmVlblk6IG51bWJlcjtcbiAgICBjbGllbnRYOiBudW1iZXI7XG4gICAgY2xpZW50WTogbnVtYmVyO1xuICAgIGN0cmxLZXk6IGJvb2xlYW47XG4gICAgc2hpZnRLZXk6IGJvb2xlYW47XG4gICAgYWx0S2V5OiBib29sZWFuO1xuICAgIG1ldGFLZXk6IGJvb2xlYW47XG4gICAgYnV0dG9uOiBudW1iZXI7XG4gICAgcmVsYXRlZFRhcmdldDogb2JqZWN0O1xuICAgIHg6IG51bWJlcjtcbiAgICB5OiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihldmVudFR5cGU6IHN0cmluZywgdGltZXN0YW1wOiBudW1iZXIsIG1vdXNlRXZlbnQ6IE1vdXNlRXZlbnQsIHJlbGF0ZWRUYXJnZXQgPSB7fSwgbWV0YURhdGEgPSB7fSkge1xuICAgICAgICBzdXBlcihldmVudFR5cGUsIHRpbWVzdGFtcCwgbWV0YURhdGEpO1xuICAgICAgICB0aGlzLnNjcmVlblggPSBtb3VzZUV2ZW50LnNjcmVlblg7XG4gICAgICAgIHRoaXMuc2NyZWVuWSA9IG1vdXNlRXZlbnQuc2NyZWVuWTtcbiAgICAgICAgdGhpcy5jbGllbnRYID0gbW91c2VFdmVudC5jbGllbnRYO1xuICAgICAgICB0aGlzLmNsaWVudFkgPSBtb3VzZUV2ZW50LmNsaWVudFk7XG4gICAgICAgIHRoaXMuY3RybEtleSA9IG1vdXNlRXZlbnQuY3RybEtleTtcbiAgICAgICAgdGhpcy5zaGlmdEtleSA9IG1vdXNlRXZlbnQuc2hpZnRLZXk7XG4gICAgICAgIHRoaXMuYWx0S2V5ID0gbW91c2VFdmVudC5hbHRLZXk7XG4gICAgICAgIHRoaXMubWV0YUtleSA9IG1vdXNlRXZlbnQubWV0YUtleTtcbiAgICAgICAgdGhpcy5idXR0b24gPSBtb3VzZUV2ZW50LmJ1dHRvbjtcbiAgICAgICAgdGhpcy5yZWxhdGVkVGFyZ2V0ID0gcmVsYXRlZFRhcmdldDtcbiAgICAgICAgdGhpcy54ID0gbW91c2VFdmVudC5zY3JlZW5YO1xuICAgICAgICB0aGlzLnkgPSBtb3VzZUV2ZW50LnNjcmVlblk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgRHJhZ0ludGVyYWN0aW9uIGV4dGVuZHMgTW91c2VJbnRlcmFjdGlvbiB7XG4gICAgY29uc3RydWN0b3IoZXZlbnRUeXBlOiBzdHJpbmcsIHRpbWVzdGFtcDogbnVtYmVyLCBkcmFnRXZlbnQ6IERyYWdFdmVudCwgcmVsYXRlZFRhcmdldCA9IHt9LCBtZXRhRGF0YSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKGV2ZW50VHlwZSwgdGltZXN0YW1wLCBkcmFnRXZlbnQsIHJlbGF0ZWRUYXJnZXQsIG1ldGFEYXRhKTtcbiAgICB9XG59XG5cbmNsYXNzIFRvdWNoQmFzZSB7XG4gICAgdXVpZDogc3RyaW5nO1xuICAgIGFsdGl0dWRlQW5nbGU6IG51bWJlcjtcbiAgICBhemltdXRoQW5nbGU6IG51bWJlcjtcbiAgICBjbGllbnRYOiBudW1iZXI7XG4gICAgY2xpZW50WTogbnVtYmVyO1xuICAgIGZvcmNlOiBudW1iZXI7XG4gICAgaWRlbnRpZmllcjogbnVtYmVyO1xuICAgIHNjcmVlblg6IG51bWJlcjtcbiAgICBzY3JlZW5ZOiBudW1iZXI7XG4gICAgcGFnZVg6IG51bWJlcjtcbiAgICBwYWdlWTogbnVtYmVyO1xuICAgIHJhZGl1c1g6IG51bWJlcjtcbiAgICByYWRpdXNZOiBudW1iZXI7XG4gICAgcm90YXRpb25BbmdsZTogbnVtYmVyO1xuICAgIHRhcmdldDogb2JqZWN0O1xuICAgIHRvdWNoVHlwZTogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IodG91Y2g6IFRvdWNoKSB7XG4gICAgICAgIHRoaXMudXVpZCA9IHV1aWR2NCgpO1xuICAgICAgICB0aGlzLmFsdGl0dWRlQW5nbGUgPSB0b3VjaC5hbHRpdHVkZUFuZ2xlO1xuICAgICAgICB0aGlzLmF6aW11dGhBbmdsZSA9IHRvdWNoLmF6aW11dGhBbmdsZTtcbiAgICAgICAgdGhpcy5jbGllbnRYID0gdG91Y2guY2xpZW50WDtcbiAgICAgICAgdGhpcy5jbGllbnRZID0gdG91Y2guY2xpZW50WTtcbiAgICAgICAgdGhpcy5mb3JjZSA9IHRvdWNoLmZvcmNlO1xuICAgICAgICB0aGlzLmlkZW50aWZpZXIgPSB0b3VjaC5pZGVudGlmaWVyO1xuICAgICAgICB0aGlzLnBhZ2VYID0gdG91Y2gucGFnZVg7XG4gICAgICAgIHRoaXMucGFnZVkgPSB0b3VjaC5wYWdlWTtcbiAgICAgICAgdGhpcy5yYWRpdXNYID0gdG91Y2gucmFkaXVzWDtcbiAgICAgICAgdGhpcy5yYWRpdXNZID0gdG91Y2gucmFkaXVzWTtcbiAgICAgICAgdGhpcy5yb3RhdGlvbkFuZ2xlID0gdG91Y2gucm90YXRpb25BbmdsZTtcbiAgICAgICAgdGhpcy5zY3JlZW5YID0gdG91Y2guc2NyZWVuWDtcbiAgICAgICAgdGhpcy5zY3JlZW5ZID0gdG91Y2guc2NyZWVuWTtcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0b3VjaC50YXJnZXQ7XG4gICAgICAgIHRoaXMudG91Y2hUeXBlID0gdG91Y2gudG91Y2hUeXBlO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRvdWNoSW50ZXJhY3Rpb24gZXh0ZW5kcyBJbnRlcmFjdGlvbkJhc2Uge1xuICAgIGFsdEtleTogYm9vbGVhbjtcbiAgICBjdHJsS2V5OiBib29sZWFuO1xuICAgIG1ldGFLZXk6IGJvb2xlYW47XG4gICAgc2hpZnRLZXk6IGJvb2xlYW47XG4gICAgbWV0YURhdGE6IG9iamVjdDtcblxuICAgIGNoYW5nZWRUb3VjaGVzOiBUb3VjaEJhc2VbXSA9IFtdO1xuICAgIHRhcmdldFRvdWNoZXM6IFRvdWNoQmFzZVtdID0gW107XG4gICAgdG91Y2hlczogVG91Y2hCYXNlW10gPSBbXTtcblxuICAgIGNvbnN0cnVjdG9yKGV2ZW50VHlwZTogc3RyaW5nLCB0aW1lc3RhbXA6IG51bWJlciwgdG91Y2hFdmVudDogVG91Y2hFdmVudCwgbWV0YURhdGEgPSB7fSkge1xuICAgICAgICBzdXBlcihldmVudFR5cGUsIHRpbWVzdGFtcCwgbWV0YURhdGEpO1xuICAgICAgICB0aGlzLmFsdEtleSA9IHRvdWNoRXZlbnQuYWx0S2V5O1xuICAgICAgICB0aGlzLmN0cmxLZXkgPSB0b3VjaEV2ZW50LmN0cmxLZXk7XG4gICAgICAgIHRoaXMubWV0YUtleSA9IHRvdWNoRXZlbnQubWV0YUtleTtcbiAgICAgICAgdGhpcy5zaGlmdEtleSA9IHRvdWNoRXZlbnQuc2hpZnRLZXk7XG5cbiAgICAgICAgaWYgKHRvdWNoRXZlbnQuY2hhbmdlZFRvdWNoZXMgJiYgdG91Y2hFdmVudC5jaGFuZ2VkVG91Y2hlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaTx0b3VjaEV2ZW50LmNoYW5nZWRUb3VjaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VkVG91Y2hlcy5wdXNoKG5ldyBUb3VjaEJhc2UodG91Y2hFdmVudC5jaGFuZ2VkVG91Y2hlc1tpXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRvdWNoRXZlbnQudGFyZ2V0VG91Y2hlcyAmJiB0b3VjaEV2ZW50LnRhcmdldFRvdWNoZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGk8dG91Y2hFdmVudC50YXJnZXRUb3VjaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YXJnZXRUb3VjaGVzLnB1c2gobmV3IFRvdWNoQmFzZSh0b3VjaEV2ZW50LnRhcmdldFRvdWNoZXNbaV0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0b3VjaEV2ZW50LnRvdWNoZXMgJiYgdG91Y2hFdmVudC50b3VjaGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpPHRvdWNoRXZlbnQudG91Y2hlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMudG91Y2hlcy5wdXNoKG5ldyBUb3VjaEJhc2UodG91Y2hFdmVudC50b3VjaGVzW2ldKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBLZXlib2FyZEludGVyYWN0aW9uIGV4dGVuZHMgSW50ZXJhY3Rpb25CYXNlIHtcbiAgICBhbHRLZXk6IGJvb2xlYW47XG4gICAgY29kZTogc3RyaW5nO1xuICAgIGlzQ29tcG9zaW5nOiBib29sZWFuO1xuICAgIGtleTogc3RyaW5nO1xuICAgIC8vbG9jYWxlOiBzdHJpbmc7XG4gICAgbG9jYXRpb246IG51bWJlcjtcbiAgICBtZXRhS2V5OiBib29sZWFuO1xuICAgIHJlcGVhdDogYm9vbGVhbjtcbiAgICBzaGlmdEtleTogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKGV2ZW50VHlwZTogc3RyaW5nLCB0aW1lc3RhbXA6IG51bWJlciwga2V5Ym9hcmRFdmVudDogS2V5Ym9hcmRFdmVudCwgbWV0YURhdGEgPSB7fSkge1xuICAgICAgICBzdXBlcihldmVudFR5cGUsIHRpbWVzdGFtcCwgbWV0YURhdGEpO1xuICAgICAgICB0aGlzLmFsdEtleSA9IGtleWJvYXJkRXZlbnQuYWx0S2V5O1xuICAgICAgICB0aGlzLmNvZGUgPSBrZXlib2FyZEV2ZW50LmNvZGU7XG4gICAgICAgIHRoaXMuaXNDb21wb3NpbmcgPSBrZXlib2FyZEV2ZW50LmlzQ29tcG9zaW5nO1xuICAgICAgICB0aGlzLmtleSA9IGtleWJvYXJkRXZlbnQua2V5O1xuICAgICAgICB0aGlzLmxvY2F0aW9uID0ga2V5Ym9hcmRFdmVudC5sb2NhdGlvbjtcbiAgICAgICAgdGhpcy5tZXRhS2V5ID0ga2V5Ym9hcmRFdmVudC5tZXRhS2V5O1xuICAgICAgICB0aGlzLnJlcGVhdCA9IGtleWJvYXJkRXZlbnQucmVwZWF0O1xuICAgICAgICB0aGlzLnNoaWZ0S2V5ID0ga2V5Ym9hcmRFdmVudC5zaGlmdEtleTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBHZW5lcmljSW50ZXJhY3Rpb24gZXh0ZW5kcyBJbnRlcmFjdGlvbkJhc2Uge1xuICAgIGRhdGE6IG9iamVjdDtcblxuICAgIGNvbnN0cnVjdG9yKGV2ZW50VHlwZTogc3RyaW5nLCB0aW1lc3RhbXA6IG51bWJlciwgZ2VuZXJpY0V2ZW50RGF0YTogb2JqZWN0LCBtZXRhRGF0YSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKGV2ZW50VHlwZSwgdGltZXN0YW1wLCBtZXRhRGF0YSk7XG4gICAgICAgIHRoaXMuZGF0YSA9IGdlbmVyaWNFdmVudERhdGE7XG4gICAgfVxufSIsImV4cG9ydCBkZWZhdWx0IC9eKD86WzAtOWEtZl17OH0tWzAtOWEtZl17NH0tWzEtNV1bMC05YS1mXXszfS1bODlhYl1bMC05YS1mXXszfS1bMC05YS1mXXsxMn18MDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwKSQvaTsiLCIvLyBVbmlxdWUgSUQgY3JlYXRpb24gcmVxdWlyZXMgYSBoaWdoIHF1YWxpdHkgcmFuZG9tICMgZ2VuZXJhdG9yLiBJbiB0aGUgYnJvd3NlciB3ZSB0aGVyZWZvcmVcbi8vIHJlcXVpcmUgdGhlIGNyeXB0byBBUEkgYW5kIGRvIG5vdCBzdXBwb3J0IGJ1aWx0LWluIGZhbGxiYWNrIHRvIGxvd2VyIHF1YWxpdHkgcmFuZG9tIG51bWJlclxuLy8gZ2VuZXJhdG9ycyAobGlrZSBNYXRoLnJhbmRvbSgpKS5cbnZhciBnZXRSYW5kb21WYWx1ZXM7XG52YXIgcm5kczggPSBuZXcgVWludDhBcnJheSgxNik7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBybmcoKSB7XG4gIC8vIGxhenkgbG9hZCBzbyB0aGF0IGVudmlyb25tZW50cyB0aGF0IG5lZWQgdG8gcG9seWZpbGwgaGF2ZSBhIGNoYW5jZSB0byBkbyBzb1xuICBpZiAoIWdldFJhbmRvbVZhbHVlcykge1xuICAgIC8vIGdldFJhbmRvbVZhbHVlcyBuZWVkcyB0byBiZSBpbnZva2VkIGluIGEgY29udGV4dCB3aGVyZSBcInRoaXNcIiBpcyBhIENyeXB0byBpbXBsZW1lbnRhdGlvbi4gQWxzbyxcbiAgICAvLyBmaW5kIHRoZSBjb21wbGV0ZSBpbXBsZW1lbnRhdGlvbiBvZiBjcnlwdG8gKG1zQ3J5cHRvKSBvbiBJRTExLlxuICAgIGdldFJhbmRvbVZhbHVlcyA9IHR5cGVvZiBjcnlwdG8gIT09ICd1bmRlZmluZWQnICYmIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMgJiYgY3J5cHRvLmdldFJhbmRvbVZhbHVlcy5iaW5kKGNyeXB0bykgfHwgdHlwZW9mIG1zQ3J5cHRvICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgbXNDcnlwdG8uZ2V0UmFuZG9tVmFsdWVzID09PSAnZnVuY3Rpb24nICYmIG1zQ3J5cHRvLmdldFJhbmRvbVZhbHVlcy5iaW5kKG1zQ3J5cHRvKTtcblxuICAgIGlmICghZ2V0UmFuZG9tVmFsdWVzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NyeXB0by5nZXRSYW5kb21WYWx1ZXMoKSBub3Qgc3VwcG9ydGVkLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3V1aWRqcy91dWlkI2dldHJhbmRvbXZhbHVlcy1ub3Qtc3VwcG9ydGVkJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGdldFJhbmRvbVZhbHVlcyhybmRzOCk7XG59IiwiaW1wb3J0IHZhbGlkYXRlIGZyb20gJy4vdmFsaWRhdGUuanMnO1xuLyoqXG4gKiBDb252ZXJ0IGFycmF5IG9mIDE2IGJ5dGUgdmFsdWVzIHRvIFVVSUQgc3RyaW5nIGZvcm1hdCBvZiB0aGUgZm9ybTpcbiAqIFhYWFhYWFhYLVhYWFgtWFhYWC1YWFhYLVhYWFhYWFhYWFhYWFxuICovXG5cbnZhciBieXRlVG9IZXggPSBbXTtcblxuZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICBieXRlVG9IZXgucHVzaCgoaSArIDB4MTAwKS50b1N0cmluZygxNikuc3Vic3RyKDEpKTtcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5KGFycikge1xuICB2YXIgb2Zmc2V0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAwO1xuICAvLyBOb3RlOiBCZSBjYXJlZnVsIGVkaXRpbmcgdGhpcyBjb2RlISAgSXQncyBiZWVuIHR1bmVkIGZvciBwZXJmb3JtYW5jZVxuICAvLyBhbmQgd29ya3MgaW4gd2F5cyB5b3UgbWF5IG5vdCBleHBlY3QuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdXVpZGpzL3V1aWQvcHVsbC80MzRcbiAgdmFyIHV1aWQgPSAoYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAwXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDFdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMl1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAzXV0gKyAnLScgKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDRdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgNV1dICsgJy0nICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA2XV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDddXSArICctJyArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgOF1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA5XV0gKyAnLScgKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDEwXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDExXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDEyXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDEzXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDE0XV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDE1XV0pLnRvTG93ZXJDYXNlKCk7IC8vIENvbnNpc3RlbmN5IGNoZWNrIGZvciB2YWxpZCBVVUlELiAgSWYgdGhpcyB0aHJvd3MsIGl0J3MgbGlrZWx5IGR1ZSB0byBvbmVcbiAgLy8gb2YgdGhlIGZvbGxvd2luZzpcbiAgLy8gLSBPbmUgb3IgbW9yZSBpbnB1dCBhcnJheSB2YWx1ZXMgZG9uJ3QgbWFwIHRvIGEgaGV4IG9jdGV0IChsZWFkaW5nIHRvXG4gIC8vIFwidW5kZWZpbmVkXCIgaW4gdGhlIHV1aWQpXG4gIC8vIC0gSW52YWxpZCBpbnB1dCB2YWx1ZXMgZm9yIHRoZSBSRkMgYHZlcnNpb25gIG9yIGB2YXJpYW50YCBmaWVsZHNcblxuICBpZiAoIXZhbGlkYXRlKHV1aWQpKSB7XG4gICAgdGhyb3cgVHlwZUVycm9yKCdTdHJpbmdpZmllZCBVVUlEIGlzIGludmFsaWQnKTtcbiAgfVxuXG4gIHJldHVybiB1dWlkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBzdHJpbmdpZnk7IiwiaW1wb3J0IHJuZyBmcm9tICcuL3JuZy5qcyc7XG5pbXBvcnQgc3RyaW5naWZ5IGZyb20gJy4vc3RyaW5naWZ5LmpzJztcblxuZnVuY3Rpb24gdjQob3B0aW9ucywgYnVmLCBvZmZzZXQpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBybmRzID0gb3B0aW9ucy5yYW5kb20gfHwgKG9wdGlvbnMucm5nIHx8IHJuZykoKTsgLy8gUGVyIDQuNCwgc2V0IGJpdHMgZm9yIHZlcnNpb24gYW5kIGBjbG9ja19zZXFfaGlfYW5kX3Jlc2VydmVkYFxuXG4gIHJuZHNbNl0gPSBybmRzWzZdICYgMHgwZiB8IDB4NDA7XG4gIHJuZHNbOF0gPSBybmRzWzhdICYgMHgzZiB8IDB4ODA7IC8vIENvcHkgYnl0ZXMgdG8gYnVmZmVyLCBpZiBwcm92aWRlZFxuXG4gIGlmIChidWYpIHtcbiAgICBvZmZzZXQgPSBvZmZzZXQgfHwgMDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTY7ICsraSkge1xuICAgICAgYnVmW29mZnNldCArIGldID0gcm5kc1tpXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYnVmO1xuICB9XG5cbiAgcmV0dXJuIHN0cmluZ2lmeShybmRzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdjQ7IiwiaW1wb3J0IFJFR0VYIGZyb20gJy4vcmVnZXguanMnO1xuXG5mdW5jdGlvbiB2YWxpZGF0ZSh1dWlkKSB7XG4gIHJldHVybiB0eXBlb2YgdXVpZCA9PT0gJ3N0cmluZycgJiYgUkVHRVgudGVzdCh1dWlkKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdmFsaWRhdGU7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0aWYoX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSkge1xuXHRcdHJldHVybiBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHtcbiAgICBEcmFnSW50ZXJhY3Rpb24sXG4gICAgR2VuZXJpY0ludGVyYWN0aW9uLFxuICAgIEtleWJvYXJkSW50ZXJhY3Rpb24sXG4gICAgTW91c2VJbnRlcmFjdGlvbixcbiAgICBUb3VjaEludGVyYWN0aW9uXG59IGZyb20gXCIuL2ludGVyYWN0aW9uc1wiO1xuXG5jbGFzcyBTdHVkeUFsaWduTGliIHtcblxuICAgIGFwaVZlcnNpb246IHN0cmluZztcbiAgICB1cmw6IHN0cmluZztcbiAgICBzdHVkeUlkOiBudW1iZXI7XG4gICAgYXBpVXJsOiBzdHJpbmc7XG4gICAgbG9nZ2VyS2V5OiBzdHJpbmc7XG4gICAgc3NlOiBFdmVudFNvdXJjZTtcblxuICAgIC8vIEludGVyYWN0aW9uIExpc3RzIChXZWIgRXZlbnRzIG9ubHkpLCBuZWVkZWQgZm9yIGJ1bGsgc2F2aW5nXG4gICAgbW91c2VJbnRlcmFjdGlvbkxpc3Q6IE1vdXNlSW50ZXJhY3Rpb25bXSA9IFtdO1xuICAgIGRyYWdJbnRlcmFjdGlvbkxpc3Q6IERyYWdJbnRlcmFjdGlvbltdID0gW107XG4gICAga2V5Ym9hcmRJbnRlcmFjdGlvbkxpc3Q6IEtleWJvYXJkSW50ZXJhY3Rpb25bXSA9IFtdO1xuICAgIHRvdWNoSW50ZXJhY3Rpb25MaXN0OiBUb3VjaEludGVyYWN0aW9uW10gPSBbXTtcbiAgICBnZW5lcmljSW50ZXJhY3Rpb25MaXN0OiBHZW5lcmljSW50ZXJhY3Rpb25bXSA9IFtdO1xuXG4gICAgY29uc3RydWN0b3IodXJsID0gXCJodHRwOi8vbG9jYWxob3N0OjgwODBcIiwgc3R1ZHlJZDogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuYXBpVmVyc2lvbiA9IFwidjFcIjtcbiAgICAgICAgdGhpcy51cmwgPSB1cmw7XG4gICAgICAgIHRoaXMuc3R1ZHlJZCA9IHN0dWR5SWQ7XG4gICAgICAgIHRoaXMuYXBpVXJsID0gdGhpcy51cmwgKyBcIi9hcGkvXCIgKyB0aGlzLmFwaVZlcnNpb247XG4gICAgfVxuXG4gICAgc3RhdGljIGdldFBhcmFtc0Zyb21VUkwgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuICAgICAgICBjb25zdCBzdHVkeUlkID0gdXJsLnNlYXJjaFBhcmFtcy5nZXQoXCJzdHVkeV9pZFwiKTtcbiAgICAgICAgY29uc3QgY29uZGl0aW9uSWQgPSB1cmwuc2VhcmNoUGFyYW1zLmdldChcImNvbmRpdGlvbl9pZFwiKSB8fCAxOyAvLyB2YWx1ZSBmcm9tIGdldCBwYXJhbWV0ZXIgb3IgMSAoZGVmYXVsdClcbiAgICAgICAgY29uc3QgbG9nZ2VyS2V5ID0gdXJsLnNlYXJjaFBhcmFtcy5nZXQoXCJsb2dnZXJfa2V5XCIpOyAvLyBuZWVkZWQgZm9yIGxvZ2dpbmdcbiAgICAgICAgY29uc3QgcGFydGljaXBhbnRUb2tlbiA9IHVybC5zZWFyY2hQYXJhbXMuZ2V0KFwicGFydGljaXBhbnRfdG9rZW5cIik7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0dWR5SWQ6IHN0dWR5SWQsXG4gICAgICAgICAgICBjb25kaXRpb25JZDogY29uZGl0aW9uSWQsXG4gICAgICAgICAgICBsb2dnZXJLZXk6IGxvZ2dlcktleSxcbiAgICAgICAgICAgIHBhcnRpY2lwYW50VG9rZW46IHBhcnRpY2lwYW50VG9rZW5cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldFRpbWVzdGFtcCgpIHtcbiAgICAgICAgcmV0dXJuIERhdGUubm93O1xuICAgIH1cblxuICAgIGdldFRpbWVzdGFtcFdpdGhPZmZzZXQoKSB7XG4gICAgICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBkYXRlLnNldE1pbnV0ZXMoZGF0ZS5nZXRNaW51dGVzKCkgKyAoLTEgKiBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCkpKVxuICAgICAgICByZXR1cm4gZGF0ZS5nZXRUaW1lKCk7XG4gICAgfVxuXG4gICAgc2V0SGVhZGVycyhvcHRpb25zOiBPcHRpb25zLCByZWZyZXNoOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgY29uc3QgYWNjZXNzX3Rva2VuID0gIXJlZnJlc2ggPyB0aGlzLnJlYWRUb2tlbnMoXCJhY2Nlc3NfdG9rZW5cIikgOiB0aGlzLnJlYWRUb2tlbnMoXCJyZWZyZXNoX3Rva2VuXCIpO1xuICAgICAgICBvcHRpb25zLmhlYWRlcnNbXCJBdXRob3JpemF0aW9uXCJdID0gXCJCZWFyZXIgXCIgKyBhY2Nlc3NfdG9rZW47XG4gICAgICAgIG9wdGlvbnMuaGVhZGVyc1tcIkNvbnRlbnQtdHlwZVwiXSA9IFwiYXBwbGljYXRpb24vanNvblwiO1xuICAgIH1cblxuICAgIHNldExvZ2dlckhlYWRlcnMob3B0aW9uczogT3B0aW9ucykge1xuICAgICAgICBpZiAodGhpcy5sb2dnZXJLZXkpIHtcbiAgICAgICAgICAgIG9wdGlvbnMuaGVhZGVyc1tcIlN0dWR5YWxpZ24tTG9nZ2VyLUtleVwiXSA9IHRoaXMubG9nZ2VyS2V5O1xuICAgICAgICB9XG4gICAgICAgIG9wdGlvbnMuaGVhZGVyc1tcIkNvbnRlbnQtdHlwZVwiXSA9IFwiYXBwbGljYXRpb24vanNvblwiO1xuICAgIH1cblxuICAgIHJlcXVlc3Qob3B0aW9uczogT3B0aW9ucykge1xuICAgICAgICBjb25zdCBlbmNvZGVQYXJhbXMgPSAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGRhdGEpLm1hcCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KGRhdGFba2V5XSk7XG4gICAgICAgICAgICB9KS5qb2luKCcmJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBsZXQgdXJsID0gdGhpcy5hcGlVcmwgKyBcIi9cIiArIG9wdGlvbnMucGF0aDtcbiAgICAgICAgICAgIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIHhoci5vcGVuKG9wdGlvbnMubWV0aG9kLCB1cmwpO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMub25sb2FkKSB7XG4gICAgICAgICAgICAgICAgeGhyLm9ubG9hZCA9IG9wdGlvbnMub25sb2FkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgeGhyLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPj0gMjAwICYmIHhoci5zdGF0dXMgPCAzMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHhoci5zdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IHhoci5yZXNwb25zZSA/IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlKSA6IFwiXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiB4aHIuc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXNUZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RCb2R5OiBvcHRpb25zLmJvZHlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvcHRpb25zLm9ucHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgICAgICB4aHIub25wcm9ncmVzcyA9IG9wdGlvbnMub25wcm9ncmVzcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvcHRpb25zLm9uZXJyb3IpIHtcbiAgICAgICAgICAgICAgICB4aHIub25lcnJvciA9IG9wdGlvbnMub25lcnJvcjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgeGhyLm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHhoci5zdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzVGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RCb2R5OiBvcHRpb25zLmJvZHlcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuaGVhZGVycykge1xuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKG9wdGlvbnMuaGVhZGVycykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgb3B0aW9ucy5oZWFkZXJzW2tleV0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5tZXRob2QgPT09IFwiR0VUXCIgfHwgb3B0aW9ucy5tZXRob2QgPT09IFwiREVMRVRFXCIpIHtcbiAgICAgICAgICAgICAgICBsZXQgcGFyYW1zID0gb3B0aW9ucy5wYXJhbXM7XG4gICAgICAgICAgICAgICAgbGV0IGVuY29kZWRQYXJhbXMgPSBcIlwiO1xuICAgICAgICAgICAgICAgIGlmIChwYXJhbXMgJiYgdHlwZW9mIHBhcmFtcyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgZW5jb2RlZFBhcmFtcyA9IGVuY29kZVBhcmFtcyhwYXJhbXMpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHhoci5zZW5kKGVuY29kZWRQYXJhbXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG9wdGlvbnMubWV0aG9kID09PSBcIlBPU1RcIiB8fCBvcHRpb25zLm1ldGhvZCA9PT0gXCJQQVRDSFwiKSB7XG4gICAgICAgICAgICAgICAgeGhyLnNlbmQob3B0aW9ucy5mb3JtRGF0YSA/IGVuY29kZVBhcmFtcyhvcHRpb25zLmJvZHkpIDogSlNPTi5zdHJpbmdpZnkob3B0aW9ucy5ib2R5KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGJhc2ljQ3JlYXRlKHBhdGg6IHN0cmluZywgZGF0YTogb2JqZWN0KSB7XG4gICAgICAgIGxldCBvcHRpb25zOiBPcHRpb25zID0ge1xuICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICAgIHBhdGg6IHBhdGgsXG4gICAgICAgICAgICBoZWFkZXJzOiB7fVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0SGVhZGVycyhvcHRpb25zKTtcbiAgICAgICAgb3B0aW9ucy5ib2R5ID0gZGF0YTtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVxdWVzdChvcHRpb25zKTtcbiAgICB9XG5cbiAgICBiYXNpY1JlYWQocGF0aDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnM6IE9wdGlvbnMgPSB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICAgICAgICBwYXRoOiBwYXRoLFxuICAgICAgICAgICAgaGVhZGVyczoge31cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldEhlYWRlcnMob3B0aW9ucyk7XG4gICAgICAgIHJldHVybiB0aGlzLnJlcXVlc3Qob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgYmFzaWNVcGRhdGUocGF0aDogc3RyaW5nLCBkYXRhOiBvYmplY3QpIHtcbiAgICAgICAgbGV0IG9wdGlvbnM6IE9wdGlvbnMgPSB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiUEFUQ0hcIixcbiAgICAgICAgICAgIHBhdGg6IHBhdGgsXG4gICAgICAgICAgICBoZWFkZXJzOiB7fVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0SGVhZGVycyhvcHRpb25zKTtcbiAgICAgICAgb3B0aW9ucy5ib2R5ID0gZGF0YTtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVxdWVzdChvcHRpb25zKTtcbiAgICB9XG5cbiAgICBiYXNpY0RlbGV0ZShwYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IG9wdGlvbnM6IE9wdGlvbnMgPSB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiREVMRVRFXCIsXG4gICAgICAgICAgICBwYXRoOiBwYXRoLFxuICAgICAgICAgICAgaGVhZGVyczoge31cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldEhlYWRlcnMob3B0aW9ucyk7XG4gICAgICAgIGNvbnN0IHlvID0gdGhpcy5yZXF1ZXN0KG9wdGlvbnMpO1xuICAgICAgICBjb25zb2xlLmxvZyh5bylcbiAgICAgICAgcmV0dXJuIHlvXG4gICAgfVxuXG4gICAgLy8gQWRtaW4gcmVsYXRlZCBmdW5jdGlvbnNcbiAgICB1c2VyTG9naW4odXNlcm5hbWU6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZykge1xuICAgICAgICBjb25zdCBvcHRpb25zOiBPcHRpb25zID0ge1xuICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICAgIHBhdGg6IFwidXNlcnMvbG9naW5cIixcbiAgICAgICAgICAgIGhlYWRlcnM6IHt9LFxuICAgICAgICAgICAgYm9keToge3VzZXJuYW1lOiB1c2VybmFtZSwgcGFzc3dvcmQ6IHBhc3N3b3JkfSxcbiAgICAgICAgICAgIGZvcm1EYXRhOiB0cnVlXG4gICAgICAgIH07XG4gICAgICAgIG9wdGlvbnMuaGVhZGVyc1tcIkNvbnRlbnQtdHlwZVwiXSA9IFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCI7XG4gICAgICAgIHJldHVybiB0aGlzLnJlcXVlc3Qob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgdXNlck1lKCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmJhc2ljUmVhZChcInVzZXJzL21lXCIpO1xuICAgIH1cblxuICAgIHVzZXJSZWZyZXNoVG9rZW4oKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnM6IE9wdGlvbnMgPSB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICAgICAgICBwYXRoOiBcInVzZXJzL3JlZnJlc2hcIixcbiAgICAgICAgICAgIGhlYWRlcnM6IHt9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRIZWFkZXJzKG9wdGlvbnMsIHRydWUpO1xuICAgICAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGdldFVzZXJzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5iYXNpY1JlYWQoXCJ1c2Vyc1wiKTtcbiAgICB9XG5cbiAgICBnZXRVc2VyKHVzZXJJZDogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJhc2ljUmVhZChcInVzZXJzL1wiICsgdXNlcklkKTtcbiAgICB9XG5cbiAgICBjcmVhdGVVc2VyKHVzZXI6IG9iamVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5iYXNpY0NyZWF0ZShcInVzZXJzXCIsIHVzZXIpXG4gICAgfVxuXG4gICAgdXBkYXRlVXNlcih1c2VySWQ6IG51bWJlciwgdXNlcjogb2JqZWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJhc2ljVXBkYXRlKFwidXNlcnMvXCIgKyB1c2VySWQsIHVzZXIpO1xuICAgIH1cblxuICAgIGRlbGV0ZVVzZXIodXNlcklkOiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFzaWNEZWxldGUoXCJ1c2Vycy9cIiArIHVzZXJJZCk7XG4gICAgfVxuXG4gICAgLy8gLS0tLSBNQUlOTFkgRk9SIFVTRSBJTiBBRE1JTiBGUk9OVEVORCAtLS0tIC8vXG5cbiAgICAvLyBTdHVkaWVzXG5cbiAgICBnZXRTdHVkaWVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5iYXNpY1JlYWQoXCJzdHVkaWVzXCIpO1xuICAgIH1cblxuICAgIGNyZWF0ZVN0dWR5KHN0dWR5OiBvYmplY3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFzaWNDcmVhdGUoXCJzdHVkaWVzXCIsIHN0dWR5KTtcbiAgICB9XG5cbiAgICB1cGRhdGVTdHVkeShzdHVkeUlkOiBudW1iZXIsIHN0dWR5OiBvYmplY3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFzaWNVcGRhdGUoXCJzdHVkaWVzL1wiICsgc3R1ZHlJZCwgc3R1ZHkpO1xuICAgIH1cblxuICAgIGRlbGV0ZVN0dWR5KHN0dWR5SWQ6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5iYXNpY0RlbGV0ZShcInN0dWRpZXMvXCIgKyBzdHVkeUlkKTtcbiAgICB9XG5cbiAgICBnZW5lcmF0ZVByb2NlZHVyZVdpdGhTdGVwcyhzdHVkeUlkOiBudW1iZXIsIHByb2NlZHVyZVNjaGVtZTogb2JqZWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJhc2ljQ3JlYXRlKFwic3R1ZGllcy9cIiArIHN0dWR5SWQgKyBcIi9wcm9jZWR1cmVzXCIsIHByb2NlZHVyZVNjaGVtZSk7XG4gICAgfVxuXG4gICAgZ2V0UGFydGljaXBhbnRzKHN0dWR5SWQ6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5iYXNpY1JlYWQoXCJzdHVkaWVzL1wiICsgc3R1ZHlJZCArIFwiL3BhcnRpY2lwYW50c1wiKTtcbiAgICB9XG5cbiAgICBnZW5lcmF0ZVBhcnRpY2lwYW50cyhzdHVkeUlkOiBudW1iZXIsIGFtb3VudDogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnM6IE9wdGlvbnMgPSB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgcGF0aDogXCJzdHVkaWVzL1wiICsgc3R1ZHlJZCArIFwiL3BhcnRpY2lwYW50c1wiLFxuICAgICAgICAgICAgaGVhZGVyczoge30sXG4gICAgICAgICAgICBib2R5OiB7YW1vdW50OiBhbW91bnR9LFxuICAgICAgICAgICAgZm9ybURhdGE6IHRydWUsXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRIZWFkZXJzKG9wdGlvbnMpO1xuICAgICAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHBvcHVsYXRlU3VydmV5UGFydGljaXBhbnRzKHN0dWR5SWQ6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5iYXNpY1JlYWQoXCJzdHVkaWVzL1wiICsgc3R1ZHlJZCArIFwiL3N1cnZleS1wYXJ0aWNpcGFudHNcIik7XG4gICAgfVxuXG4gICAgLy8gQ29uZGl0aW9uc1xuXG4gICAgZ2V0Q29uZGl0aW9uSWRzKHN0dWR5SWQ6IG51bWJlcikge1xuICAgICAgICBjb25zdCBvcHRpb25zOiBPcHRpb25zID0ge1xuICAgICAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxuICAgICAgICAgICAgcGF0aDogXCJjb25kaXRpb25zL2lkc1wiLFxuICAgICAgICAgICAgaGVhZGVyczoge30sXG4gICAgICAgICAgICBib2R5OiB7c3R1ZHlfaWQ6IHN0dWR5SWR9LFxuICAgICAgICAgICAgZm9ybURhdGE6IHRydWUsXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRIZWFkZXJzKG9wdGlvbnMpO1xuICAgICAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGdldENvbmRpdGlvbihjb25kaXRpb25JZDogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJhc2ljUmVhZChcImNvbmRpdGlvbnMvXCIgKyBjb25kaXRpb25JZCk7XG4gICAgfVxuXG4gICAgZ2V0Q29uZGl0aW9ucyhzdHVkeUlkOiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFzaWNSZWFkKFwic3R1ZGllcy9cIiArIHN0dWR5SWQgKyBcIi9jb25kaXRpb25zXCIpO1xuICAgIH1cblxuICAgIGNyZWF0ZUNvbmRpdGlvbihjb25kaXRpb246IG9iamVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5iYXNpY0NyZWF0ZShcImNvbmRpdGlvbnNcIiwgY29uZGl0aW9uKTtcbiAgICB9XG5cbiAgICB1cGRhdGVDb25kaXRpb24oY29uZGl0aW9uSWQ6IG51bWJlciwgY29uZGl0aW9uOiBvYmplY3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFzaWNVcGRhdGUoXCJjb25kaXRpb25zL1wiICsgY29uZGl0aW9uSWQsIGNvbmRpdGlvbik7XG4gICAgfVxuXG4gICAgZGVsZXRlQ29uZGl0aW9uKGNvbmRpdGlvbklkOiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFzaWNEZWxldGUoXCJjb25kaXRpb25zL1wiICsgY29uZGl0aW9uSWQpO1xuICAgIH1cblxuICAgIGdldFRhc2tzKHN0dWR5SWQ6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5iYXNpY1JlYWQoXCJzdHVkaWVzL1wiICsgc3R1ZHlJZCArIFwiL3Rhc2tzXCIpO1xuICAgIH1cblxuICAgIGdldFRleHRzKHN0dWR5SWQ6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5iYXNpY1JlYWQoXCJzdHVkaWVzL1wiICsgc3R1ZHlJZCArIFwiL3RleHRzXCIpO1xuICAgIH1cblxuICAgIGdldFF1ZXN0aW9ubmFpcmVzKHN0dWR5SWQ6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5iYXNpY1JlYWQoXCJzdHVkaWVzL1wiICsgc3R1ZHlJZCArIFwiL3F1ZXN0aW9ubmFpcmVzXCIpO1xuICAgIH1cblxuICAgIGdldFBhdXNlcyhzdHVkeUlkOiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFzaWNSZWFkKFwic3R1ZGllcy9cIiArIHN0dWR5SWQgKyBcIi9wYXVzZXNcIik7XG4gICAgfVxuXG5cbiAgICAvLyBQcm9jZWR1cmVzXG5cbiAgICBnZXRQcm9jZWR1cmVzKHN0dWR5SWQ6IG51bWJlcikge1xuICAgICAgICBjb25zdCBvcHRpb25zOiBPcHRpb25zID0ge1xuICAgICAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxuICAgICAgICAgICAgcGF0aDogXCJwcm9jZWR1cmVzXCIsXG4gICAgICAgICAgICBoZWFkZXJzOiB7fSxcbiAgICAgICAgICAgIGJvZHk6IHtzdHVkeV9pZDogc3R1ZHlJZH0sXG4gICAgICAgICAgICBmb3JtRGF0YTogdHJ1ZSxcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldEhlYWRlcnMob3B0aW9ucyk7XG4gICAgICAgIHJldHVybiB0aGlzLnJlcXVlc3Qob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLy8gUGFydGljaXBhbnRzXG5cbiAgICBnZXRQYXJ0aWNpcGFudHNCeVByb2NlZHVyZShwcm9jZWR1cmVJZDogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnM6IE9wdGlvbnMgPSB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICAgICAgICBwYXRoOiBcInBhcnRpY2lwYW50c1wiLFxuICAgICAgICAgICAgaGVhZGVyczoge30sXG4gICAgICAgICAgICBib2R5OiB7cHJvY2VkdXJlX2lkOiBwcm9jZWR1cmVJZH0sXG4gICAgICAgICAgICBmb3JtRGF0YTogdHJ1ZSxcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldEhlYWRlcnMob3B0aW9ucyk7XG4gICAgICAgIHJldHVybiB0aGlzLnJlcXVlc3Qob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgZ2V0UGFydGljaXBhbnRCeUlkKHBhcnRpY2lwYW50SWQ6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5iYXNpY1JlYWQoXCJwYXJ0aWNpcGFudHMvXCIgKyBwYXJ0aWNpcGFudElkKTtcbiAgICB9XG5cbiAgICBlbmRQYXJ0aWNpcGFudFBhdXNlKHBhcnRpY2lwYW50VG9rZW46IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdGhpcy5iYXNpY1JlYWQoXCJwYXJ0aWNpcGFudHMvXCIgKyBwYXJ0aWNpcGFudFRva2VuICsgXCIvZW5kLXBhdXNlXCIpO1xuICAgIH1cblxuICAgIC8vVGFza3NcblxuICAgIGNyZWF0ZVRhc2sodGFzazogb2JqZWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJhc2ljQ3JlYXRlKFwidGFza3NcIiwgdGFzayk7XG4gICAgfVxuXG4gICAgZ2V0VGFzayh0YXNrSWQ6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5iYXNpY1JlYWQoXCJ0YXNrcy9cIiArIHRhc2tJZCk7XG4gICAgfVxuXG4gICAgdXBkYXRlVGFzayh0YXNrSWQ6IG51bWJlciwgdGFzazogb2JqZWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJhc2ljVXBkYXRlKFwidGFza3MvXCIgKyB0YXNrSWQsIHRhc2spO1xuICAgIH1cblxuICAgIGRlbGV0ZVRhc2sodGFza0lkOiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFzaWNEZWxldGUoXCJ0YXNrcy9cIiArIHRhc2tJZCk7XG4gICAgfVxuXG4gICAgLy9UZXh0c1xuXG4gICAgY3JlYXRlVGV4dCh0ZXh0OiBvYmplY3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFzaWNDcmVhdGUoXCJ0ZXh0c1wiLCB0ZXh0KTtcbiAgICB9XG5cbiAgICBnZXRUZXh0KHRleHRJZDogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJhc2ljUmVhZChcInRleHRzL1wiICsgdGV4dElkKTtcbiAgICB9XG5cbiAgICB1cGRhdGVUZXh0KHRleHRJZDogbnVtYmVyLCB0ZXh0OiBvYmplY3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFzaWNVcGRhdGUoXCJ0ZXh0cy9cIiArIHRleHRJZCwgdGV4dCk7XG4gICAgfVxuXG4gICAgZGVsZXRlVGV4dCh0ZXh0SWQ6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5iYXNpY0RlbGV0ZShcInRleHRzL1wiICsgdGV4dElkKTtcbiAgICB9XG5cbiAgICAvL1F1ZXN0aW9ubmFpcmVzXG5cbiAgICBjcmVhdGVRdWVzdGlvbm5haXJlKHF1ZXN0aW9ubmFpcmU6IG9iamVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5iYXNpY0NyZWF0ZShcInF1ZXN0aW9ubmFpcmVzXCIsIHF1ZXN0aW9ubmFpcmUpO1xuICAgIH1cblxuICAgIGdldFF1ZXN0aW9ubmFpcmUocXVlc3Rpb25uYWlyZUlkOiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFzaWNSZWFkKFwicXVlc3Rpb25uYWlyZXMvXCIgKyBxdWVzdGlvbm5haXJlSWQpO1xuICAgIH1cblxuICAgIHVwZGF0ZVF1ZXN0aW9ubmFpcmUocXVlc3Rpb25uYWlyZUlkOiBudW1iZXIsIHF1ZXN0aW9ubmFpcmU6IG9iamVjdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5iYXNpY1VwZGF0ZShcInF1ZXN0aW9ubmFpcmVzL1wiICsgcXVlc3Rpb25uYWlyZUlkLCBxdWVzdGlvbm5haXJlKTtcbiAgICB9XG5cbiAgICBkZWxldGVRdWVzdGlvbm5haXJlKHF1ZXN0aW9ubmFpcmVJZDogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJhc2ljRGVsZXRlKFwicXVlc3Rpb25uYWlyZXMvXCIgKyBxdWVzdGlvbm5haXJlSWQpO1xuICAgIH1cblxuICAgIC8vUGF1c2VzXG5cbiAgICBjcmVhdGVQYXVzZShwYXVzZTogb2JqZWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJhc2ljQ3JlYXRlKFwicGF1c2VzXCIsIHBhdXNlKTtcbiAgICB9XG5cbiAgICBnZXRQYXVzZShwYXVzZUlkOiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFzaWNSZWFkKFwicGF1c2VzL1wiICsgcGF1c2VJZCk7XG4gICAgfVxuXG4gICAgdXBkYXRlUGF1c2UocGF1c2VJZDogbnVtYmVyLCBwYXVzZTogb2JqZWN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJhc2ljVXBkYXRlKFwicGF1c2VzL1wiICsgcGF1c2VJZCwgcGF1c2UpO1xuICAgIH1cblxuICAgIGRlbGV0ZVBhdXNlKHBhdXNlSWQ6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5iYXNpY0RlbGV0ZShcInBhdXNlcy9cIiArIHBhdXNlSWQpO1xuICAgIH1cblxuICAgIC8vIC0tLS0gTUFJTkxZIEZPUiBVU0UgSU4gU1RVRFkgRlJPTlRFTkQgLS0tLSAvL1xuXG4gICAgLy9UT0RPOiByZWFkIGNvbmRpdGlvbiBjb25maWdcblxuICAgIC8vU3R1ZHkgRnJvbnRlbmQgcmVsYXRlZCBmdW5jdGlvbnNcblxuICAgIGdldFN0dWR5KHN0dWR5SWQ/OiBudW1iZXIpIHtcbiAgICAgICAgY29uc3Qgb3B0aW9uczogT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcbiAgICAgICAgICAgIHBhdGg6IFwic3R1ZGllcy9cIiArIChzdHVkeUlkIHx8IHRoaXMuc3R1ZHlJZCksXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMucmVxdWVzdChvcHRpb25zKTtcbiAgICB9XG5cbiAgICBnZXRTdHVkeVNldHVwSW5mbyhzdHVkeUlkPzogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJhc2ljUmVhZChcInN0dWRpZXMvXCIgKyBzdHVkeUlkICsgXCIvc2V0dXAtaW5mb1wiKVxuICAgIH1cblxuICAgIC8vIFBhcnRpY2lwYXRpb24gcmVsYXRlZCBtZXRob2RzXG5cbiAgICBnZXRQYXJ0aWNpcGFudChwYXJ0aWNpcGFudFRva2VuOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3Qgb3B0aW9uczogT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcbiAgICAgICAgICAgIHBhdGg6IFwicGFydGljaXBhbnRzL3Rva2VuL1wiICsgcGFydGljaXBhbnRUb2tlbixcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHBhcnRpY2lwYXRlKHBhcnRpY2lwYW50VG9rZW4/OiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IG9wdGlvbnM6IE9wdGlvbnMgPSB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICAgICAgICBwYXRoOiBcInN0dWRpZXMvXCIgKyB0aGlzLnN0dWR5SWQgKyBcIi9wYXJ0aWNpcGF0ZVwiXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcnRpY2lwYW50VG9rZW4pIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxuICAgICAgICAgICAgICAgIHBhdGg6IFwic3R1ZGllcy9cIiArIHRoaXMuc3R1ZHlJZCArIFwiL3BhcnRpY2lwYXRlL1wiICsgcGFydGljaXBhbnRUb2tlblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnJlcXVlc3Qob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgc2V0TG9nZ2VyS2V5KGxvZ2dlcktleSkge1xuICAgICAgICB0aGlzLmxvZ2dlcktleSA9IGxvZ2dlcktleTtcbiAgICB9XG5cbiAgICBzdG9yZVRva2VucyhyZXNwb25zZUpzb24pIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ0b2tlbnNcIiwgSlNPTi5zdHJpbmdpZnkocmVzcG9uc2VKc29uKSk7XG4gICAgfVxuXG4gICAgdXBkYXRlQWNjZXNzVG9rZW4ocmVzcG9uc2VKc29uKSB7XG4gICAgICAgIGNvbnN0IHRva2VucyA9IHRoaXMucmVhZFRva2VucygpO1xuICAgICAgICB0b2tlbnNbXCJhY2Nlc3NfdG9rZW5cIl0gPSByZXNwb25zZUpzb25bXCJhY2Nlc3NfdG9rZW5cIl07XG4gICAgICAgIHRoaXMuc3RvcmVUb2tlbnModG9rZW5zKTtcbiAgICB9XG5cbiAgICByZWFkVG9rZW5zKGtleT0gbnVsbCkge1xuICAgICAgICBsZXQgdG9rZW5zID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ0b2tlbnNcIik7XG4gICAgICAgIGlmICh0b2tlbnMpIHtcbiAgICAgICAgICAgIHRva2VucyA9IEpTT04ucGFyc2UodG9rZW5zKTtcbiAgICAgICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW5zW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdG9rZW5zO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGRlbGV0ZVRva2VucygpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJ0b2tlbnNcIik7XG4gICAgfVxuXG4gICAgcmVmcmVzaFRva2VuKCkge1xuICAgICAgICBjb25zdCBvcHRpb25zOiBPcHRpb25zID0ge1xuICAgICAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxuICAgICAgICAgICAgcGF0aDogXCJwYXJ0aWNpcGFudHMvcmVmcmVzaFwiLFxuICAgICAgICAgICAgaGVhZGVyczoge31cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldEhlYWRlcnMob3B0aW9ucywgdHJ1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzLnJlcXVlc3Qob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgbWUoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgY29uc3Qgb3B0aW9uczogT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcbiAgICAgICAgICAgIHBhdGg6IFwicGFydGljaXBhbnRzL21lXCIsXG4gICAgICAgICAgICBoZWFkZXJzOiB7fVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0SGVhZGVycyhvcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVxdWVzdChvcHRpb25zKTtcbiAgICB9XG5cbiAgICBnZXRQcm9jZWR1cmUocHJvY2VkdXJlSWQ6IG51bWJlcik6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnM6IE9wdGlvbnMgPSB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICAgICAgICBwYXRoOiBcInByb2NlZHVyZXMvXCIgKyBwcm9jZWR1cmVJZCxcbiAgICAgICAgICAgIGhlYWRlcnM6IHt9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRIZWFkZXJzKG9wdGlvbnMpO1xuICAgICAgICBjb25zb2xlLmxvZyhvcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVxdWVzdChvcHRpb25zKTtcbiAgICB9XG5cbiAgICAvLyBIZWxwZXIgbWV0aG9kIHRvIGNyZWF0ZSBidWxrcyBmcm9tIGludGVyYWN0aW9uIGxpc3RzXG4gICAgcHJpdmF0ZSBidWlsZEJ1bGtMaXN0KGludGVyYWN0aW9uTGlzdDogSW50ZXJhY3Rpb25UeXBlcywgYnVsa1NpemU6IG51bWJlciA9IDEwKSB7XG4gICAgICAgIGNvbnN0IGJ1bGtzID0gW107XG4gICAgICAgIHdoaWxlICh0aGlzW2ludGVyYWN0aW9uTGlzdF0ubGVuZ3RoID4gYnVsa1NpemUpIHtcbiAgICAgICAgICAgIGJ1bGtzLnB1c2godGhpc1tpbnRlcmFjdGlvbkxpc3RdLnNwbGljZSgwLCBidWxrU2l6ZSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzW2ludGVyYWN0aW9uTGlzdF0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgYnVsa3MucHVzaCh0aGlzW2ludGVyYWN0aW9uTGlzdF0uc3BsaWNlKDAsIHRoaXNbaW50ZXJhY3Rpb25MaXN0XS5sZW5ndGgpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYnVsa3M7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogdHlwZSBjYWxsYmFjayBjb3JyZWN0bHksIHN0YXJ0aW5nIHBvaW50IGNvdWxkIGJlIChjb25kaXRpb25JZDogbnVtYmVyLCBpbnRlcmFjdGlvbnM6IG9iamVjdFtdKSA9PiBQcm9taXNlPGFueT5cbiAgICBsb2dJbnRlcmFjdGlvbkJ1bGsocGF0aDogc3RyaW5nLCBjb25kaXRpb25JZDogbnVtYmVyLCBpbnRlcmFjdGlvbkxpc3Q6IEludGVyYWN0aW9uVHlwZXMsIGJ1bGtTaXplOiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dJbnRlcmFjdGlvbkJ1bGtSZXF1ZXN0KSB7XG4gICAgICAgIGNvbnN0IGludGVyYWN0aW9uQnVsa3MgPSB0aGlzLmJ1aWxkQnVsa0xpc3QoaW50ZXJhY3Rpb25MaXN0LCBidWxrU2l6ZSk7XG4gICAgICAgIGNvbnN0IGludGVyYWN0aW9uQnVsa1JlcXVlc3RzID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW50ZXJhY3Rpb25CdWxrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaW50ZXJhY3Rpb25CdWxrUmVxdWVzdHMucHVzaChsb2dJbnRlcmFjdGlvbkJ1bGtSZXF1ZXN0KHBhdGgsIGNvbmRpdGlvbklkLCBpbnRlcmFjdGlvbkJ1bGtzW2ldKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsU2V0dGxlZChpbnRlcmFjdGlvbkJ1bGtSZXF1ZXN0cyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBsb2dJbnRlcmFjdGlvbkJ1bGtSZXF1ZXN0KHBhdGg6IHN0cmluZywgY29uZGl0aW9uSWQ6IG51bWJlciwgaW50ZXJhY3Rpb25zOiBvYmplY3RbXSkge1xuICAgICAgICBjb25zdCBvcHRpb25zOiBPcHRpb25zID0ge1xuICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICAgIHBhdGg6IHBhdGgsXG4gICAgICAgICAgICBoZWFkZXJzOiB7fVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0TG9nZ2VySGVhZGVycyhvcHRpb25zKTtcbiAgICAgICAgb3B0aW9ucy5ib2R5ID0ge1xuICAgICAgICAgICAgY29uZGl0aW9uX2lkOiBjb25kaXRpb25JZCxcbiAgICAgICAgICAgIGludGVyYWN0aW9uczogaW50ZXJhY3Rpb25zXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0aGlzLnJlcXVlc3Qob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBsb2dJbnRlcmFjdGlvblJlcXVlc3QocGF0aDogc3RyaW5nLCBjb25kaXRpb25JZDogbnVtYmVyLCBpbnRlcmFjdGlvbjogb2JqZWN0KSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnM6IE9wdGlvbnMgPSB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgcGF0aDogcGF0aCxcbiAgICAgICAgICAgIGhlYWRlcnM6IHt9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRMb2dnZXJIZWFkZXJzKG9wdGlvbnMpO1xuICAgICAgICBvcHRpb25zLmJvZHkgPSB7XG4gICAgICAgICAgICBjb25kaXRpb25faWQ6IGNvbmRpdGlvbklkLFxuICAgICAgICAgICAgaW50ZXJhY3Rpb246IGludGVyYWN0aW9uXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0aGlzLnJlcXVlc3Qob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLy8gTW91c2UgSW50ZXJhY3Rpb25cblxuICAgIGxvZ01vdXNlSW50ZXJhY3Rpb24oY29uZGl0aW9uSWQ6IG51bWJlciwgZXZlbnRUeXBlOiBzdHJpbmcsIG1vdXNlRXZlbnQ6IE1vdXNlRXZlbnQsIHRpbWVzdGFtcDogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRlZFRhcmdldDoge30gPSB7fSwgbWV0YURhdGE6IHt9ID0ge30pIHtcbiAgICAgICAgY29uc3QgaW50ZXJhY3Rpb24gPSBuZXcgTW91c2VJbnRlcmFjdGlvbihldmVudFR5cGUsIHRpbWVzdGFtcCwgbW91c2VFdmVudCwgcmVsYXRlZFRhcmdldCwgbWV0YURhdGEpO1xuICAgICAgICBjb25zdCBwYXRoID0gXCJpbnRlcmFjdGlvbi9tb3VzZVwiO1xuICAgICAgICByZXR1cm4gdGhpcy5sb2dJbnRlcmFjdGlvblJlcXVlc3QocGF0aCwgY29uZGl0aW9uSWQsIGludGVyYWN0aW9uKTtcbiAgICB9XG5cbiAgICBhZGRNb3VzZUludGVyYWN0aW9uKGV2ZW50VHlwZTogc3RyaW5nLCBtb3VzZUV2ZW50OiBNb3VzZUV2ZW50LCB0aW1lc3RhbXA6IG51bWJlciwgcmVsYXRlZFRhcmdldDoge30gPSB7fSwgbWV0YURhdGE6IHt9ID0ge30pIHtcbiAgICAgICAgdGhpcy5tb3VzZUludGVyYWN0aW9uTGlzdC5wdXNoKG5ldyBNb3VzZUludGVyYWN0aW9uKGV2ZW50VHlwZSwgdGltZXN0YW1wLCBtb3VzZUV2ZW50LCByZWxhdGVkVGFyZ2V0LCBtZXRhRGF0YSkpO1xuICAgIH1cblxuICAgIGxvZ01vdXNlSW50ZXJhY3Rpb25CdWxrKGNvbmRpdGlvbklkOiBudW1iZXIsIGJ1bGtTaXplOiBudW1iZXIgPSAxMCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGNvbnN0IGludGVyYWN0aW9uVHlwZSA9IFwibW91c2VJbnRlcmFjdGlvbkxpc3RcIlxuICAgICAgICBjb25zdCBwYXRoID0gXCJpbnRlcmFjdGlvbi9tb3VzZS9idWxrXCI7XG4gICAgICAgIHJldHVybiB0aGlzLmxvZ0ludGVyYWN0aW9uQnVsayhwYXRoLCBjb25kaXRpb25JZCwgaW50ZXJhY3Rpb25UeXBlLCBidWxrU2l6ZSwgdGhpcy5sb2dJbnRlcmFjdGlvbkJ1bGtSZXF1ZXN0LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8vIERyYWcgSW50ZXJhY3Rpb25cblxuICAgIGxvZ0RyYWdJbnRlcmFjdGlvbihjb25kaXRpb25JZDogbnVtYmVyLCBldmVudFR5cGU6IHN0cmluZywgZHJhZ0V2ZW50OiBEcmFnRXZlbnQsIHRpbWVzdGFtcDogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRlZFRhcmdldDoge30gPSB7fSwgbWV0YURhdGE6IHt9ID0ge30pIHtcbiAgICAgICAgY29uc3QgaW50ZXJhY3Rpb24gPSBuZXcgRHJhZ0ludGVyYWN0aW9uKGV2ZW50VHlwZSwgdGltZXN0YW1wLCBkcmFnRXZlbnQsIHJlbGF0ZWRUYXJnZXQsIG1ldGFEYXRhKTtcbiAgICAgICAgY29uc3QgcGF0aCA9IFwiaW50ZXJhY3Rpb24vZHJhZ1wiO1xuICAgICAgICByZXR1cm4gdGhpcy5sb2dJbnRlcmFjdGlvblJlcXVlc3QocGF0aCwgY29uZGl0aW9uSWQsIGludGVyYWN0aW9uKTtcbiAgICB9XG5cbiAgICBhZGREcmFnSW50ZXJhY3Rpb24oZXZlbnRUeXBlOiBzdHJpbmcsIGRyYWdFdmVudDogRHJhZ0V2ZW50LCB0aW1lc3RhbXA6IG51bWJlciwgcmVsYXRlZFRhcmdldDoge30gPSB7fSwgbWV0YURhdGE6IHt9ID0ge30pIHtcbiAgICAgICAgdGhpcy5kcmFnSW50ZXJhY3Rpb25MaXN0LnB1c2gobmV3IERyYWdJbnRlcmFjdGlvbihldmVudFR5cGUsIHRpbWVzdGFtcCwgZHJhZ0V2ZW50LCByZWxhdGVkVGFyZ2V0LCBtZXRhRGF0YSkpO1xuICAgIH1cblxuICAgIGxvZ0RyYWdJbnRlcmFjdGlvbkJ1bGsoY29uZGl0aW9uSWQ6IG51bWJlciwgYnVsa1NpemU6IG51bWJlciA9IDEwKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgY29uc3QgaW50ZXJhY3Rpb25UeXBlID0gXCJkcmFnSW50ZXJhY3Rpb25MaXN0XCJcbiAgICAgICAgY29uc3QgcGF0aCA9IFwiaW50ZXJhY3Rpb24vZHJhZy9idWxrXCI7XG4gICAgICAgIHJldHVybiB0aGlzLmxvZ0ludGVyYWN0aW9uQnVsayhwYXRoLCBjb25kaXRpb25JZCwgaW50ZXJhY3Rpb25UeXBlLCBidWxrU2l6ZSwgdGhpcy5sb2dJbnRlcmFjdGlvbkJ1bGtSZXF1ZXN0LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8vIEtleWJvYXJkIEludGVyYWN0aW9uXG5cbiAgICBsb2dLZXlib2FyZEludGVyYWN0aW9uKGNvbmRpdGlvbklkOiBudW1iZXIsIGV2ZW50VHlwZTogc3RyaW5nLCBrZXlib2FyZEV2ZW50OiBLZXlib2FyZEV2ZW50LCB0aW1lc3RhbXA6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGFEYXRhOiB7fSA9IHt9KSB7XG4gICAgICAgIGNvbnN0IGludGVyYWN0aW9uID0gbmV3IEtleWJvYXJkSW50ZXJhY3Rpb24oZXZlbnRUeXBlLCB0aW1lc3RhbXAsIGtleWJvYXJkRXZlbnQsIG1ldGFEYXRhKTtcbiAgICAgICAgY29uc3QgcGF0aCA9IFwiaW50ZXJhY3Rpb24va2V5Ym9hcmRcIjtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9nSW50ZXJhY3Rpb25SZXF1ZXN0KHBhdGgsIGNvbmRpdGlvbklkLCBpbnRlcmFjdGlvbik7XG4gICAgfVxuXG4gICAgYWRkS2V5Ym9hcmRJbnRlcmFjdGlvbihldmVudFR5cGU6IHN0cmluZywga2V5Ym9hcmRFdmVudDogS2V5Ym9hcmRFdmVudCwgdGltZXN0YW1wOiBudW1iZXIsIG1ldGFEYXRhOiB7fSA9IHt9KSB7XG4gICAgICAgIHRoaXMua2V5Ym9hcmRJbnRlcmFjdGlvbkxpc3QucHVzaChuZXcgS2V5Ym9hcmRJbnRlcmFjdGlvbihldmVudFR5cGUsIHRpbWVzdGFtcCwga2V5Ym9hcmRFdmVudCwgbWV0YURhdGEpKTtcbiAgICB9XG5cbiAgICBsb2dLZXlib2FyZEludGVyYWN0aW9uQnVsayhjb25kaXRpb25JZDogbnVtYmVyLCBidWxrU2l6ZTogbnVtYmVyID0gMTApOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBjb25zdCBpbnRlcmFjdGlvblR5cGUgPSBcImtleWJvYXJkSW50ZXJhY3Rpb25MaXN0XCJcbiAgICAgICAgY29uc3QgcGF0aCA9IFwiaW50ZXJhY3Rpb24va2V5Ym9hcmQvYnVsa1wiO1xuICAgICAgICByZXR1cm4gdGhpcy5sb2dJbnRlcmFjdGlvbkJ1bGsocGF0aCwgY29uZGl0aW9uSWQsIGludGVyYWN0aW9uVHlwZSwgYnVsa1NpemUsIHRoaXMubG9nSW50ZXJhY3Rpb25CdWxrUmVxdWVzdC5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICAvLyBUb3VjaCBJbnRlcmFjdGlvblxuXG4gICAgbG9nVG91Y2hJbnRlcmFjdGlvbihjb25kaXRpb25JZDogbnVtYmVyLCBldmVudFR5cGU6IHN0cmluZywgdG91Y2hFdmVudDogVG91Y2hFdmVudCwgdGltZXN0YW1wOiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhRGF0YToge30gPSB7fSkge1xuICAgICAgICBjb25zdCBpbnRlcmFjdGlvbiA9IG5ldyBUb3VjaEludGVyYWN0aW9uKGV2ZW50VHlwZSwgdGltZXN0YW1wLCB0b3VjaEV2ZW50LCBtZXRhRGF0YSk7XG4gICAgICAgIGNvbnN0IHBhdGggPSBcImludGVyYWN0aW9uL3RvdWNoXCI7XG4gICAgICAgIHJldHVybiB0aGlzLmxvZ0ludGVyYWN0aW9uUmVxdWVzdChwYXRoLCBjb25kaXRpb25JZCwgaW50ZXJhY3Rpb24pO1xuICAgIH1cblxuICAgIGFkZFRvdWNoSW50ZXJhY3Rpb24oZXZlbnRUeXBlOiBzdHJpbmcsIHRvdWNoRXZlbnQ6IFRvdWNoRXZlbnQsIHRpbWVzdGFtcDogbnVtYmVyLCBtZXRhRGF0YToge30gPSB7fSkge1xuICAgICAgICB0aGlzLnRvdWNoSW50ZXJhY3Rpb25MaXN0LnB1c2gobmV3IFRvdWNoSW50ZXJhY3Rpb24oZXZlbnRUeXBlLCB0aW1lc3RhbXAsIHRvdWNoRXZlbnQsIG1ldGFEYXRhKSk7XG4gICAgfVxuXG4gICAgbG9nVG91Y2hJbnRlcmFjdGlvbkJ1bGsoY29uZGl0aW9uSWQ6IG51bWJlciwgYnVsa1NpemU6IG51bWJlciA9IDEwKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgY29uc3QgaW50ZXJhY3Rpb25UeXBlID0gXCJ0b3VjaEludGVyYWN0aW9uTGlzdFwiXG4gICAgICAgIGNvbnN0IHBhdGggPSBcImludGVyYWN0aW9uL3RvdWNoL2J1bGtcIjtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9nSW50ZXJhY3Rpb25CdWxrKHBhdGgsIGNvbmRpdGlvbklkLCBpbnRlcmFjdGlvblR5cGUsIGJ1bGtTaXplLCB0aGlzLmxvZ0ludGVyYWN0aW9uQnVsa1JlcXVlc3QuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLy8gR2VuZXJpYyBJbnRlcmFjdGlvblxuXG4gICAgbG9nR2VuZXJpY0ludGVyYWN0aW9uKGNvbmRpdGlvbklkOiBudW1iZXIsIGV2ZW50VHlwZTogc3RyaW5nLCBnZW5lcmljRXZlbnQ6IG9iamVjdCwgdGltZXN0YW1wOiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRhRGF0YToge30gPSB7fSkge1xuICAgICAgICBjb25zdCBpbnRlcmFjdGlvbiA9IG5ldyBHZW5lcmljSW50ZXJhY3Rpb24oZXZlbnRUeXBlLCB0aW1lc3RhbXAsIGdlbmVyaWNFdmVudCwgbWV0YURhdGEpO1xuICAgICAgICBjb25zdCBwYXRoID0gXCJpbnRlcmFjdGlvbi9nZW5lcmljXCI7XG4gICAgICAgIHJldHVybiB0aGlzLmxvZ0ludGVyYWN0aW9uUmVxdWVzdChwYXRoLCBjb25kaXRpb25JZCwgaW50ZXJhY3Rpb24pO1xuICAgIH1cblxuICAgIGFkZEdlbmVyaWNJbnRlcmFjdGlvbihldmVudFR5cGU6IHN0cmluZywgZ2VuZXJpY0V2ZW50OiBvYmplY3QsIHRpbWVzdGFtcDogbnVtYmVyLCBtZXRhRGF0YToge30gPSB7fSkge1xuICAgICAgICB0aGlzLmdlbmVyaWNJbnRlcmFjdGlvbkxpc3QucHVzaChuZXcgR2VuZXJpY0ludGVyYWN0aW9uKGV2ZW50VHlwZSwgdGltZXN0YW1wLCBnZW5lcmljRXZlbnQsIG1ldGFEYXRhKSk7XG4gICAgfVxuXG4gICAgbG9nR2VuZXJpY0ludGVyYWN0aW9uQnVsayhjb25kaXRpb25JZDogbnVtYmVyLCBidWxrU2l6ZTogbnVtYmVyID0gMTApOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBjb25zdCBpbnRlcmFjdGlvblR5cGUgPSBcImdlbmVyaWNJbnRlcmFjdGlvbkxpc3RcIlxuICAgICAgICBjb25zdCBwYXRoID0gXCJpbnRlcmFjdGlvbi9nZW5lcmljL2J1bGtcIjtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9nSW50ZXJhY3Rpb25CdWxrKHBhdGgsIGNvbmRpdGlvbklkLCBpbnRlcmFjdGlvblR5cGUsIGJ1bGtTaXplLCB0aGlzLmxvZ0ludGVyYWN0aW9uQnVsa1JlcXVlc3QuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLy8gUHJvY2VkdXJlIHJlbGF0ZWQgbWV0aG9kc1xuXG4gICAgc3RhcnRQcm9jZWR1cmUoKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnM6IE9wdGlvbnMgPSB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICAgICAgICBwYXRoOiBcInByb2NlZHVyZXMvc3RhcnRcIixcbiAgICAgICAgICAgIGhlYWRlcnM6IHt9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRIZWFkZXJzKG9wdGlvbnMpO1xuICAgICAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG9wdGlvbnMpO1xuICAgIH1cblxuICAgIG5leHRQcm9jZWR1cmUoKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnM6IE9wdGlvbnMgPSB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICAgICAgICBwYXRoOiBcInByb2NlZHVyZXMvbmV4dFwiLFxuICAgICAgICAgICAgaGVhZGVyczoge31cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldEhlYWRlcnMob3B0aW9ucyk7XG4gICAgICAgIHJldHVybiB0aGlzLnJlcXVlc3Qob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgZW5kUHJvY2VkdXJlKCkge1xuICAgICAgICBjb25zdCBvcHRpb25zOiBPcHRpb25zID0ge1xuICAgICAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxuICAgICAgICAgICAgcGF0aDogXCJwcm9jZWR1cmVzL2VuZFwiLFxuICAgICAgICAgICAgaGVhZGVyczoge31cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldEhlYWRlcnMob3B0aW9ucyk7XG4gICAgICAgIHJldHVybiB0aGlzLnJlcXVlc3Qob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgY3VycmVudFByb2NlZHVyZVN0ZXAoKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnM6IE9wdGlvbnMgPSB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICAgICAgICBwYXRoOiBcInByb2NlZHVyZS1zdGVwc1wiLFxuICAgICAgICAgICAgaGVhZGVyczoge31cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldEhlYWRlcnMob3B0aW9ucyk7XG4gICAgICAgIHJldHVybiB0aGlzLnJlcXVlc3Qob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgY2hlY2tTdXJ2ZXlSZXN1bHQoKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnM6IE9wdGlvbnMgPSB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICAgICAgICBwYXRoOiBcInByb2NlZHVyZXMvY2hlY2stc3VydmV5LXJlc3VsdFwiLFxuICAgICAgICAgICAgaGVhZGVyczoge31cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldEhlYWRlcnMob3B0aW9ucyk7XG4gICAgICAgIHJldHVybiB0aGlzLnJlcXVlc3Qob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgc3RhcnROYXZpZ2F0b3IoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgLy8gZ2V0IHRoZSB1c2VyIHRva2VuICh1dWlkKVxuICAgICAgICAgICAgdGhpcy5tZSgpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5ib2R5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcnRpY2lwYW50VG9rZW4gPSByZXNwb25zZS5ib2R5LnRva2VuO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSB0aGlzLmFwaVVybCArIFwiL1wiICsgXCJwcm9jZWR1cmVzL25hdmlnYXRvcj9wYXJ0aWNpcGFudD1cIiArIHBhcnRpY2lwYW50VG9rZW47XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3NlID0gbmV3IEV2ZW50U291cmNlKHVybCwge3dpdGhDcmVkZW50aWFsczogdHJ1ZX0pO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIlBhcnRpY2lwYW50IG5vdCBmb3VuZFwiXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNsb3NlTmF2aWdhdG9yKCkge1xuICAgICAgICB0aGlzLnNzZS5jbG9zZSgpO1xuICAgIH1cblxuICAgIHJlY29ubmVjdE5hdmlnYXRvcigpIHtcbiAgICAgICAgY29uc3Qgb3B0aW9uczogT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcbiAgICAgICAgICAgIHBhdGg6IFwicHJvY2VkdXJlcy9uYXZpZ2F0b3IvcmVjb25uZWN0XCIsXG4gICAgICAgICAgICBoZWFkZXJzOiB7fVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0SGVhZGVycyhvcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVxdWVzdChvcHRpb25zKTtcbiAgICB9XG5cbiAgICBnZXROYXZpZ2F0b3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNzZTtcbiAgICB9XG5cbiAgICB1cGRhdGVOYXZpZ2F0b3IocGFydGljaXBhbnRUb2tlbjogc3RyaW5nLCBzb3VyY2U6IE5hdmlnYXRvclNvdXJjZSwgc3RhdGU6IE5hdmlnYXRvclN0YXRlLCBleHRJZDogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnM6IE9wdGlvbnMgPSB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgcGF0aDogXCJwcm9jZWR1cmVzL25hdmlnYXRvclwiLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC10eXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgb3B0aW9ucy5ib2R5ID0ge1xuICAgICAgICAgICAgcGFydGljaXBhbnRfdG9rZW46IHBhcnRpY2lwYW50VG9rZW4sXG4gICAgICAgICAgICBzb3VyY2U6IHNvdXJjZSxcbiAgICAgICAgICAgIHN0YXRlOiBzdGF0ZSxcbiAgICAgICAgICAgIGV4dF9pZDogZXh0SWRcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVxdWVzdChvcHRpb25zKTtcbiAgICB9XG5cbn1cbmV4cG9ydCBkZWZhdWx0IFN0dWR5QWxpZ25MaWI7Il0sInNvdXJjZVJvb3QiOiIifQ==