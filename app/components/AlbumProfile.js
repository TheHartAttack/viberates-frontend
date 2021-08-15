import React, {useEffect, useState, useContext} from "react"
import {Link} from "react-router-dom"
import StateContext from "../contexts/StateContext"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faImage} from "@fortawesome/free-solid-svg-icons"

function AlbumProfile(props) {
  const appState = useContext(StateContext)
  let [userHasReviewed, setUserHasReviewed] = useState(false)

  useEffect(() => {
    props.albumData.reviews.map(review => {
      if (review.author._id == appState.user._id) {
        setUserHasReviewed(true)
      }
    })
  }, [props.albumData])

  return (
    <div className="album-profile">
      {Boolean(props.albumData.image) && <img className="album-profile__image" src={props.albumData.image} alt={props.albumData.title} />}
      {Boolean(!props.albumData.image) && (
        <div className="album-profile__no-image">
          <FontAwesomeIcon icon={faImage} />
        </div>
      )}

      <div className="album-profile__info">
        <div className="album-profile__group">
          {props.page != "album" && (
            <Link to={`/music/${props.albumData.artist.slug}/${props.albumData.slug}`} className="album-profile__title">
              {props.albumData.title}
            </Link>
          )}
          {props.page == "album" && <h2 className="album-profile__title">{props.albumData.title}</h2>}
          <Link to={`/music/${props.albumData.artist.slug}`} className="album-profile__artist">
            {props.albumData.artist.name}
          </Link>
        </div>

        {props.albumData.releaseDate && <div className="album-profile__date">{props.albumData.releaseDate.getFullYear()}</div>}

        {Boolean(props.albumData.tags.length) && Boolean(props.albumData.rating) && (
          <div className="album-profile__rating-tags">
            {Boolean(props.albumData.tags.length) && (
              <div className="album-profile__tags">
                {props.albumData.tags.map((tag, index) => {
                  return (
                    <Link to={`/tag/${tag.slug}`} className="album-profile__tag" key={index}>
                      {tag.name}
                    </Link>
                  )
                })}
              </div>
            )}

            {Boolean(props.albumData.rating) && <span className="album-profile__rating">{props.albumData.rating ? props.albumData.rating : "-"}</span>}
          </div>
        )}
      </div>

      {appState.loggedIn && !appState.user.suspended && (
        <ul className="album-profile__links">
          <li>
            <Link to={`/edit/${props.artist}/${props.album}`} className="album-profile__link">
              Edit album
            </Link>
          </li>

          {props.page != "add-review" && props.page != "edit-review" && !userHasReviewed && (
            <li>
              <Link to={`/add-review/${props.artist}/${props.album}`} className="album-profile__link">
                Add review
              </Link>
            </li>
          )}

          {props.page != "album-edit-history" && (
            <li>
              <Link to={`/edit-history/${props.artist}/${props.album}`} className="album-profile__link">
                Edit history
              </Link>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

export default AlbumProfile
