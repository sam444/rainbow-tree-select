import { Component } from 'rainbowui-core'
import PropTypes from 'prop-types';

export default class DropdownTrigger extends Component {
  render() {
    const { children, className, ...dropdownTriggerProps } = this.props;
    dropdownTriggerProps.className = `dropdown__trigger ${className}`;

    return (
      <a {...dropdownTriggerProps}>
        {children}
      </a>
    );
  }
}

DropdownTrigger.displayName = 'DropdownTrigger';


/**
 * DropdownTrigger component prop types
 */
DropdownTrigger.propTypes = $.extend({}, Component.propTypes, {
  children: PropTypes.node,
  className: PropTypes.string
});

/**
 * Get DropdownTrigger component default props
 */
DropdownTrigger.defaultProps = $.extend({}, Component.defaultProps, {
  className: '',
});