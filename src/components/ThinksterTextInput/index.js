import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import getClassNameByArray from '../Shared/getClassNameByArray';

type Props = {
  type: string,
  input: object,
  value: string,
  meta: {
    error: string,
    touched: boolean,
    // warning: string,
  },
  name: string,
  maxLength: int,
  placeholder: string,
};

export default class ThinksterTextInput extends Component {
  static defaultProps = {
    component: 'input',
  };

  props: Props;

  getFormLabelClass() {
    const { input, meta } = this.props;
    let className = 'b-formTextInput';
    if (input.value) {
      className += ' b-formTextInput--hasValue';
    }
    if (meta && meta.touched && !meta.error && input.value) {
      className += ' b-formTextInput--confirm';
    }
    if (meta && meta.touched && meta.error) {
      className += ' b-formTextInput--error';
    }
    return className;
  }

  render() {
    const {
      type,
      input,
      meta,
      name,
      placeholder,
      maxLength,
    } = this.props;
    return (
      <label className={this.getFormLabelClass()}>
        <input
          {...input}
          name={name}
          maxLength={maxLength}
          type={type}
          className="b-formTextInput__input _lr-hide"
        />
        <span className="b-formTextInput__label">
          {placeholder} {meta.touched && meta.error ? `- ${meta.error}` : ''}
        </span>
      </label>
    );
  }
}
