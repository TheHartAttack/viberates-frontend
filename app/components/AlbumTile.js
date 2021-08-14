import React, {useContext} from "react"
import {Link} from "react-router-dom"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faImage} from "@fortawesome/free-solid-svg-icons"

//Contexts
import StateContext from "../contexts/StateContext"
import DispatchContext from "../contexts/DispatchContext"

function AlbumTile(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  function closeSearch() {
    if (appState.searchOpen) {
      appDispatch({type: "closeSearch"})
    }
  }

  return (
    <Link onClick={closeSearch} to={`/music/${props.album.artist.slug}/${props.album.slug}`} className="album-tile">
      {props.album.image && <img className="album-tile__image" src={props.album.image} />}
      {!props.album.image && (
        <div className="album-tile__no-image">
          <FontAwesomeIcon icon={faImage} />
        </div>
      )}
      <div className={`album-tile__info${!props.album.image ? " album-tile__info--no-image" : ""}`}>
        <span className="album-tile__title">{props.album.title}</span>
        <span className="album-tile__artist">{props.album.artist.name}</span>
        <span className="album-tile__rating">{props.album.rating ? props.album.rating : "-"}</span>
      </div>
    </Link>
  )
}

export default AlbumTile
