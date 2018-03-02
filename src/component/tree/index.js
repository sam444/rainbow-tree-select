import { Component } from 'rainbowui-core'
import PropTypes from 'prop-types'
import TreeNode from '../tree-node'

export default class Tree extends Component {

  shouldRenderNode = (node) => {
    if (this.props.searchModeOn || node.expanded) return true

    const parent = node._parent && this.props.data.get(node._parent)
    // if it has a parent, then check parent's state.
    // otherwise root nodes are always rendered
    return !parent || parent.expanded
  }

  getNodes = (data) => {
    const { onAction, onChange, onCheckboxChange, onNodeToggle, jsonConfig } = this.props
    const items = []
    data.forEach((node, key) => {
      if (this.shouldRenderNode(node)) {
        items.push(<TreeNode key={key} node={node} onChange={onChange} onCheckboxChange={onCheckboxChange} onNodeToggle={onNodeToggle} onAction={onAction} labellabel={jsonConfig.label} />)
      }
    })
    return items
  }

  render() {
    const { data, searchModeOn } = this.props

    return (
      <ul className={`root ${searchModeOn ? 'searchModeOn' : ''}`}>
        {this.getNodes(data)}
      </ul>
    )
  }
}



/**
 * Tree component prop types
 */
Tree.propTypes = $.extend({}, Component.propTypes, {
  data: PropTypes.object,
  searchModeOn: PropTypes.bool,
  onChange: PropTypes.func,
  onNodeToggle: PropTypes.func,
  onAction: PropTypes.func,
  onCheckboxChange: PropTypes.func,
  jsonConfig: PropTypes.shape({
    id: PropTypes.string,
    children: PropTypes.string,
    label: PropTypes.string
  })

});

/**
 * Get Tree component default props
 */
Tree.defaultProps = $.extend({}, Component.defaultProps, {
});