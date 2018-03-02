import { Component } from 'rainbowui-core'
import PropTypes from 'prop-types'
import isEmpty from 'lodash/isEmpty'
import Action from './action'
import cn from 'classnames/bind'
import styles from '../../css/treenode.css'

const cx = cn.bind(styles)

export default class TreeNode extends Component {
  static propTypes = {
  }

  render() {
    const { node, onNodeToggle, onCheckboxChange, onAction, labellabel } = this.props
    const actions = node.actions || []
    const isLeaf = isEmpty(node._children)
    const liCx = cx('node', { leaf: isLeaf, tree: !isLeaf, hide: node.hide }, node.className)
    const toggleCx = cx('toggle', { expanded: !isLeaf && node.expanded, collapsed: !isLeaf && !node.expanded })

    return (
      <li className={liCx} style={{ paddingLeft: `${node._depth * 20}px` }}>
        <i className={toggleCx} onClick={() => onNodeToggle(node._id)} />
        <label title={node.title || node[labellabel]}>
          <input type='checkbox'
            name={node._id}
            className='checkbox-item'
            checked={node.checked}
            onChange={e => onCheckboxChange(e, node._id, e.target.checked)}
            value={node.value} />
          <span className='node-label'>{node[labellabel]}</span>
        </label>
        {actions.map((a, idx) => <Action key={`action-${idx}`} {...a} actionData={{ action: a.id, node }} onAction={onAction} />)}
      </li>
    )
  }
}




/**
 * TreeNode component prop types
 */
TreeNode.propTypes = $.extend({}, Component.propTypes, {
  node: PropTypes.shape({
    _id: PropTypes.string,
    _depth: PropTypes.number,
    _children: PropTypes.array,
    actions: PropTypes.array,
    className: PropTypes.string,
    title: PropTypes.string,
    label: PropTypes.string.isRequired,
    checked: PropTypes.bool,
    expanded: PropTypes.bool
  }).isRequired,
  onNodeToggle: PropTypes.func,
  onAction: PropTypes.func,
  onCheckboxChange: PropTypes.func,
  labellabel: PropTypes.string

});

/**
 * Get TreeNode component default props
 */
TreeNode.defaultProps = $.extend({}, Component.defaultProps, {
});