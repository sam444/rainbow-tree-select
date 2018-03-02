import { Component } from 'rainbowui-core'
import PropTypes from 'prop-types'

export default class Action extends Component {

  onClick = (e) => {
    if (typeof this.props.onAction === 'function') {
      this.props.onAction(this.props.actionData)
    }
  }

  render () {
    const { title, className, text } = this.props
    return <i title={title} className={className} onClick={this.onClick}>{text}</i>
  }
}




/**
 * Action component prop types
 */
Action.propTypes = $.extend({}, Component.propTypes, {
    title: PropTypes.string,
    text: PropTypes.string,
    className: PropTypes.string,
    actionData: PropTypes.object,
    onAction: PropTypes.func
});

/**
 * Get Action component default props
 */
Action.defaultProps = $.extend({}, Component.defaultProps, {
});