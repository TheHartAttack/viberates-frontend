import React, {useEffect, useContext} from "react"
import {Link, withRouter, useParams} from "react-router-dom"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faUsers, faImage, faTimes, faEdit, faHistory, faPlus, faSave, faTrash} from "@fortawesome/free-solid-svg-icons"

//Contexts
import StateContext from "../contexts/StateContext"
import DispatchContext from "../contexts/DispatchContext"
import ArtistStateContext from "../contexts/ArtistStateContext"
import ArtistDispatchContext from "../contexts/ArtistDispatchContext"
import ArtistProfileStateContext from "../contexts/ArtistProfileStateContext"
import ArtistProfileDispatchContext from "../contexts/ArtistProfileDispatchContext"

//Components
import FormInput from "./form/FormInput"
import ImageInput from "./form/ImageInput"

function ArtistProfile(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const artistState = useContext(ArtistStateContext)
  const artistDispatch = useContext(ArtistDispatchContext)
  const artistProfileState = useContext(ArtistProfileStateContext)
  const artistProfileDispatch = useContext(ArtistProfileDispatchContext)
  const {artist} = useParams()
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()

  //Edit artist
  useEffect(() => {
    if (artistProfileState.edit.submitCount) {
      async function editArtist() {
        cancelPreviousRequest()

        artistProfileDispatch({type: "startSubmitting"})

        try {
          const formData = new FormData()
          if (artistProfileState.edit.name) {
            formData.append("name", artistProfileState.edit.name)
          }
          if (artistProfileState.edit.image) {
            formData.append("image", artistProfileState.edit.image)
          }

          const response = await Axios.post(`/edit/artist/${artist}`, formData, {cancelToken: newCancelToken(), headers: {"Content-Type": "multipart/form-data", authorization: appState.user.token}})

          console.log(response.data)

          if (response.data.success) {
            appDispatch({type: "flashMessage", value: response.data.message})
            artistProfileDispatch({type: "setArtistName", data: response.data.artist.name})
            artistProfileDispatch({type: "setArtistImage", data: response.data.artist.image})
            artistProfileDispatch({type: "finishSubmitting"})
            artistProfileDispatch({type: "finishEditing"})

            if (props.setEditHistoryState) {
              props.setEditHistoryState(draft => {
                draft.editHistory.unshift({
                  _id: 0,
                  target: artistProfileState.artistData._id,
                  user: {
                    username: appState.user.username,
                    slug: appState.user.slug
                  },
                  date: new Date(response.data.date),
                  initial: false,
                  deleted: false,
                  data: {
                    name: response.data.artist.name,
                    image: response.data.artist.image
                  }
                })
              })
            }

            if (response.data.artist.slug != artist) {
              switch (artistProfileState.page) {
                case "artist":
                  props.history.push(`/music/${response.data.artist.slug}`)
                  return

                case "history":
                  props.history.push(`/history/${response.data.artist.slug}`)
                  return

                default:
                  props.history.push(`/music/${response.data.artist.slug}`)
                  return
              }
            }
          } else {
            throw new Error(response.data.message)
          }
        } catch (e) {
          if (isCancel(e)) {
            console.log(e)
            return
          }
          appDispatch({type: "flashMessage", value: e.message, warning: true})
          artistProfileDispatch({type: "finishSubmitting"})
          console.log(e)
        }
      }
      editArtist()
    }
  }, [artistProfileState.edit.submitCount])

  function handleSubmit(e) {
    e.preventDefault()
    artistProfileDispatch({type: "submit"})
  }

  function editArtist(e) {
    e.preventDefault()
    artistProfileDispatch({type: "startEditing"})
  }

  function addAlbum(e) {
    e.preventDefault()
    if (appState.loggedIn && !appState.user.suspended) {
      e.target.blur()
      artistDispatch({type: "startAddAlbum"})
    }
  }

  function cancelAddAlbum(e) {
    e.preventDefault()
    artistDispatch({type: "finishAddAlbum"})
  }

  return (
    <div className="artist-profile">
      {Boolean(artistProfileState.artistData.image) && <img className="artist-profile__image" src={artistProfileState.artistData.image} alt={artistProfileState.artistData.name} />}
      {Boolean(!artistProfileState.artistData.image) && (
        <div className="artist-profile__placeholder">
          <FontAwesomeIcon icon={faUsers} />
        </div>
      )}

      <div className="artist-profile__info">
        {props.page != "artist" && (
          <Link to={`/music/${artistProfileState.artistData.slug}`} className="artist-profile__name">
            {artistProfileState.artistData.name}
          </Link>
        )}
        {props.page == "artist" && <h2 className="artist-profile__name">{artistProfileState.artistData.name}</h2>}

        {artistProfileState.artistData.tags.length ? (
          <div className="artist-profile__tags">
            {artistProfileState.artistData.tags.map(tag => {
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
      </div>

      <div className="artist-profile__hr"></div>

      {appState.loggedIn && !appState.user.suspended && (
        <ul className="artist-profile__links">
          {artistProfileState.page == "artist" && (
            <li className="artist-profile__link-item">
              <button className="artist-profile__link" onClick={addAlbum}>
                <span>Add album</span>
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </li>
          )}

          <li className="artist-profile__link-item">
            <button className="artist-profile__link" onClick={editArtist}>
              <span>Edit artist</span>
              <FontAwesomeIcon icon={faEdit} />
            </button>
          </li>

          {artistProfileState.page != "history" && (
            <li className="artist-profile__link-item">
              <Link to={`/history/${artist}`} className="artist-profile__link">
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

export default withRouter(ArtistProfile)
