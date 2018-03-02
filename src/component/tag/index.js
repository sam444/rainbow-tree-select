import { Component } from 'rainbowui-core'
import PropTypes from 'prop-types'
import cn from 'classnames/bind'
import styles from '../../css/tag.css'

const cx = cn.bind(styles)

class Button extends Component {
  static propTypes = {
  }

  render() {
    return (
      <button onClick={this.onClick} className={cx('tag-remove')} type='button'>x</button>
    )
  }

  onClick = (e) => {
    // this is needed to stop the drawer from closing
    e.stopPropagation()
    this.props.onDelete(this.props.id)
  }
}

export default class Tag extends Component {

  render() {
    const { id, label, onDelete } = this.props
    return (
      <span className={cx('tag')}>
        {label}
        <Button id={id} onDelete={onDelete} />
      </span>
    )
  }
}


/**
 * Button component prop types
 */
Button.propTypes = $.extend({}, Component.propTypes, {
  id: PropTypes.string.isRequired,
  onDelete: PropTypes.func
});

/**
 * Get Button component default props
 */
Button.defaultProps = $.extend({}, Component.defaultProps, {
});
/**
 * Tag component prop types
 */
Tag.propTypes = $.extend({}, Component.propTypes, {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onDelete: PropTypes.func
});

/**
 * Get Tag component default props
 */
Tag.defaultProps = $.extend({}, Component.defaultProps, {
});