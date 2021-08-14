import React, {useContext} from "react"
import {Link} from "react-router-dom"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faImage} from "@fortawesome/free-solid-svg-icons"

//Contexts
import StateContext from "../contexts/StateContext"
import DispatchContext from "../contexts/DispatchContext"

function ArtistTile(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  function closeSearch() {
    if (appState.searchOpen) {
      appDispatch({type: "closeSearch"})
    }
  }

  return (
    <Link onClick={closeSearch} to={`/music/${props.artist.slug}`} className="artist-tile">
      {props.artist.image && <img className="artist-tile__image" src={props.artist.image} />}
      {!props.artist.image && (
        <div className="artist-tile__no-image">
          <FontAwesomeIcon icon={faImage} />
        </div>
      )}
      <div className="artist-tile__info">
        <span className="artist-tile__artist">{props.artist.name}</span>
      </div>
    </Link>
  )
}

export default ArtistTile
