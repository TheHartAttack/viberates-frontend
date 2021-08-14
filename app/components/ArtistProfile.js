import React, {useContext} from "react"
import {Link} from "react-router-dom"
import StateContext from "../contexts/StateContext"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faUsers} from "@fortawesome/free-solid-svg-icons"

function ArtistProfile(props) {
  const appState = useContext(StateContext)

  return (
    <div className="artist-profile">
      {Boolean(props.artistData.image) && <img className="artist-profile__image" src={props.artistData.image} alt={props.artistData.name} />}
      {Boolean(!props.artistData.image) && (
        <div className="artist-profile__no-image">
          <FontAwesomeIcon icon={faUsers} />
        </div>
      )}

      <div className="artist-profile__info">
        {props.page != "artist" && (
          <Link to={`/music/${props.artistData.slug}`} className="artist-profile__name">
            {props.artistData.name}
          </Link>
        )}
        {props.page == "artist" && <h2 className="artist-profile__name">{props.artistData.name}</h2>}

        {props.artistData.tags.length ? (
          <div className="artist-profile__tags">
            {props.artistData.tags.map(tag => {
              return (
                <Link to={`/tag/${tag.slug}`} className="artist-profile__tag" key={tag._id}>
                  {tag.name}
                </Link>
              )
            })}
          </div>
        ) : (
          ""
        )}

        {appState.loggedIn && !appState.user.suspended && (
          <ul className="artist-profile__links">
            <li>
              <Link to={`/edit/${props.artist}`} className="artist-profile__link">
                Edit artist
              </Link>
            </li>

            {props.page != "add-album" && (
              <li>
                <Link to={`/add-album/${props.artist}`} className="artist-profile__link">
                  Add album
                </Link>
              </li>
            )}

            {props.page != "artist-edit-history" && (
              <li>
                <Link to={`/edit-history/${props.artist}`} className="artist-profile__link">
                  Edit history
                </Link>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}

export default ArtistProfile
