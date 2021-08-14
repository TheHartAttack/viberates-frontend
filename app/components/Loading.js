import React, {useEffect} from "react"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faCompactDisc} from "@fortawesome/free-solid-svg-icons"

function Loading(props) {
  return (
    <div className={`loading ${props.fontSize ? `loading--${props.fontSize}` : ""} ${props.firstCol ? "loading--first-col" : ""} ${props.className ? `loading--${props.className}` : ""}`}>
      <FontAwesomeIcon icon={faCompactDisc} />
    </div>
  )
}

export default Loading
