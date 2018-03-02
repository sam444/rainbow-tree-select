import { Component, UIInput } from 'rainbowui-core'
import PropTypes from 'prop-types'
import cn from 'classnames/bind'
import debounce from 'lodash/debounce'
import Tag from '../tag'
import styles from '../../css/input.css'

const cx = cn.bind(styles)

export default class Input extends UIInput {

  constructor(props) {
    super(props)
    // this.delayedCallback = debounce((e) => {
    //   this.props.onInputChange(e.target.value)
    // }, 50, {
    //     leading: true
    //   })
  }

  // onInputChange = (e) => {
  //   e.persist()
  //   this.delayedCallback(e)
  // }

  getTags(tags = [], onDelete, mostVisableItem) {
    let mostItemCount = 999999999
    if (mostVisableItem > 0) {
      mostItemCount = mostVisableItem
    }
    let { labellabel } = this.props
    return tags.map(
      (tag, i) => {
        if (i >= mostItemCount) {
          return null
        }
        let { _id, tagClassName } = tag

        let label = tag[labellabel]
        if (label.length > this.props.perItemMaxLength) {
          label = label.substr(0, this.props.perItemMaxLength) + "..."
        }
        return (
          <li className={cx('tag-item', tagClassName)} key={`tag-${i}`}>
            <Tag
              label={label}
              id={_id}
              onDelete={onDelete}
            />
          </li>
        )
      }
    )
  }



  render() {
    let uiClass = 'tag-list'
    if (this.props.tags.length > this.props.mostVisableItem) {
      uiClass += ' more'
    }
    return (
      <ul className={cx(uiClass)}>
        {this.getTags(this.props.tags, this.props.onTagRemove, this.props.mostVisableItem)}
      </ul>
    )
  }
}



/**
 * TwoText component prop types
 */
Input.propTypes = $.extend({}, UIInput.propTypes, {
  tags: PropTypes.array,
  value: PropTypes.string,
  placeholderText: PropTypes.string,
  onInputChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onTagRemove: PropTypes.func,
  // inputRef: PropTypes.func,
  mostVisableItem: PropTypes.number,
  copySplitFlag: PropTypes.string,
  perItemMaxLength: PropTypes.number,
  labellabel: PropTypes.string

});

/**
 * Get Input component default props
 */
Input.defaultProps = $.extend({}, UIInput.defaultProps, {
});