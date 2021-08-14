import React, {useEffect} from "react"
import Loading from "../Loading"

function FormSubmit(props) {
  return (
    <div className="form__group">
      <button className="form__submit button" type="submit" disabled={props.disabled ? "disabled" : ""}>
        {props.disabled ? <Loading fontSize={props.fontSize} /> : props.children}
      </button>
    </div>
  )
}

export default FormSubmit
