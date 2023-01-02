import React, {useEffect, useContext, useRef} from "react"
import {withRouter} from "react-router-dom"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faImage, faTrashAlt, faFileUpload, faSave, faPlusCircle, faTimes, faMinusCircle, faGripLines} from "@fortawesome/free-solid-svg-icons"
import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd"

//Contexts
import AlbumProfileStateContext from "../contexts/AlbumProfileStateContext"
import AlbumProfileDispatchContext from "../contexts/AlbumProfileDispatchContext"

//Components
import FormInput from "./form/FormInput"
import FormSubmit from "./form/FormSubmit"

function EditAlbum() {
  const albumProfileState = useContext(AlbumProfileStateContext)
  const albumProfileDispatch = useContext(AlbumProfileDispatchContext)
  const imageInput = useRef("")
  const trackInput = useRef("")

  useEffect(() => {
    document.addEventListener("keyup", searchKeypressHandler)
    return () => {
      document.removeEventListener("keyup", searchKeypressHandler)
    }
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    albumProfileDispatch({type: "submit"})
  }

  function handleImage(e) {
    if (e.target.files[0]) {
      albumProfileDispatch({type: "setEditPreview", data: URL.createObjectURL(e.target.files[0])})
      albumProfileDispatch({type: "setEditImage", data: e.target.files[0]})
    }
  }

  function deleteImage(e) {
    imageInput.current.value = ""
    albumProfileDispatch({type: "setEditPreview", data: ""})
    albumProfileDispatch({type: "setEditImage", data: ""})
  }

  function addTrack(e) {
    e.preventDefault()
    if (trackInput.current.value) {
      albumProfileDispatch({type: "editTracklistAdd", data: {name: trackInput.current.value, id: new Date().getTime().toString()}})
      trackInput.current.value = ""
    }
  }

  function removeTrack(e, index) {
    e.preventDefault()
    albumProfileDispatch({type: "editTracklistRemove", data: index})
  }

  function handleOnDragEnd(result) {
    console.log(result)
    if (!result.destination) {
      return
    }
    albumProfileDispatch({type: "editTracklistReorder", sourceIndex: result.source.index, destIndex: result.destination.index})
  }

  function searchKeypressHandler(e) {
    e.preventDefault()
    if (e.keyCode == 27) {
      albumProfileDispatch({type: "finishEditing"})
    }
    if (document.activeElement == trackInput.current && e.keyCode == 13 && !e.shiftKey) {
      addTrack(e)
    }
  }

  function resetEditData() {
    albumProfileDispatch({type: "setEditTitle", data: albumProfileState.albumData.title})
    albumProfileDispatch({type: "setEditImage", data: albumProfileState.albumData.image})
    albumProfileDispatch({type: "setEditPreview", data: albumProfileState.albumData.image})
    albumProfileDispatch({type: "setEditReleaseDate", data: albumProfileState.albumData.releaseDate})
    albumProfileDispatch({type: "setEditType", data: albumProfileState.albumData.type})
    albumProfileDispatch({
      type: "setEditTracklist",
      data: albumProfileState.albumData.tracklist.map((track, index) => {
        return {name: track, id: `${index.toString()}${track}`}
      })
    })
  }

  return (
    <>
      <button
        className="edit-album__close"
        onClick={e => {
          albumProfileDispatch({type: "finishEditing"})
        }}
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
      <form onSubmit={handleSubmit} className="edit-album__form" encType="multipart/form-data">
        <h3 className="edit-album__heading">
          Edit <span className="edit-album__heading-artist">{albumProfileState.albumData.title}</span>
        </h3>

        <div className="form__group image-input edit-album__image-input">
          <label className="form__label edit-album__image-label" htmlFor="">
            Image
          </label>

          {albumProfileState.edit.preview ? (
            <img className="image-input__preview edit-album__image-preview" src={albumProfileState.edit.preview} alt={albumProfileState.edit.image.name ? albumProfileState.edit.image.name : ""} />
          ) : (
            <div className="image-input__placeholder edit-album__image-placeholder">
              <FontAwesomeIcon icon={faImage} />
            </div>
          )}

          <div className="image-input__buttons edit-album__image-buttons">
            <label className="image-input__label edit-album__image-button-label" htmlFor="edit-album__image-input">
              <FontAwesomeIcon icon={faFileUpload} />
              <input onChange={handleImage} ref={imageInput} className="image-input__file edit-album__image-file" type="file" name="image" id="edit-album__image-input" />
            </label>

            <button onClick={deleteImage} className="image-input__delete edit-album__image-delete" type="button" disabled={!albumProfileState.edit.preview}>
              <FontAwesomeIcon icon={faTrashAlt} />
            </button>
          </div>
        </div>

        <div className="edit-album__inputs">
          <FormInput
            form="album"
            type="text"
            label="Title"
            name="title"
            value={albumProfileState.edit.title}
            onChange={e => {
              albumProfileDispatch({type: "setEditTitle", data: e.target.value})
            }}
          />

          <div className="edit-album__date-type">
            <FormInput
              form="album"
              type="date"
              label="Release Date"
              name="releaseDate"
              releaseDate={albumProfileState.edit.releaseDate}
              onChange={date => {
                albumProfileDispatch({type: "setEditReleaseDate", data: date})
              }}
            />

            <FormInput
              form="album"
              type="select"
              label="Type"
              name="type"
              className="edit-album__type-select"
              value={albumProfileState.edit.type}
              options={["Studio", "EP", "Live", "Compilation"]}
              onChange={e => {
                albumProfileDispatch({type: "setEditType", data: e.target.value})
              }}
            />
          </div>
        </div>

        <div className="form__group edit-album__tracklist">
          <label className="form__label" htmlFor="album-tracklist">
            Tracklist
          </label>

          {Boolean(albumProfileState.edit.tracklist?.length) && (
            <DragDropContext onDragEnd={handleOnDragEnd}>
              <Droppable droppableId="tracks">
                {provided => (
                  <ol className="edit-album__tracklist-list" {...provided.droppableProps} ref={provided.innerRef}>
                    {albumProfileState.edit.tracklist.map((track, index) => {
                      return (
                        <Draggable key={track.id} draggableId={track.id} index={index}>
                          {provided => (
                            <li className="edit-album__tracklist-track" data-index={index + 1} {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                              <span className="edit-album__tracklist-name">{track.name}</span>
                              <FontAwesomeIcon icon={faGripLines} className="edit-album__grip-lines" />
                              <button
                                type="button"
                                className="button edit-album__tracklist-remove"
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

          <div className="edit-album__tracklist-input-wrapper">
            <input
              type="text"
              name="track-1"
              className="edit-album__tracklist-input form__input"
              ref={trackInput}
              placeholder="Add a track..."
              autoComplete="off"
              onKeyDown={e => {
                if (e.keyCode == 13) {
                  e.preventDefault()
                }
              }}
            />
            <button type="button" className="button edit-album__tracklist-add" onClick={addTrack}>
              <FontAwesomeIcon icon={faPlusCircle} />
            </button>
          </div>
        </div>

        <div className="edit-album__buttons">
          <button
            className="button edit-album__cancel"
            type="button"
            onClick={e => {
              albumProfileDispatch({type: "finishEditing"})
              resetEditData()
            }}
          >
            <span>Cancel</span>
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <FormSubmit className="edit-album__submit" icon={faSave} submitting={albumProfileState.edit.submitting} disabled={!albumProfileState.edit.title || !albumProfileState.edit.releaseDate || !albumProfileState.edit.type}>
            <span>Save</span>
          </FormSubmit>
        </div>
      </form>
    </>
  )
}

export default withRouter(EditAlbum)
