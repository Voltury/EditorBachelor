import {ClassicEditor} from '@ckeditor/ckeditor5-editor-classic';
import {Bold, Italic} from '@ckeditor/ckeditor5-basic-styles';
import {Essentials} from '@ckeditor/ckeditor5-essentials';
import {Heading} from '@ckeditor/ckeditor5-heading';
import {List} from '@ckeditor/ckeditor5-list';
import {Paragraph} from '@ckeditor/ckeditor5-paragraph';

import Manager from "../../Manager";
import DropdownSuggestion from "./Dropdown";
import ModalPlugin from "../../Modal/Modal";

import './app.css';
import {WordCount} from "@ckeditor/ckeditor5-word-count";

ClassicEditor
    .create(document.querySelector('#editor'), {
        plugins: [Essentials,
            Paragraph,
            Heading,
            List,
            Bold,
            Italic,
            WordCount,
            Manager,
            DropdownSuggestion,
            ModalPlugin],
        toolbar: ['heading', 'bold', 'italic', 'numberedList', 'bulletedList','modalButton'],
        wordCount: {
            onUpdate: stats => {
                // Get the word count.
                const wordCount = stats.words;

                // Get the word-count-note element.
                const wordCountNote = document.getElementById('word-count-note');

                // Update the word-count-note element.
                wordCountNote.innerText = `Current word count: ${wordCount}`;
            }
        }
    })
    .then(editor => {
        console.log('Editor was initialized', editor);

        // Expose for playing in the console.
        window.editor = editor;
    })
    .catch(error => {
        console.error(error.stack);
    });
