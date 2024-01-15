import {Plugin} from '@ckeditor/ckeditor5-core';

import NonEditableElementEditing from './NonEditableElementEditing';

export default class NonEditableElement extends Plugin {
    static get requires() {
        return [NonEditableElementEditing];
    }
}
