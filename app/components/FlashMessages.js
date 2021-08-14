import React, {useContext} from "react"
import StateContext from "../contexts/StateContext"

function FlashMessages(props) {
  const appState = useContext(StateContext)

  return (
    <div className="flash">
      {appState.flashMessages.map((msg, index) => {
        return (
          <div key={index} className={`flash__message ${msg.warning ? "flash__message--warning" : "flash__message--success"}`}>
            {msg.value}
          </div>
        )
      })}
    </div>
  )
}

export default FlashMessages
