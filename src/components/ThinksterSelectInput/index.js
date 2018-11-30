import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import getClassNameByArray from '../Shared/getClassNameByArray';

type Props = {
  type: string,
  input: object,
  value: string,
  defaultValue: ?string,
  meta: {
    error: string,
    touched: boolean,
    // warning: string,
  },
  name: string,
  placeholder: string,
};

export default class ThinksterSelectInput extends Component {
  static defaultProps = {
    component: 'input',
  };

  props: Props;

  renderOptions() {
    const {
      data,
      textField,
      valueField,
    } = this.props;
    const optionObjects = data.map(
      entry => typeof entry === 'string'
        ? ({ text: entry, value: entry })
        : ({ text: entry[textField], value: entry[valueField] })
    );

    return optionObjects.map(
      optionObject => (
        <option
          key={optionObject.value}
          value={optionObject.value}
        >
          {optionObject.text}
        </option>
      ),
    );
  }

  getFormLabelClass() {
    const { meta } = this.props;
    console.log(meta);
    console.log(this.props);
    let className = 'b-dropDownSelector';
    if (meta && meta.touched && meta.error) {
      className += ' b-dropDownSelector--error';
    }
    return className;
  }

  render() {
    const {
      input,
      defaultValue,
      placeholder,
      meta,
    } = this.props;

    return (
      <div className={this.getFormLabelClass()}>
        <select
          defaultValue={defaultValue}
          {...input}
          className="b-dropDownSelector__select b-dropDownSelector__selectArrow"
        >
          {this.renderOptions()}
        </select>
        <span className="b-dropDownSelector__label">
          {placeholder} {meta.touched && meta.error ? `- ${meta.error}` : ''}
        </span>
      </div>
    );
  }
}
