import React, {useContext} from "react"
import {Link} from "react-router-dom"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faHeart, faUser} from "@fortawesome/free-solid-svg-icons"

//Contexts
import StateContext from "../contexts/StateContext"
import DispatchContext from "../contexts/DispatchContext"

function UserTile(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  function closeSearch() {
    if (appState.searchOpen) {
      appDispatch({type: "closeSearch"})
    }
  }

  return (
    <Link onClick={closeSearch} to={`/user/${props.user.slug}`} className="user-tile">
      {props.user.image ? <img className="user-tile__image" src={props.user.image} /> : <FontAwesomeIcon icon={faUser} />}

      <div className="user-tile__info">
        <span className="user-tile__username">{props.user.username}</span>
        <span className="user-tile__likes">
          <span className="user-tile__like-count">{props.user.likes}</span>
          <FontAwesomeIcon icon={faHeart} />
        </span>
      </div>
    </Link>
  )
}

export default UserTile
