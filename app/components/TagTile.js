import React, {useContext} from "react"
import {Link} from "react-router-dom"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faHeart, faUser} from "@fortawesome/free-solid-svg-icons"

//Contexts
import StateContext from "../contexts/StateContext"
import DispatchContext from "../contexts/DispatchContext"

function TagTile(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  function closeSearch() {
    if (appState.searchOpen) {
      appDispatch({type: "closeSearch"})
    }
  }

  return (
    <Link onClick={closeSearch} to={`/tag/${props.tag.slug}`} className="tag-tile">
      <div className="tag-tile__info">
        <span className="tag-tile__username">{props.tag.name}</span>
      </div>
    </Link>
  )
}

export default TagTile
