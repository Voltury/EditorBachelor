import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import {createDropdown} from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import SidebarSuggestion from "../Suggestions/SidebarSuggestions/Sidebar";
import InlineSuggestion from "../Suggestions/InlineSuggestions/Inline";
import DropdownSuggestion from "../Suggestions/DropdownSuggestions/Dropdown";

export default class PluginManager extends Plugin {
    constructor(editor) {
        super(editor);
        this.currentPlugin = null;
        this.currentButton = null;
        this.usingServer = true;
        this.buttonMap = new Map();

        this.manualSelection = null;
        this.dropdpown = null;
    }

    static get requires() {
        return [InlineSuggestion, SidebarSuggestion, DropdownSuggestion]
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
        this.dropdownPlugin = this.editor.plugins.get(DropdownSuggestion.pluginName)
        this.editor.ui.componentFactory.add(PluginManager.buttonName, locale => {
            this.dropdpown = createDropdown(locale);
            const plugins = [this.inlinePlugin, this.sidebarPlugin, this.dropdownPlugin];

            this.dropdpown.buttonView.set({
                label: "None",
                withText: true,
                isOn: false
            });

            // creating the button to disable the suggestion plugins
            this.buttonMap.set(null, new ButtonView(locale));
            const button = this.buttonMap.get(null);
            button.set({
                label: "None",
                withText: true
            });
            button.isEnabled = false;
            this.currentButton = button;
            button.on('execute', () => {
                this.switchPluginInternal(null);
            });
            this.dropdpown.panelView.children.add(button);


            plugins.forEach((plugin, index) => {
                this.buttonMap.set(plugin.constructor.pluginName, new ButtonView(locale));
                const button = this.buttonMap.get(plugin.constructor.pluginName);

                button.set({
                    label: plugin.constructor.labelName,
                    withText: true
                });

                button.on('execute', () => {
                    this.switchPluginInternal(plugin);
                });
                this.dropdpown.panelView.children.add(button);
            });

            this.dropdpown.isEnabled = false;
            return this.dropdpown;
        });
    }

    switchPluginInternal(plugin) {
        this.dropdpown.isOpen = false;
        this.currentButton.set({isEnabled: true})

        // "this.currentPlugin" can never be "plugin" in this function
        this.switchPlugin(plugin);
    }

    switchPlugin(plugin){
        if(this.currentPlugin === plugin) return;

        if (this.currentPlugin) this.currentPlugin.disablePlugin();

        if (plugin) {
            plugin.enablePlugin();
            this.dropdpown.buttonView.set({label: plugin.constructor.labelName});
        }
        else{
            this.dropdpown.buttonView.set({label: "None"});
        }

        const button = this.buttonMap.get(plugin ? plugin.constructor.pluginName : null);
        button.set({isEnabled: false});
        this.currentButton = button;
        this.currentPlugin = plugin;
    }

    enableManualSelection(){
        this.dropdpown.isEnabled = true;
    }

    disableManualSelection(){
        this.dropdpown.isEnabled = false;
    }
}
