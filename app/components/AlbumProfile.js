import React, {useEffect, useContext} from "react"
import {Link, withRouter, useParams} from "react-router-dom"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faImage, faEdit, faHistory, faPlus, faArrowRight} from "@fortawesome/free-solid-svg-icons"

//Contexts
import StateContext from "../contexts/StateContext"
import AlbumProfileStateContext from "../contexts/AlbumProfileStateContext"
import AlbumProfileDispatchContext from "../contexts/AlbumProfileDispatchContext"

//Components

function AlbumProfile() {
  const appState = useContext(StateContext)
  const albumProfileState = useContext(AlbumProfileStateContext)
  const albumProfileDispatch = useContext(AlbumProfileDispatchContext)
  const {artist, album} = useParams()

  useEffect(() => {
    albumProfileState.albumData.reviews.map(review => {
      if (review.author._id == appState.user._id) {
        albumProfileDispatch({type: "userHasReviewed", data: review._id})
      } else {
        albumProfileDispatch({type: "userHasNotReviewed"})
      }
    })
  }, [albumProfileState.albumData])

  function openEditAlbum(e) {
    e.preventDefault()
    albumProfileDispatch({type: "startEditing"})
  }

  function openAddReview(e) {
    e.preventDefault()
    if (!albumProfileState.userHasReviewed) {
      albumProfileDispatch({type: "startAddReview"})
    }
  }

  return (
    <div className="album-profile">
      {Boolean(albumProfileState.albumData.image) && <img className="album-profile__image" src={albumProfileState.albumData.image} alt={albumProfileState.albumData.title} />}
      {Boolean(!albumProfileState.albumData.image) && (
        <div className="album-profile__placeholder">
          <FontAwesomeIcon icon={faImage} />
        </div>
      )}

      <div className="album-profile__info">
        <div className="album-profile__group">
          {albumProfileState.page != "album" && (
            <Link to={`/music/${albumProfileState.albumData.artist.slug}/${albumProfileState.albumData.slug}`} className="album-profile__title">
              {albumProfileState.albumData.title}
            </Link>
          )}
          {albumProfileState.page == "album" && <h2 className="album-profile__title">{albumProfileState.albumData.title}</h2>}
          <Link to={`/music/${albumProfileState.albumData.artist.slug}`} className="album-profile__artist">
            {albumProfileState.albumData.artist.name}
          </Link>
        </div>

        {albumProfileState.albumData.releaseDate && <div className="album-profile__date">{albumProfileState.albumData.releaseDate.getFullYear()}</div>}

        {Boolean(albumProfileState.albumData.tracklist?.length) && (
          <ol className="album-profile__tracklist">
            {albumProfileState.albumData.tracklist.map((track, index) => {
              return (
                <li key={index} className="album-profile__track">
                  {track}
                </li>
              )
            })}
          </ol>
        )}

        {Boolean(albumProfileState.albumData.tags.length) && Boolean(albumProfileState.albumData.rating) && (
          <div className="album-profile__rating-tags">
            {Boolean(albumProfileState.albumData.tags.length) && (
              <div className="album-profile__tags">
                {albumProfileState.albumData.tags.map((tag, index) => {
                  return (
                    <Link to={`/tag/${tag.slug}`} className="album-profile__tag" key={index}>
                      {tag.name}
                    </Link>
                  )
                })}
              </div>
            )}

            {Boolean(albumProfileState.albumData.rating) && <span className="album-profile__rating">{albumProfileState.albumData.rating ? albumProfileState.albumData.rating : "-"}</span>}
          </div>
        )}
      </div>

      <div className="album-profile__hr"></div>

      {appState.loggedIn && !appState.user.suspended && (
        <ul className="album-profile__links">
          {!albumProfileState.userHasReviewed && (
            <li className="album-profile__link-item">
              <button className="album-profile__link" onClick={openAddReview}>
                <span>Add review</span>
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </li>
          )}

          {albumProfileState.userHasReviewed && (
            <li className="album-profile__link-item">
              <Link to={`/music/${artist}/${album}/${albumProfileState.userHasReviewed}`} className="album-profile__link">
                <span>Read review</span>
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </li>
          )}

          <li className="album-profile__link-item">
            <button className="album-profile__link" onClick={openEditAlbum}>
              <span>Edit album</span>
              <FontAwesomeIcon icon={faEdit} />
            </button>
          </li>

          {albumProfileState.page != "history" && (
            <li className="album-profile__link-item">
              <Link to={`/history/${artist}/${album}`} className="album-profile__link">
                <span>Edit history</span>
                <FontAwesomeIcon icon={faHistory} />
              </Link>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

export default withRouter(AlbumProfile)
