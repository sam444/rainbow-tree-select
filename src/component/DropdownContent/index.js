import { Component } from 'rainbowui-core'
import PropTypes from 'prop-types';

export default class DropdownContent extends Component {
  render() {
    const { children, className, ...dropdownContentProps } = this.props;
    dropdownContentProps.className = `dropdown__content ${className}`;

    return (
      <div {...dropdownContentProps}>
        {children}
      </div>
    );
  }
}

DropdownContent.displayName = 'DropdownContent';



/**
 * DropdownContent component prop types
 */
DropdownContent.propTypes = $.extend({}, Component.propTypes, {
  children: PropTypes.node,
  className: PropTypes.string
});

/**
 * Get DropdownTreeSelect component default props
 */
DropdownContent.defaultProps = $.extend({}, Component.defaultProps, {
  className: '',
});