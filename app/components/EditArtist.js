import React, {useEffect, useContext, useRef} from "react"
import {withRouter} from "react-router-dom"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faImage, faTrashAlt, faFileUpload, faSave, faTimes} from "@fortawesome/free-solid-svg-icons"

//Contexts
import ArtistProfileStateContext from "../contexts/ArtistProfileStateContext"
import ArtistProfileDispatchContext from "../contexts/ArtistProfileDispatchContext"

//Components
import FormInput from "./form/FormInput"
import FormSubmit from "./form/FormSubmit"

function EditArtist() {
  const artistProfileState = useContext(ArtistProfileStateContext)
  const artistProfileDispatch = useContext(ArtistProfileDispatchContext)
  const imageInput = useRef("")

  useEffect(() => {
    document.addEventListener("keyup", searchKeypressHandler)
    return () => {
      document.removeEventListener("keyup", searchKeypressHandler)
    }
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    artistProfileDispatch({type: "submit"})
  }

  function handleImage(e) {
    if (e.target.files[0]) {
      artistProfileDispatch({type: "setEditPreview", data: URL.createObjectURL(e.target.files[0])})
      artistProfileDispatch({type: "setEditImage", data: e.target.files[0]})
    }
  }

  function deleteImage(e) {
    imageInput.current.value = ""
    artistProfileDispatch({type: "setEditPreview", data: ""})
    artistProfileDispatch({type: "setEditImage", data: ""})
  }

  function searchKeypressHandler(e) {
    e.preventDefault()
    if (e.keyCode == 27) {
      artistProfileDispatch({type: "finishEditing"})
    }
  }

  function resetEditData() {
    artistProfileDispatch({type: "setEditTitle", data: artistProfileState.artistData.title})
    artistProfileDispatch({type: "setEditImage", data: artistProfileState.artistData.image})
    artistProfileDispatch({type: "setEditPreview", data: artistProfileState.artistData.image})
  }

  return (
    <>
      <button
        className="edit-artist__close"
        onClick={e => {
          artistProfileDispatch({type: "finishEditing"})
        }}
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
      <form onSubmit={handleSubmit} className="edit-artist__form" encType="multipart/form-data">
        <h3 className="edit-artist__heading">
          Edit <span className="edit-artist__heading-artist">{artistProfileState.artistData.name}</span>
        </h3>

        <div className="form__group image-input edit-artist__image-input">
          <label className="form__label edit-artist__image-label" htmlFor="">
            Image
          </label>

          {artistProfileState.edit.preview ? (
            <img className="image-input__preview edit-artist__image-preview" src={artistProfileState.edit.preview} alt={artistProfileState.edit.image.name ? artistProfileState.edit.image.name : ""} />
          ) : (
            <div className="image-input__placeholder edit-artist__image-placeholder">
              <FontAwesomeIcon icon={faImage} />
            </div>
          )}

          <div className="image-input__buttons edit-artist__image-buttons">
            <label className="image-input__label edit-artist__image-button-label" htmlFor="edit-artist__image-input">
              <FontAwesomeIcon icon={faFileUpload} />
              <input onChange={handleImage} ref={imageInput} className="image-input__file edit-artist__image-file" type="file" name="image" id="edit-artist__image-input" />
            </label>

            <button onClick={deleteImage} className="image-input__delete edit-artist__image-delete" type="button" disabled={!artistProfileState.edit.preview}>
              <FontAwesomeIcon icon={faTrashAlt} />
            </button>
          </div>
        </div>

        <div className="edit-artist__inputs">
          <FormInput
            form="artist"
            type="text"
            label="Name"
            name="name"
            value={artistProfileState.edit.name}
            onChange={e => {
              artistProfileDispatch({type: "setEditName", data: e.target.value})
            }}
          />
        </div>

        <div className="edit-artist__buttons">
          <button
            className="button edit-artist__cancel"
            type="button"
            onClick={e => {
              artistProfileDispatch({type: "finishEditing"})
              resetEditData()
            }}
          >
            <span>Cancel</span>
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <FormSubmit className="edit-artist__submit" icon={faSave} submitting={artistProfileState.edit.submitting} disabled={!artistProfileState.edit.name}>
            <span>Save</span>
          </FormSubmit>
        </div>
      </form>
    </>
  )
}

export default withRouter(EditArtist)
