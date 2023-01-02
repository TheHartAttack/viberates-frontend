import React, {useEffect, useContext, useRef} from "react"
import {withRouter, useParams} from "react-router-dom"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faImage, faTrashAlt, faFileUpload, faPlus, faPlusCircle, faTimes, faMinusCircle, faGripLines} from "@fortawesome/free-solid-svg-icons"
import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd"

//Contexts
import StateContext from "../contexts/StateContext"
import DispatchContext from "../contexts/DispatchContext"
import ArtistStateContext from "../contexts/ArtistStateContext"
import ArtistDispatchContext from "../contexts/ArtistDispatchContext"

//Components
import FormInput from "./form/FormInput"
import FormSubmit from "./form/FormSubmit"

function AddAlbum(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const artistState = useContext(ArtistStateContext)
  const artistDispatch = useContext(ArtistDispatchContext)
  const {artist} = useParams()
  const imageInput = useRef("")
  const trackInput = useRef("")
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()

  useEffect(() => {
    document.addEventListener("keyup", searchKeypressHandler)
    return () => {
      document.removeEventListener("keyup", searchKeypressHandler)
    }
  }, [])

  useEffect(() => {
    if (artistState.addAlbum.submitCount) {
      async function submitAlbum() {
        cancelPreviousRequest()

        artistDispatch({type: "startSubmitting"})

        try {
          const formData = new FormData()
          if (artistState.addAlbum.title) {
            formData.append("title", artistState.addAlbum.title)
          }
          if (artistState.addAlbum.image) {
            formData.append("image", artistState.addAlbum.image)
          }
          if (artistState.addAlbum.releaseDate) {
            formData.append("releaseDate", artistState.addAlbum.releaseDate)
          }
          if (artistState.addAlbum.type) {
            formData.append("type", artistState.addAlbum.type)
          }
          if (artistState.addAlbum.tracklist) {
            const tracklistArray = artistState.addAlbum.tracklist.map(track => {
              return track.name
            })
            formData.append("tracklist", JSON.stringify(tracklistArray))
          }

          const response = await Axios.post(`/add-album/${artist}`, formData, {cancelToken: newCancelToken(), headers: {"Content-Type": "multipart/form-data", authorization: appState.user.token}})

          console.log(response.data)

          if (response.data.success) {
            artistDispatch({type: "setAddAlbumTitle", data: ""})
            artistDispatch({type: "setAddAlbumType", data: "Studio"})
            artistDispatch({type: "setAddAlbumTracklist", data: []})
            artistDispatch({type: "setAddAlbumReleaseDate", data: new Date()})
            artistDispatch({type: "setAddAlbumImage", data: null})
            artistDispatch({type: "setAddAlbumPreview", data: null})
            artistDispatch({type: "finishSubmitting"})
            appDispatch({type: "flashMessage", value: response.data.message})
            props.history.push(`/music/${artist}/${response.data.album.slug}`)
          } else {
            throw new Error(response.data.message)
          }
        } catch (e) {
          if (isCancel(e)) {
            console.log(e)
            return
          }
          appDispatch({type: "flashMessage", value: e.message, warning: true})
          artistDispatch({type: "finishSubmitting"})
          console.log(e)
        }
      }
      submitAlbum()
    }
  }, [artistState.addAlbum.submitCount])

  function handleSubmit(e) {
    e.preventDefault()
    artistDispatch({type: "submit"})
  }

  function handleImage(e) {
    if (e.target.files[0]) {
      artistDispatch({type: "setAddAlbumPreview", data: URL.createObjectURL(e.target.files[0])})
      artistDispatch({type: "setAddAlbumImage", data: e.target.files[0]})
    }
  }

  function deleteImage(e) {
    imageInput.current.value = ""
    artistDispatch({type: "setAddAlbumPreview", data: ""})
    artistDispatch({type: "setAddAlbumImage", data: ""})
  }

  function addTrack(e) {
    e.preventDefault()
    if (trackInput.current.value) {
      artistDispatch({type: "addAlbumTracklistAdd", data: {name: trackInput.current.value, id: new Date().getTime().toString()}})
      trackInput.current.value = ""
    }
  }

  function removeTrack(e, index) {
    e.preventDefault()
    artistDispatch({type: "addAlbumTracklistRemove", data: index})
  }

  function handleOnDragEnd(result) {
    console.log(result)
    if (!result.destination) {
      return
    }
    artistDispatch({type: "addAlbumTracklistReorder", sourceIndex: result.source.index, destIndex: result.destination.index})
  }

  function searchKeypressHandler(e) {
    e.preventDefault()
    if (e.keyCode == 27) {
      artistDispatch({type: "finishAddAlbum"})
    }
    if (document.activeElement == trackInput.current && e.keyCode == 13 && !e.shiftKey) {
      addTrack(e)
    }
  }

  return (
    <>
      <button
        className="add-album__close"
        onClick={e => {
          artistDispatch({type: "finishAddAlbum"})
        }}
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
      <form onSubmit={handleSubmit} className="add-album__form" encType="multipart/form-data">
        <h3 className="add-album__heading">
          Add new <span className="add-album__heading-artist">{artistState.artistData.name}</span> album...
        </h3>

        <div className="form__group image-input add-album__image-input">
          <label className="form__label add-album__image-label" htmlFor="">
            Image
          </label>

          {artistState.addAlbum.preview ? (
            <img className="image-input__preview add-album__image-preview" src={artistState.addAlbum.preview} alt={artistState.addAlbum.image.name ? artistState.addAlbum.image.name : ""} />
          ) : (
            <div className="image-input__placeholder add-album__image-placeholder">
              <FontAwesomeIcon icon={faImage} />
            </div>
          )}

          <div className="image-input__buttons add-album__image-buttons">
            <label className="image-input__label add-album__image-button-label" htmlFor="add-album__image-input">
              <FontAwesomeIcon icon={faFileUpload} />
              <input onChange={handleImage} ref={imageInput} className="image-input__file add-album__image-file" type="file" name="image" id="add-album__image-input" />
            </label>

            <button onClick={deleteImage} className="image-input__delete add-album__image-delete" type="button" disabled={!artistState.addAlbum.preview}>
              <FontAwesomeIcon icon={faTrashAlt} />
            </button>
          </div>
        </div>

        <div className="add-album__inputs">
          <FormInput
            form="album"
            type="text"
            label="Title"
            name="title"
            value={artistState.addAlbum.title}
            autoFocus={true}
            onChange={e => {
              artistDispatch({type: "setAddAlbumTitle", data: e.target.value})
            }}
          />

          <div className="add-album__date-type">
            <FormInput
              form="album"
              type="date"
              label="Release Date"
              name="releaseDate"
              releaseDate={artistState.addAlbum.releaseDate}
              onChange={date => {
                artistDispatch({type: "setAddAlbumReleaseDate", data: date})
              }}
            />

            <FormInput
              form="album"
              type="select"
              label="Type"
              name="type"
              className="add-album__type-select"
              value={artistState.addAlbum.type}
              options={["Studio", "EP", "Live", "Compilation"]}
              onChange={e => {
                artistDispatch({type: "setAddAlbumType", data: e.target.value})
              }}
            />
          </div>
        </div>

        <div className="form__group add-album__tracklist">
          <label className="form__label" htmlFor="album-tracklist">
            Tracklist
          </label>

          {Boolean(artistState.addAlbum.tracklist.length) && (
            <DragDropContext onDragEnd={handleOnDragEnd}>
              <Droppable droppableId="tracks">
                {provided => (
                  <ol className="add-album__tracklist-list" {...provided.droppableProps} ref={provided.innerRef}>
                    {artistState.addAlbum.tracklist.map((track, index) => {
                      return (
                        <Draggable key={track.id} draggableId={track.id} index={index}>
                          {provided => (
                            <li className="add-album__tracklist-track" data-index={index + 1} {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                              <span className="add-album__tracklist-name">{track.name}</span>
                              <FontAwesomeIcon icon={faGripLines} className="add-album__grip-lines" />
                              <button
                                type="button"
                                className="button add-album__tracklist-remove"
                                onClick={e => {
                                  removeTrack(e, index)
                                }}
                              >
                                <FontAwesomeIcon icon={faMinusCircle} />
                              </button>
                            </li>
                          )}
                        </Draggable>
                      )
                    })}
                    {provided.placeholder}
                  </ol>
                )}
              </Droppable>
            </DragDropContext>
          )}

          <div className="add-album__tracklist-input-wrapper">
            <input
              type="text"
              name="track-1"
              className="add-album__tracklist-input form__input"
              ref={trackInput}
              placeholder="Add a track..."
              autoComplete="off"
              onKeyDown={e => {
                if (e.keyCode == 13) {
                  e.preventDefault()
                }
              }}
            />
            <button type="button" className="button add-album__tracklist-add" onClick={addTrack}>
              <FontAwesomeIcon icon={faPlusCircle} />
            </button>
          </div>
        </div>

        <FormSubmit className="add-album__submit" icon={faPlus} submitting={artistState.addAlbum.submitting} disabled={!artistState.addAlbum.title || !artistState.addAlbum.releaseDate || !artistState.addAlbum.type}>
          <span>Add album to database</span>
        </FormSubmit>
      </form>
    </>
  )
}

export default withRouter(AddAlbum)
