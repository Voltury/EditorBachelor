import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import {createDropdown} from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import SidebarSuggestion from "../SidebarSuggestions/Sidebar";
import InlineSuggestion from "../InlineSuggestions/Inline";

export default class PluginManager extends Plugin {
    constructor(editor) {
        super(editor);
        this.currentPlugin = 'none'; // Can be 'none', 'inline', or 'sidebar'
        this.inlinePlugin = null;
        this.sidebarPlugin = null;
        this.currentButton = null;
    }

    static get requires() {
        return [InlineSuggestion, SidebarSuggestion]
    }

    static get pluginName() {
        return 'PluginManager';
    }

    static get buttonName() {
        return 'pluginSwitcher';
    }

    init() {
        console.log('PluginManager#init() got called');
        this.inlinePlugin = this.editor.plugins.get(InlineSuggestion.pluginName);
        this.sidebarPlugin = this.editor.plugins.get(SidebarSuggestion.pluginName);

        this.editor.ui.componentFactory.add(PluginManager.buttonName, locale => {
            const dropdown = createDropdown(locale);

            dropdown.buttonView.set({
                label: this.currentPlugin.charAt(0).toUpperCase() + this.currentPlugin.slice(1),
                withText: true,
                isOn: false
            });

            const noneButton = new ButtonView(locale);
            noneButton.set({
                label: 'None',
                withText: true
            });
            noneButton.on('execute', () => {
                this.switchPlugin('none', noneButton, dropdown);
            });

            const inlineButton = new ButtonView(locale);
            inlineButton.set({
                label: 'Inline',
                withText: true
            });
            inlineButton.on('execute', () => {
                this.switchPlugin('inline', inlineButton, dropdown);
            });

            const sidebarButton = new ButtonView(locale);
            sidebarButton.set({
                label: 'Sidebar',
                withText: true
            });
            sidebarButton.on('execute', () => {
                this.switchPlugin('sidebar', sidebarButton, dropdown);
            });

            dropdown.panelView.children.add(noneButton);
            dropdown.panelView.children.add(inlineButton);
            dropdown.panelView.children.add(sidebarButton);

            this.currentButton = noneButton;
            noneButton.set({isEnabled: false});

            return dropdown;
        });
    }

    switchPlugin(plugin, button, dropdown) {
        if (this.currentButton) {
            this.currentButton.set({isEnabled: true});
        }
        switch (plugin) {
            case 'none':
                // Disable all plugins
                this.inlinePlugin.disablePlugin();
                this.sidebarPlugin.disablePlugin();
                this.currentPlugin = 'none';
                break;
            case 'inline':
                // Enable the inline plugin and disable the sidebar plugin
                this.inlinePlugin.enablePlugin();
                this.sidebarPlugin.disablePlugin();
                this.currentPlugin = 'inline';
                break;
            case 'sidebar':
                // Enable the sidebar plugin and disable the inline plugin
                this.sidebarPlugin.enablePlugin();
                this.inlinePlugin.disablePlugin();
                this.currentPlugin = 'sidebar';
                break;
        }
        dropdown.isOpen = false;
        dropdown.buttonView.set({label: this.currentPlugin.charAt(0).toUpperCase() + this.currentPlugin.slice(1)});
        button.set({isEnabled: false});
        this.currentButton = button;
    }
}
