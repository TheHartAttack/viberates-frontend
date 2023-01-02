import React, {useEffect, useContext, useRef} from "react"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {withRouter, Redirect, Link} from "react-router-dom"
import {useImmer} from "use-immer"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faTimes, faArrowRight, faImage, faFileUpload, faTrashAlt, faSave} from "@fortawesome/free-solid-svg-icons"

//Contexts
import StateContext from "../contexts/StateContext"
import DispatchContext from "../contexts/DispatchContext"

//Components
import Page from "./Page"
import FormInput from "./form/FormInput"
import ImageInput from "./form/ImageInput"
import FormSubmit from "./form/FormSubmit"

function AddArtist(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const imageInput = useRef("")
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const [state, setState] = useImmer({
    name: "",
    image: "",
    preview: "",
    submitting: false,
    submitCount: 0
  })

  useEffect(() => {
    if (state.submitCount) {
      async function submitArtist() {
        cancelPreviousRequest()

        setState(draft => {
          draft.submitting = true
        })

        try {
          const formData = new FormData()
          formData.append("name", state.name)
          formData.append("image", state.image)
          const response = await Axios.post("/add-artist", formData, {cancelToken: newCancelToken(), headers: {"Content-Type": "multipart/form-data", authorization: appState.user.token}})

          if (response.data.success) {
            appDispatch({type: "flashMessage", value: response.data.message})
            setState(draft => {
              draft.submitting = false
            })
            props.history.push(`/music/${response.data.artist.slug}`)
          } else {
            throw new Error(response.data.message)
          }
        } catch (e) {
          if (isCancel(e)) {
            console.log(e)
            return
          }
          appDispatch({type: "flashMessage", value: e.message, warning: true})
          setState(draft => {
            draft.submitting = false
          })
          console.log(e)
        }
      }
      submitArtist()
    }
  }, [state.submitCount])

  function handleSubmit(e) {
    e.preventDefault()
    setState(draft => {
      draft.submitCount++
    })
  }

  function handleImage(e) {
    if (e.target.files[0]) {
      setState(draft => {
        draft.preview = URL.createObjectURL(e.target.files[0])
        draft.image = e.target.files[0]
      })
    }
  }

  function deleteImage(e) {
    imageInput.current.value = ""
    setState(draft => {
      draft.preview = ""
      draft.image = ""
    })
  }

  if (!appState.user.token || appState.user.suspended) {
    return <Redirect to={`/`} />
  }

  return (
    <Page title="Add Artist">
      <form onSubmit={handleSubmit} className="add-artist" encType="multipart/form-data">
        <h3 className="add-artist__heading">Add Artist To Database</h3>

        <div className="add-artist__inputs">
          <FormInput
            form="artist"
            type="text"
            label="Name"
            name="name"
            value={state.name}
            onChange={e => {
              setState(draft => {
                draft.name = e.target.value
              })
            }}
          />
        </div>

        <div className="form__group image-input add-artist__image-input">
          <label className="form__label add-artist__image-label" htmlFor="">
            Image
          </label>

          {state.preview ? (
            <img className="image-input__preview add-artist__image-preview" src={state.preview} alt={state.image.name ? state.image.name : ""} />
          ) : (
            <div className="image-input__placeholder add-artist__image-placeholder">
              <FontAwesomeIcon icon={faImage} />
            </div>
          )}

          <div className="image-input__buttons add-artist__image-buttons">
            <label className="image-input__label add-artist__image-button-label" htmlFor="add-artist__image-input">
              <FontAwesomeIcon icon={faFileUpload} />
              <input onChange={handleImage} ref={imageInput} className="image-input__file add-artist__image-file" type="file" name="image" id="add-artist__image-input" />
            </label>

            <button onClick={deleteImage} className="image-input__delete add-artist__image-delete" type="button" disabled={!state.preview}>
              <FontAwesomeIcon icon={faTrashAlt} />
            </button>
          </div>
        </div>

        <div className="add-artist__buttons">
          <button
            className="button add-artist__clear"
            type="button"
            disabled={!state.name && !state.image}
            onClick={e => {
              setState(draft => {
                draft.name = ""
                draft.image = ""
                draft.preview = ""
              })
            }}
          >
            <span>Clear</span>
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <FormSubmit className="add-artist__submit" icon={faSave} submitting={state.submitting} disabled={!state.name}>
            <span>Save</span>
          </FormSubmit>
          <FormSubmit className="add-artist__submit" icon={faSave} submitting={true} disabled={!state.name}>
            <span>Save</span>
          </FormSubmit>
        </div>
      </form>
    </Page>
  )
}

export default withRouter(AddArtist)
