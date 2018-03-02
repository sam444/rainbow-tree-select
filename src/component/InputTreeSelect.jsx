/*!
 * React Dropdown Tree Select
 * A lightweight, fast and highly customizable tree select component.
 * Hrusikesh Panda <hrusikesh.panda@dowjones.com>
 * Copyright (c) 2017 Dow Jones, Inc. <support@dowjones.com> (http://dowjones.com)
 * license MIT
 * see https://github.com/dowjones/react-dropdow-tree-select
 */
import { UIInput, UISwitch, Param } from 'rainbowui-core'
import PropTypes, { instanceOf } from 'prop-types'
import cn from 'classnames/bind'
import Dropdown from './Dropdown'
import DropdownTrigger from './DropdownTrigger'
import DropdownContent from './DropdownContent'
import { Util } from 'rainbow-foundation-tools';
import TreeManager from './tree-manager'
import Tree from './tree'
import { TreeInput } from './input'
import styles from '../css/index.css'

const cx = cn.bind(styles)

export default class InputTreeSelect extends UIInput {


    constructor(props) {
        super(props)

        this.state = {
            dropdownActive: this.props.showDropdown || false,
            searchModeOn: false,
            inputLiClass: 'inputClass',
            switchState: { switchValue: '' }
        }

        this.onInputChange = this.onInputChange.bind(this)
        this.onDrowdownHide = this.onDrowdownHide.bind(this)
        if (!Util.parseBool(this.props.readOnly)) {
            this.onCheckboxChange = this.onCheckboxChange.bind(this)
            this.onTagRemove = this.onTagRemove.bind(this)
        }
        this.notifyChange = this.notifyChange.bind(this)
        this.onNodeToggle = this.onNodeToggle.bind(this)
        // this.searchInput =  {}
    }

    notifyChange(...args) {
        this.validatorValuePut(...args)
        typeof this.props.onChange === 'function' && this.props.onChange(...args)
        // typeof this.props.onChange === 'function' && this.props.onChange()

    }


    validatorValuePut(curNode, selectedNodes) {
        $("#" + this.componentId + "_validationGroup").val(selectedNodes.length == 0 ? null : selectedNodes.length)
    }

    createList(tree) {
        this.treeManager = new TreeManager(tree, this.props.jsonConfig)
        return this.treeManager.tree
    }

    resetSearch = () => {
        // restore the tree to its pre-search state
        this.setState({ tree: this.treeManager.restoreNodes(), searchModeOn: false, allNodesHidden: false })
        // clear the search criteria and avoid react controlled/uncontrolled warning
        this.searchInput.value = ''
    }



    hashcode(str) {
        var hash = 0, i, chr, len;
        if (str.length === 0) return hash;
        for (i = 0, len = str.length; i < len; i++) {
            chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }

    compareObjects(objA, objB) {
        return this.hashcode(JSON.stringify(objA)) == this.hashcode(JSON.stringify(objB))
    }

    componentDidMount() {

    }

    componentWillMount() {
        super.componentWillMount();

        const tree = this.createList(this.props.data)
        if (tree.size) {
            if (this.props.defaultValue) {
                if (this.props.model[this.props.property] instanceof Array) {
                    this.props.defaultValue.forEach(element => {
                        this.props.model[this.props.property].push(element)
                    });
                }
            }
        }
        let bindModel = this.props.model
        let bindProperty = this.props.property
        let checkNodeIds = []
        if (bindModel && bindProperty) {
            checkNodeIds = bindModel[bindProperty]
            if (checkNodeIds && tree.size > 0) {
                this.treeManager.setNodeCheckedStates(checkNodeIds, true)
            }
        }
        const tags = this.treeManager.getTags(null, this.state.inputLiClass)

        this.setState({ tree, tags })
    }


    componentDidUpdate() {
    }

    componentWillReceiveProps(nextProps) {

        let bindProperty = nextProps.property

        if (nextProps.model && nextProps.property && this.props.model && this.props.property && this.props.data && nextProps.data) {
            if (this.compareObjects(this.props.data, nextProps.data) && this.compareObjects(this.props.model, nextProps.model) && this.compareObjects(this.props.property, nextProps.property)) {
                return
            }
        }

        if (Util.parseBool(nextProps.readOnly)) {
            this.onCheckboxChange = null
            this.onTagRemove = null
        }
        else {
            this.onCheckboxChange = this.onCheckboxChange.bind(this)
            this.onTagRemove = this.onTagRemove.bind(this)
            // this.onDrowdownHide = this.onDrowdownHide.bind(this)
        }

        const tree = this.createList(nextProps.data)
        let bindModel = nextProps.model
        let checkNodeIds = []
        if (bindModel && bindProperty) {
            checkNodeIds = bindModel[bindProperty]
            if (checkNodeIds && tree.size > 0) {
                this.treeManager.setNodeCheckedStates(checkNodeIds, true)
            }
        }
        const tags = this.treeManager.getTags(null, this.state.inputLiClass)
        this.setState({ tree, tags })
    }

    onDrowdownHide() {
        // needed when you click an item in tree and then click back in the input box.
        // react-simple-dropdown behavior is toggle since its single select only
        // but we want the drawer to remain open in this scenario as we support multi select
        if (this.keepDropdownActive) {
            this.dropdown.show()
        } else {
            this.resetSearch()
        }
    }

    contentOnShow() {
        // this.treeManager.toggleNodeExpandState(10000)
        $("#searchInput").focus()
    }

    onInputChange(value) {
        let treeSearchMode = Util.parseBool(this.props.treeSearchMode)
        const { allNodesHidden, tree } = this.treeManager.filterTree(value, treeSearchMode, this.props.jsonConfig.label)
        let searchModeOn = value.length > 0
        if (treeSearchMode) {
            searchModeOn = false
        }
        this.setState({ tree, searchModeOn, allNodesHidden })

    }

    onTagRemove(id) {
        this.onCheckboxChange(null, id, false)

    }

    onNodeToggle(id) {
        this.treeManager.toggleNodeExpandState(id)
        this.setState({ tree: this.treeManager.tree })

        // typeof this.props.onNodeToggle === 'function' && this.props.onNodeToggle(this.treeManager.getNodeById(id))
    }

    onCheckboxChange(event, id, checked) {
        let ids = []
        let nodes = []
        ids.push(id)

        this.treeManager.getNodeIdsByIdRecursive(ids, nodes)
        let curNode = this.treeManager.getNodeById(id)
        let breakFunction = false
        if (this.props.onCheckboxChange) {
            breakFunction = this.props.onCheckboxChange(event, nodes, checked)
        }

        if (!breakFunction) {
            let checkLeafIds = this.treeManager.setNodeCheckedState(id, checked)

            let nodeIds = []
            const tags = this.treeManager.getTags(nodeIds, this.state.inputLiClass)
            // let checkedArr = []
            // this.treeManager.getNodeIdsByIdRecursive(nodeIds, checkedArr)
            this.setState({ tree: this.treeManager.tree, tags })

            let checkedLeafNodeIds = []
            this.treeManager.getNodeIdsByIdRecursive(nodeIds, checkedLeafNodeIds)
            if (this.props.model && this.props.property) {
                this.props.model[this.props.property] = checkedLeafNodeIds
            }
            this.notifyChange(curNode, checkedLeafNodeIds, tags)
        }
    }

    onAction = (actionId, nodeId) => {
        // typeof this.props.onAction === 'function' && this.props.onAction(actionId, this.treeManager.getNodeById(nodeId))
        console.log("onAction")
    }




    copyToClipboard(text) {
        // IE specific
        if (window.clipboardData && window.clipboardData.setData) {
            return clipboardData.setData("Text", text);
        }

        // all other modern
        let target = document.createElement("textarea");
        target.style.position = "absolute";
        target.style.left = "-9999px";
        target.style.top = "0";
        target.textContent = text;
        document.body.appendChild(target);
        target.focus();
        target.setSelectionRange(0, target.value.length);

        // copy the selection of fall back to prompt
        try {
            document.execCommand("copy");
            target.remove();
        } catch (e) {
            console.log("Can't copy string on this browser. Try to use Chrome, Firefox or Opera.")
            window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
        }
    }

    copyLabel(event, value) {
        let label = this.props.jsonConfig.label
        event.preventDefault()
        let result = []
        this.state.tags.forEach(element => {
            result.push(element[label])
        });
        this.copyToClipboard(result.join(this.props.copySplitFlag))

    }

    onSwitchChanged(event) {
        console.log(this.state.switchState)
        if (this.state.switchState.switchValue == 'Y') {
            const { allNodesHidden, tree } = this.treeManager.filterTreeChecked(true)
            let searchModeOn = false
            this.setState({ tree, searchModeOn, allNodesHidden })
        } else {
            let treeSearchMode = Util.parseBool(this.props.treeSearchMode)
            const { allNodesHidden, tree } = this.treeManager.filterTree('', treeSearchMode, this.props.jsonConfig.label)
            let searchModeOn = false
            this.setState({ tree, searchModeOn, allNodesHidden })
        }
    }

    test() {

        // this.dropdown.setShowSign(false)
        const { allNodesHidden, tree } = this.treeManager.filterTreeChecked(true)
        let searchModeOn = false
        this.setState({ tree, searchModeOn, allNodesHidden })
    }


    renderInputComponent() {
        let { jsonConfig } = this.props
        return (
            <div className={cn(this.props.className, 'react-dropdown-tree-select')} required={this.props.required}  >
                <Dropdown disabled={false} ref={el => { this.dropdown = el }} onHide={this.onDrowdownHide} onShow={this.contentOnShow.bind(this)}>
                    <DropdownTrigger className={cx('dropdown-trigger')} style={{ width: this.props.inputWidth }}>
                        <TreeInput
                            inputRef={el => { this.searchInput = el }}
                            tags={this.state.tags}
                            required="true"
                            placeholderText={this.props.placeholderText}
                            onInputChange={this.onInputChange}
                            onFocus={() => { this.keepDropdownActive = true; console.log('onFouce') }}
                            onBlur={() => { this.keepDropdownActive = false }}
                            onTagRemove={this.onTagRemove}
                            mostVisableItem={this.props.mostVisableItem}
                            perItemMaxLength={this.props.perItemMaxLength}
                            labellabel={jsonConfig.label}
                            onCopy={this.copyLabel.bind(this)}
                        // copySplitFlag={this.props.copySplitFlag}
                        />
                        <span onClick={this.test.bind(this)}></span>
                    </DropdownTrigger>
                    <DropdownContent className={cx('dropdown-content')} style={{ width: this.props.contentWidth }}>
                        {/* <input type='text'
                            ref={el => { this.searchInput = el }}
                            placeholder={this.props.placeholderText || 'Search'}
                            onChange={this.onInputChange.bind(this)}
                            onFocus={() => { this.keepDropdownActive = true }}
                            onBlur={() => { this.keepDropdownActive = false }}
                            onCopy={this.copyLabel.bind(this)} /> */}
                        {this.state.allNodesHidden
                            ? <span className='no-matches'>No matches found</span>
                            : (
                                <div>
                                    <UISwitch model={this.state.switchState} property="switchValue" onText="已选" offText="所有" onChange={this.onSwitchChanged.bind(this)} />
                                    <Tree data={this.state.tree}
                                        searchModeOn={this.state.searchModeOn}
                                        onAction={this.onAction}
                                        onCheckboxChange={this.onCheckboxChange}
                                        onNodeToggle={this.onNodeToggle} jsonConfig={jsonConfig} />

                                </div>
                            )
                        }
                    </DropdownContent>
                </Dropdown>
            </div>
        )
    }
}



/**
 * InputTreeSelect component prop types
 */
InputTreeSelect.propTypes = $.extend({}, UIInput.propTypes, {
    data: PropTypes.array.isRequired,
    placeholderText: PropTypes.string,
    showDropdown: PropTypes.bool,
    className: PropTypes.string,
    onChange: PropTypes.func,
    onCheckboxChange: PropTypes.func,
    // onAction: PropTypes.func,
    // onNodeToggle: PropTypes.func,
    defaultValue: PropTypes.array,
    readOnly: PropTypes.bool,
    treeSearchMode: PropTypes.bool,
    mostVisableItem: PropTypes.number,
    copySplitFlag: PropTypes.string,
    perItemMaxLength: PropTypes.number,
    inputWidth: PropTypes.string,
    contentWidth: PropTypes.string,
    jsonConfig: PropTypes.shape({
        id: PropTypes.string,
        children: PropTypes.string,
        label: PropTypes.string
    })
});

/**
 * Get InputTreeSelect component default props
 */
InputTreeSelect.defaultProps = $.extend({}, UIInput.defaultProps, {
    readOnly: false,
    treeSearchMode: true,
    mostVisableItem: 3,
    copySplitFlag: ",",
    perItemMaxLength: 8,
    inputWidth: "400px",
    contentWidth: "400px",
    defaultValue: [],
    jsonConfig: {
        id: "id",
        children: "children",
        label: "label"
    }
});