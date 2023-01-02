import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import React, {useEffect} from "react"
import Loading from "../Loading"

function FormSubmit(props) {
  return (
    <button className={`form__submit ${props.className ? props.className : ""}`} type="submit" disabled={props.disabled ? "disabled" : ""}>
      {props.children}
      {props.submitting ? <Loading fontSize={props.fontSize} className="form-submit" /> : <FontAwesomeIcon icon={props.icon} />}
    </button>
  )
}

export default FormSubmit
