import React, {useEffect} from "react"
import DatePicker from "react-datepicker"
import TextAreaAutosize from "react-textarea-autosize"

function FormInput(props) {
  if (props.type == "text" || props.type == "password") {
    return (
      <div className="form__group">
        {props.label ? (
          <label className="form__label" htmlFor={`${props.form ? `${props.form}-` : ""}${props.name}`}>
            {props.label}
          </label>
        ) : (
          ""
        )}
        <input onChange={props.onChange} onFocus={props.onFocus ? props.onFocus : ""} onBlur={props.onBlur ? props.onBlur : ""} autoComplete="off" className="form__input" type={props.type} name={props.name} id={`${props.form ? `${props.form}-` : ""}${props.name}`} placeholder={`${props.placeholder ? props.placeholder : ""}`} value={props.value} />
      </div>
    )
  }

  if (props.type == "date") {
    return (
      <div className="form__group">
        {props.label && (
          <label className="form__label" htmlFor={`${props.form ? `${props.form}-` : ""}${props.name}`}>
            {props.label}
          </label>
        )}
        <DatePicker selected={props.releaseDate} onChange={props.onChange} closeOnScroll={true} dateFormat="dd/MM/yyyy" className="form__input form__input--date" />
      </div>
    )
  }

  if (props.type == "textarea") {
    return (
      <div className="form__group">
        {props.label && (
          <label className="form__label" htmlFor={`${props.form ? `${props.form}-` : ""}${props.name}`}>
            {props.label}
          </label>
        )}
        <TextAreaAutosize onChange={props.onChange} className={`form__input form__textarea ${props.className ? `form__textarea--${props.className}` : ""}`} name={props.name} id={`${props.form ? `${props.form}-` : ""}${props.name}`} placeholder={props.placeholder ? props.placeholder : ""} value={props.value ? props.value : ""} />
      </div>
    )
  }

  if (props.type == "select") {
    return (
      <div className="form__group">
        {props.label && (
          <label className="form__label" htmlFor={`${props.form ? `${props.form}-` : ""}${props.name}`}>
            {props.label}
          </label>
        )}
        <select onChange={props.onChange} className={`form__input form__select ${props.className ? `form__select--${props.className}` : ""} ${props.value}`} name={props.name} id={`${props.form ? `${props.form}-` : ""}${props.name}`} value={props.value}>
          {props.options.map((option, index) => {
            return (
              <option key={index} value={option}>
                {option}
              </option>
            )
          })}
        </select>
      </div>
    )
  }
}

export default FormInput
