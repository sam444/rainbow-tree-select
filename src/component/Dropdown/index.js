import { Component } from 'rainbowui-core'
import PropTypes from 'prop-types';
import cx from 'classnames';
//

import DropdownTrigger from '../DropdownTrigger';
import DropdownContent from '../DropdownContent';

export default class Dropdown extends Component {

  componentDidMount() {
    window.addEventListener('click', this._onWindowClick);
    window.addEventListener('touchstart', this._onWindowClick);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this._onWindowClick);
    window.removeEventListener('touchstart', this._onWindowClick);
  }

  constructor(props) {
    super(props);

    this.state = {
      active: false,
      showSign: true
    };

    this._onWindowClick = this._onWindowClick.bind(this);
    this._onToggleClick = this._onToggleClick.bind(this);
  }

  isActive() {
    return (typeof this.props.active === 'boolean') ?
      this.props.active :
      this.state.active;
  }

  setShowSign(boolValue) {
    this.state.showSign = boolValue
  }

  hide() {
    this.setState({
      active: false
    }, () => {
      if (this.props.onHide) {
        this.props.onHide();
      }
    });
  }

  show() {
    this.setState({
      active: true
    }, () => {
      if (this.props.onShow) {
        this.props.onShow();
      }
    });
  }

  _onWindowClick(event) {
    const dropdownElement = ReactDOM.findDOMNode(this);
    if (!dropdownElement.contains(event.target) && event.target !== dropdownElement && this.isActive()) {
      this.hide();
    }
  }

  _onToggleClick(event) {
    event.preventDefault();
    if (!this.state.showSign) {
      return
    }
    if (this.isActive()) {
      this.hide();
    } else {
      this.show();
    }
  }


  render() {
    const { children, className, disabled, removeElement } = this.props;
    // create component classes
    const active = this.isActive();
    const dropdownClasses = cx({
      dropdown: true,
      'dropdown--active': active,
      'dropdown--disabled': disabled
    });
    // stick callback on trigger element
    const boundChildren = React.Children.map(children, child => {
      if (child.type === DropdownTrigger) {
        const originalOnClick = child.props.onClick;
        child = React.cloneElement(child, {
          ref: 'trigger',
          onClick: (event) => {
            if (!disabled) {
              this._onToggleClick(event);
              if (originalOnClick) {
                originalOnClick.apply(child, arguments);
              }
            }
          }
        });
      } else if (child.type === DropdownContent && removeElement && !active) {
        child = null;
      }
      return child;
    });
    const cleanProps = { ...this.props };
    delete cleanProps.active;
    delete cleanProps.onShow;
    delete cleanProps.onHide;
    delete cleanProps.removeElement;

    return (
      <div
        {...cleanProps}
        className={`${dropdownClasses} ${className}`}>
        {boundChildren}
      </div>
    );
  }
}


export { DropdownTrigger, DropdownContent };

Dropdown.displayName = 'DropdownTrigger';

/**
 * Dropdown component prop types
 */
Dropdown.propTypes = $.extend({}, Component.propTypes, {
  disabled: PropTypes.bool,
  active: PropTypes.bool,
  onHide: PropTypes.func,
  onShow: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
  removeElement: PropTypes.bool,
  style: PropTypes.object

});

/**
 * Get Dropdown component default props
 */
Dropdown.defaultProps = $.extend({}, Component.defaultProps, {
  className: ''
});